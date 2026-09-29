from datetime import datetime, timedelta
from urllib.parse import urlparse, parse_qs

import scrapy
from google.cloud import bigquery

from . import mylib

import logging


class RaceCrawlerSpider(scrapy.Spider):
    name = "race_crawler"
    allowed_domains = ['race.netkeiba.com']
    # race.netkeiba.com に移行（旧: db.netkeiba.com はサービス終了）
    base_url = "https://race.netkeiba.com"

    # 直前の月曜日の日付を取得 (参考「https://www.nakakamado.com/2022/10/python-weekday.html」)
    week = [0, -1, -2, -3, -4, -5, -6]
    # 直近の日本時刻
    dt_now = datetime.utcnow() + timedelta(hours=9)
    dt_now = dt_now + timedelta(week[dt_now.weekday()])

    def __init__(self, dataset_no, past, *args, **kwargs):
        """
        :param dataset_no: データセット名　週連番
        :param past: 何週前のデータをクロールするか。０なら直近１週間
        """
        super(RaceCrawlerSpider, self).__init__(*args, **kwargs)
        self.bq = mylib.BigQuery(f'week{dataset_no}')
        self.past = past

    def start_requests(self):
        # 中央競馬は基本的に土日（または祝日）に開催されるため、
        # レース開催日である対象週の日曜日を起点に race_list_get_date_list.html API で開催日一覧を取得
        # (self.dt_now は直前の月曜日のため、past週前の日曜日は dt_now - (past*7 + 1)日)
        target_sunday = self.dt_now - timedelta(days=self.past * 7 + 1)
        kaisai_date_str = target_sunday.strftime('%Y%m%d')
        url = (f'{self.base_url}/top/race_list_get_date_list.html'
               f'?kaisai_date={kaisai_date_str}&encoding=UTF-8')
        yield scrapy.Request(url=url, callback=self.parse_date_list)

    def parse_date_list(self, response):
        """
        日付リストAPIのレスポンスを解析し、対象週のレース開催日ごとに
        race_list_sub.html をリクエストする。
        各 <li> タグに date 属性と group 属性がある。

        APIは直近約2週分しか返さないため、目的の週が見つからない場合は
        prevBtn の date 属性をたどって前のページを再帰リクエストする。
        """
        date_items = response.xpath('//li[@date]')
        found = False

        for item in date_items:
            date_str = item.attrib.get('date', '')
            group_str = item.attrib.get('group', '')
            if not date_str or not group_str:
                continue
            try:
                item_date = datetime.strptime(date_str, '%Y%m%d')
            except ValueError:
                continue
            # 対象週（past週前の月曜〜6日後）に属する日付のみ対象
            diff_days = (self.dt_now - item_date).days
            if self.past * 7 <= diff_days < (self.past + 1) * 7:
                found = True
                url = (f'{self.base_url}/top/race_list_sub.html'
                       f'?kaisai_date={date_str}&current_group={group_str}')
                yield scrapy.Request(url=url, callback=self.racelist_parse)

        if not found:
            # 目的の週がまだ過去側にある場合、prevBtn をたどって前のページへ
            prev_date_str = response.xpath('//div[@id="prevBtn"]/@date').get()
            target_sunday = self.dt_now - timedelta(days=self.past * 7 + 1)
            if prev_date_str:
                try:
                    prev_date = datetime.strptime(prev_date_str, '%Y%m%d')
                except ValueError:
                    prev_date = None
                # prevBtnの日付が対象日以上 = さらに前へ行けば目的週がある
                if prev_date and prev_date >= target_sunday:
                    logging.info(
                        f"{self.past}週前のデータが未発見、前ページへ移動: {prev_date_str}")
                    next_url = (f'{self.base_url}/top/race_list_get_date_list.html'
                                f'?kaisai_date={prev_date_str}&encoding=UTF-8')
                    yield scrapy.Request(url=next_url, callback=self.parse_date_list)
                    return
            # これ以上さかのぼれない場合はその週のレースなしとしてスキップ
            logging.warning(
                f"スクレイピング対象なし({self.past}週間前～{self.past + 1}週間前)、スキップします")

    def racelist_parse(self, response):
        """
        race_list_sub.html のレスポンスから各レースの result.html リンクを取得する。
        リンク形式: ../race/result.html?race_id=XXXX&rf=race_list
        """
        parsed_url = parse_qs(urlparse(response.url).query)
        kaisai_date = parsed_url.get('kaisai_date', [''])[0]

        race_href_list = response.xpath(
            '//li[contains(@class,"RaceList_DataItem")]'
            '/a[contains(@href,"result.html")]/@href'
        ).getall()
        for href in race_href_list:
            # race_id パラメータのみ抽出して絶対URLを構築
            parsed = parse_qs(href.split('?')[1]) if '?' in href else {}
            race_id = parsed.get('race_id', [None])[0]
            if race_id:
                yield scrapy.Request(
                    url=f'{self.base_url}/race/result.html?race_id={race_id}',
                    callback=self.race_parse,
                    cb_kwargs={'kaisai_date': kaisai_date}
                )

    def race_parse(self, response, kaisai_date=None):
        """
        個別レース結果ページを解析してBigQueryに保存する。
        新URL: https://race.netkeiba.com/race/result.html?race_id=XXXXXX
        """
        # race_id をURLパラメータから取得（テーブル名として使用）
        parsed_query = parse_qs(urlparse(response.url).query)
        race_id = parsed_query.get('race_id', [None])[0]
        if not race_id:
            logging.warning(f"race_id が取得できません: {response.url}")
            return
        table_name = race_id

        schema = [
            bigquery.SchemaField("buy_type", "STRING", mode="REQUIRED"),
            bigquery.SchemaField("umaban", "STRING", mode="REQUIRED"),
            bigquery.SchemaField("popularity", "STRING", mode="REQUIRED"),
            bigquery.SchemaField("payback", "INTEGER", mode="REQUIRED"),
        ]

        # 開催日（kaisai_date: YYYYMMDD）の特定
        if not kaisai_date:
            import re
            payback_link = response.xpath('//div[@class="Refundlink"]/a/@href').get('')
            match = re.search(r'kaisai_date=(\d{8})', payback_link)
            if match:
                kaisai_date = match.group(1)
        if kaisai_date and len(kaisai_date) == 8:
            date_label = f"{kaisai_date[:4]}年{int(kaisai_date[4:6])}月{int(kaisai_date[6:8])}日"
        else:
            date_label = ""

        # 開催場・ラウンドは RaceData02 の span から取得
        # 構成例: ['4回', '中山', '6日目', 'サラ系２歳', '未勝利', ...]
        race_data02_spans = response.xpath('//div[@class="RaceData02"]/span/text()').getall()
        place = race_data02_spans[1].strip() if len(race_data02_spans) > 1 else ''
        # ラウンド表記: 数字のみ（例: "8"）サイト側で "R" を付与して表示するため
        round_num = str(int(race_id[-2:]))

        # レース名（全角ハイフンをASCIIに変換）
        race_name = response.xpath('//h1[@class="RaceName"]/text()').get('').strip().replace('ー', '-')

        # 着順テーブルの行（HorseList クラスを持つ tr）
        # 列構成: 着順(1), 枠(2), 馬番(3), 馬名(4), 性齢(5), 斤量(6),
        #         騎手(7), タイム(8), 着差(9), 人気(10), 単勝オッズ(11), ...
        horse_rows = response.xpath(
            '//table[contains(@class,"RaceTable01")]//tr[contains(@class,"HorseList")]'
        )

        # 馬番 → 人気 の辞書を構築
        umaban_popularity = {}
        for row in horse_rows:
            umaban = row.xpath('td[3]/div/text()').get('').strip()
            popularity = row.xpath('td[10]/span[@class="OddsPeople"]/text()').get('').strip()
            if umaban and popularity:
                umaban_popularity[umaban] = popularity

        if not umaban_popularity:
            logging.warning(f"馬番→人気マップが空: {response.url}")
            return

        # 1〜3着の馬名を取得するヘルパー（新HTMLの階層構造に対応）
        def get_horse_name(row_index):
            if len(horse_rows) > row_index:
                row = horse_rows[row_index]
                name = (
                    row.xpath('.//span[@class="Horse_Name"]//a/@title').get('') or
                    row.xpath('.//span[@class="HorseNameSpan"]/text()').get('') or
                    row.xpath('string(.//td[contains(@class,"Horse_Info")]//a)').get('') or
                    row.xpath('string(.//td[4]//a)').get('')
                )
                return name.strip()
            return ''

        # 最大着順（全出走馬数）
        rank_nums = [
            int(r.xpath('td[1]/div[@class="Rank"]/text()').get('0').strip())
            for r in horse_rows
            if r.xpath('td[1]/div[@class="Rank"]/text()').get('0').strip().isdecimal()
        ]

        # BigQueryラベル値の制約:
        # 小文字英字、数字、ハイフン、アンダースコア、およびUnicode文字（漢字、ひらがな、カタカナ）が使用可能。
        # 最大63文字。全角長音記号「ー」などはGCPラベル制約のためハイフン「-」に置換。
        def to_label_value(s):
            if not s:
                return ''
            import unicodedata
            import re
            s = unicodedata.normalize('NFKC', str(s))
            s = s.replace('ー', '-').replace('―', '-').replace('‐', '-').replace('－', '-')
            s = s.lower()
            # 許可文字: 漢字、ひらがな、カタカナ、英小文字、数字、ハイフン、アンダースコア
            # それ以外の記号・空白類をハイフンに置換
            s = re.sub(r'[^\w\-]', '-', s)
            s = re.sub(r'-+', '-', s).strip('-')
            return s[:63]

        label = {
            'date': date_label,
            'round': round_num,
            'place': to_label_value(place),
            'name': to_label_value(race_name),
            'order1': to_label_value(get_horse_name(0)),
            'order2': to_label_value(get_horse_name(1)),
            'order3': to_label_value(get_horse_name(2)),
            'max_order': str(max(rank_nums) if rank_nums else 0),
        }
        self.bq.create_table(table_name, schema, label)

        # 払戻テーブルの解析
        # 新構造: <table class="Payout_Detail_Table">
        #   <tr class="Tansho">  → 単勝
        #   <tr class="Fukusho"> → 複勝
        #   <tr class="Wakuren"> → 枠連
        #   <tr class="Umaren">  → 馬連
        #   <tr class="Wide">    → ワイド
        #   <tr class="Umatan">  → 馬単
        #   <tr class="Fuku3">   → 3連複
        #   <tr class="Tan3">    → 3連単
        buy_type_dict = {
            'Tansho': '単勝',
            'Fukusho': '複勝',
            'Wakuren': '枠連',
            'Umaren': '馬連',
            'Wide': 'ワイド',
            'Umatan': '馬単',
            'Fuku3': '三連複',
            'Tan3': '三連単',
        }

        data_list = []
        for tr_class, buy_type_value in buy_type_dict.items():
            rows = response.xpath(f'//tr[@class="{tr_class}"]')
            for row in rows:
                # 配当金額テキスト（複勝・ワイドは複数行 <br> 区切りで結合される）
                payout_text = row.xpath('td[@class="Payout"]/span/text()').get('').strip()
                # 改行で分割して1件ずつの配当文字列リストにする
                payout_values = [p.strip() for p in payout_text.split('\n') if p.strip()]
                if not payout_values:
                    continue

                result_td = row.xpath('td[@class="Result"]')
                ninki_list = [s.strip() for s in row.xpath('td[@class="Ninki"]/span/text()').getall() if s.strip()]

                if tr_class in ('Tansho', 'Fukusho'):
                    # 単勝・複勝: <td class="Result"><div><span>馬番</span></div>...
                    all_umaban = [s.strip() for s in result_td.xpath('div/span/text()').getall() if s.strip()]

                    if tr_class == 'Tansho':
                        # 単勝は1件
                        if all_umaban and payout_values:
                            umaban = all_umaban[0]
                            popularity = umaban_popularity.get(umaban, ninki_list[0] if ninki_list else '')
                            payback = int(payout_values[0].replace('円', '').replace(',', ''))
                            data_list.append(str((buy_type_value, umaban, popularity, payback)))
                    else:
                        # 複勝は馬番・配当・人気が同数
                        for i, (umaban, pv) in enumerate(zip(all_umaban, payout_values)):
                            popularity = umaban_popularity.get(umaban, ninki_list[i] if i < len(ninki_list) else '')
                            payback = int(pv.replace('円', '').replace(',', ''))
                            data_list.append(str((buy_type_value, umaban, popularity, payback)))
                else:
                    # 枠連・馬連・ワイド・馬単・3連複・3連単:
                    # <td class="Result"><ul><li><span>馬番</span></li>...</ul>...
                    ul_list = result_td.xpath('ul')
                    for i, ul in enumerate(ul_list):
                        nums = [s.strip() for s in ul.xpath('li/span/text()').getall() if s.strip()]
                        if not nums:
                            continue
                        pv = payout_values[i] if i < len(payout_values) else ''
                        if not pv:
                            continue
                        payback = int(pv.replace('円', '').replace(',', ''))

                        # 人気番号への置換
                        popularity_list = [umaban_popularity.get(num, num) for num in nums if num.isdecimal()]

                        if tr_class in ('Umatan', 'Tan3'):
                            # 馬単・三連単は着順あり（→ で結合）
                            umaban_str = ' → '.join(nums)
                            words = ' → '.join(popularity_list)
                        else:
                            # 枠連・馬連・ワイド・三連複は順序なし（- で結合、番号昇順）
                            umaban_str = ' - '.join(sorted(nums, key=lambda x: int(x) if x.isdecimal() else 0))
                            sorted_pop = sorted(popularity_list, key=lambda x: int(x) if x.isdecimal() else 0)
                            words = ' - '.join(sorted_pop)

                        data_list.append(str((buy_type_value, umaban_str, words, payback)))

        if data_list:
            self.bq.insert_query(table_name, ",".join(data_list))
        else:
            logging.warning(f"払戻データが空です: {response.url}")
