from datetime import datetime, timedelta

import scrapy
from google.cloud import bigquery

from . import mylib

import logging

class RaceCrawlerSpider(scrapy.Spider):
    name = "race_crawler"
    allowed_domains = ['db.netkeiba.com']
    # レースタブは最新情報だが、javascriptのため取得できないため、データベースタブから取得
    base_url = "https://db.netkeiba.com"

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
        target_month = [self.dt_now + timedelta(-self.past * 7), self.dt_now + timedelta(-(self.past + 1) * 7 + 1)]
        target_month = list(set(map(lambda x: x.month, target_month)))
        for month in target_month:
            yield scrapy.Request(url=f'{self.base_url}/?pid=race_top&date={self.dt_now.year}{str(month).zfill(2)}',
                                 callback=self.parse)

    def parse(self, response):
        # 月～金の祝日開催の場合でもsunクラスが割り当てられている。
        include_date_url = response.xpath(
            '//td[contains(@class,"sat") or contains(@class,"sun") or contains(@class,"selected")]/a/@href').getall()
        race_list = []
        for date in include_date_url:
            diff_days = (self.dt_now - datetime.strptime(mylib.get_last_slash_word(date), '%Y%m%d')).days
            if self.past <= diff_days / 7 < self.past + 1:
                race_list.append(self.base_url + date)
        if not race_list:  # スクレイピング不可能な場合（取得先の運営の更新が遅れが原因、月曜が祝日の場合など）
            raise ValueError(f"スクレイピング対象なし({self.past}週間前～{self.past + 1}週間前)")
        # カレンダーから各日に開催されたレースの一覧へ
        for race_url in race_list:
            if race_url is not None:
                yield scrapy.Request(url=race_url, callback=self.racelist_parse)

    def racelist_parse(self, response):
        race_url_list = response.xpath('//dl[@class="race_top_data_info fc"]/dd/a/@href').getall()
        race_url_list = [self.base_url + x for x in race_url_list]

        # 各レースページヘ
        for race_url in race_url_list:
            if race_url is not None:
                yield scrapy.Request(url=race_url, callback=self.race_parse)

    def race_parse(self, response):
        table_name = mylib.get_last_slash_word(response.url)
        schema = [
            bigquery.SchemaField("buy_type", "STRING", mode="REQUIRED"),
            bigquery.SchemaField("umaban", "STRING", mode="REQUIRED"),
            bigquery.SchemaField("popularity", "STRING", mode="REQUIRED"),
            bigquery.SchemaField("payback", "INTEGER", mode="REQUIRED"),
        ]
        race_info = response.xpath('//p[@class="smalltxt"]/text()').get().split()
        horse_row = response.xpath('//table[@class="race_table_01 nk_tb_common"]//tr[position()>1]')
        label = {
            'date': race_info[0],
            'round': response.xpath('//div[@class="data_intro"]//dt/text()').get().split()[0],
            'place': race_info[1],
            'name': race_info[2].replace('ー', '-'),  # TODO ラベルで全角ハイフンが使えない　googleが対応するまでの一時的措置
            'order1': horse_row[0].xpath('td[4]/a/text()').get().replace('ー', '-'),
            'order2': horse_row[1].xpath('td[4]/a/text()').get().replace('ー', '-'),
            'order3': horse_row[2].xpath('td[4]/a/text()').get().replace('ー', '-'),
            'max_order': max([int(num) for num in response.xpath(f'//tr/td[@nowrap="nowrap"][1]/text()').getall() if
                              num.isdecimal()])
        }
        self.bq.create_table(table_name, schema, label)

        horse_rows = response.xpath('//table[@class="race_table_01 nk_tb_common"]//tr[position()>1]')
        umaban_popularity = {umaban: popularity for umaban, popularity in
                             zip(horse_rows.xpath('td[3]/text()').getall(),
                                 horse_rows.xpath('td[11]/span/text()').getall())}
        buy_type_dict = {'tan': '単勝', 'fuku': '複勝', 'waku': '枠連', 'uren': '馬連', 'wide': 'ワイド',
                         'utan': '馬単', 'sanfuku': '三連複', 'santan': '三連単'}
        data_list = []
        for buy_type, buy_type_value in buy_type_dict.items():
            payback_datas = response.xpath(f'//th [@class="{buy_type}"]/following-sibling::td/text()').getall()

            if buy_type == 'waku' and payback_datas:  # 枠番となっているため馬連で流用
                for_waku_datas = response.xpath(f'//th [@class="uren"]/following-sibling::td/text()').getall()
                payback_datas[0] = for_waku_datas[0]  # 同着未対応

            # 買い目のパターン数
            key_size = int(len(payback_datas) / 3)
            for i in range(key_size):
                # マークを組み合わせた文字列
                words = payback_datas[i].split()
                popularity_list = []
                mark = None
                for umaban in words:
                    if umaban.isdecimal():  # 記号の場合、人気番への置換スキップ
                        popularity_list.append(umaban_popularity[umaban])
                    else:
                        mark = ' - ' if '-' in words else ' → '
                if mark is None:
                    words = popularity_list[0]
                else:
                    if mark == ' - ':
                        popularity_list = sorted(popularity_list, key=int)
                    words = mark.join(popularity_list)

                data_list.append(str((buy_type_value, payback_datas[i], words,
                                      int(payback_datas[key_size + i].replace(',', '')))))
        self.bq.insert_query(table_name, ",".join(data_list))
