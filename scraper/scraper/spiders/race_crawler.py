import scrapy
from datetime import datetime, timedelta

from . import mylib

BUCKET_NAME = "keiba-html"


class RaceCrawlerSpider(scrapy.Spider):
    name = "race_crawler"
    allowed_domains = ['db.netkeiba.com']
    base_url = "https://db.netkeiba.com/"

    # レースデータhtml出力先ディレクトリパス
    output_html_dir = 'test/'
    # 　日本時刻
    dt_now = datetime.utcnow() + timedelta(hours=9)

    def __init__(self, week_no, *args, **kwargs):
        super(RaceCrawlerSpider, self).__init__(*args, **kwargs)
        self.week_no = week_no

    def start_requests(self):
        print(self.dt_now)
        yield scrapy.Request(
            url=f'{self.base_url}?pid=race_top&date={self.dt_now.year}{str(self.dt_now.month).zfill(2)}',
            callback=self.parse)

    def parse(self, response):
        # 月～金の祝日開催の場合でもsunクラスが割り当てられている。
        include_date_url = response.xpath(
            '//td[contains(@class,"sat") or contains(@class,"sun") or contains(@class,"selected")]/a/@href').extract()
        race_list = []
        for date in include_date_url:
            diff_days = (self.dt_now - datetime.strptime(mylib.get_last_slash_word(date), '%Y%m%d')).days
            if 7 * (self.week_no - 1) <= diff_days < 7 * self.week_no:
                race_list.append(self.base_url + date)

        # カレンダーから各日に開催されたレースの一覧へ
        for race_url in race_list:
            if race_url is not None:
                yield scrapy.Request(url=race_url, callback=self.racelist_parse)

    def racelist_parse(self, response):
        race_url_list = response.xpath('//dl[@class="race_top_data_info fc"]/dd/a/@href').extract()
        race_url_list = [self.base_url + x for x in race_url_list]

        # 各レースページヘ
        for race_url in race_url_list:
            if race_url is not None:
                yield scrapy.Request(url=race_url, callback=self.race_parse)

    def race_parse(self, response):
        mylib.write_html(f'{self.week_no}week/', mylib.get_last_slash_word(response.url), response)
