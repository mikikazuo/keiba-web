"""
[gcfデプロイコマンド]
is_deployフラグをTrueにすること
--allow-unauthenticated --ingress-settingsオプションで同プロジェクト内のスケジューラ―から呼び出せるようにした

gcloud functions deploy netkeiba-crawl --gen2 --runtime=python311 --region=asia-east1 --source=. --entry-point=hello_http --trigger-http --allow-unauthenticated --ingress-settings=internal-only --memory=1GiB --timeout=3600

空のrequiments.txt用意してpycharm上部に表示されるバナーから自動追加する
もしくは pipreqs --encoding UTF8 . コマンドを使う

google-cloud-bigquery~=3.11.4
functions-framework==3.*
db-dtypes~=1.1.1
は手動で追加した

biguqueryへのアクセス拒否が発生した場合は、bigqueryのデータを全削除するとよい（基本作成者が編集可能となるため、権限idの割り振りがバグっていると思われる）
is_deployフラグFalse時に生成したデータセットはデプロイ側(True)では権限問題で削除できない、基本作った側が削除権利を持つため

gcf上でifでNoneチェックする場合は "is None", "is not None"が必要で省略表記は不可

相互importは不可
"""
from multiprocessing import Process, Queue

from google.cloud import bigquery
from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings

from analysis import Analysis
from cloud_flare import purge_cache
from my_crawler.spiders import mylib
from params import week_cnt_table_id, past_week_max

is_deploy = True
if is_deploy:
    import functions_framework


def start_crawl(now_idx, is_diversion):
    """
    レースデータのクロール
    """

    def crawl(err_queue):
        """
        gcfで動かすための入れ子関数化
        """
        try:
            process = CrawlerProcess(get_project_settings())
            if is_diversion:
                process.crawl("race_crawler", str(now_idx).zfill(4), 0)
            else:  # 初回時に全対象期間分収集
                for i in range(now_idx + 1):
                    process.crawl("race_crawler", str(i).zfill(4), now_idx - i)
            process.start()  # the script will block here until the crawling is finished
            err_queue.put(None)
        except Exception as e:  # process.crawlで割り当て関数内の例外処理が、gcf上ではなんか機能していない
            err_queue.put(e)

    queue = Queue()
    if is_deploy:
        main_process = Process(target=crawl, args=(queue,))
        main_process.start()
        main_process.join()
    else:
        crawl(queue)

    result = queue.get()
    print("restut", result)
    if result is not None:
        raise result


def end_crawl(bq, now_idx, is_diversion):
    """
    過去のクロールデータの削除 & 更新インデックス更新
    """
    if is_diversion:
        # 最古週のデータセットを削除
        bq.client.delete_dataset(f"{bq.client.project}.week{str(now_idx - (past_week_max + 1)).zfill(4)}",
                                 delete_contents=True, not_found_ok=True)  # Make an API request.
        bq.update_query(week_cnt_table_id, f'cnt={now_idx}', f'cnt={now_idx - 1}')
    else:
        bq.insert_query(week_cnt_table_id, f'({now_idx})')


def start_analysis(bq, now_cnt):
    """
    統計分析
    """
    analysis = Analysis(bq, now_cnt)

    analysis.load_data(0)
    analysis.register('week')

    for i in range(1, 4):
        analysis.load_data(i)
    analysis.register('month')

    for i in range(5, 12):
        analysis.load_data(i)
    analysis.register('three_month')


def main(is_retry=False, is_reset=False):
    mylib.BigQuery.is_retry = is_retry
    Analysis.is_retry = is_retry
    schema = [bigquery.SchemaField("cnt", "INTEGER", mode="REQUIRED")]
    bq = mylib.BigQuery('analysis')
    bq.create_table(week_cnt_table_id, schema)
    cnt_df = bq.client.list_rows(f'{bq.dataset_id}.{week_cnt_table_id}').to_dataframe()
    # 過去のスクレイピングデータが存在するかどうか
    is_diversion = len(cnt_df) > 0

    # analysisテーブルのリセット＆全期間のクロールし直し(引数指定オプション)
    if is_reset and is_diversion:
        idx = int(cnt_df.iloc[0])
        for i in range(idx - past_week_max, idx + 2):  # 最新週のスクレイピングが失敗した場合も考慮して+2
            bq.client.delete_dataset(f"{bq.client.project}.week{str(i).zfill(4)}", delete_contents=True,
                                     not_found_ok=True)
        bq.client.delete_dataset(bq.dataset_id, delete_contents=True, not_found_ok=True)
        bq = mylib.BigQuery('analysis')
        bq.create_table(week_cnt_table_id, schema)
        is_diversion = False

    # テーブル名インデックス
    now_idx = cnt_df.iloc[0].cnt + 1 if is_diversion else past_week_max

    start_crawl(now_idx, is_diversion)
    start_analysis(bq, now_idx)
    end_crawl(bq, now_idx, is_diversion)


if is_deploy:
    @functions_framework.http
    def hello_http(request):
        query_params = request.args.to_dict()
        main(query_params.get('retry'), query_params.get('reset'))
        purge_cache()
        return 'ok'
else:
    main()
    purge_cache()

""" TODO 自動ツイート
import tweepy

# API情報を記入
BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAAIPIpAEAAAAAQqFOZVOF2f%2FtWj9UURnmub82xKo%3D54jN4iZtlJIU4cPLdjBcy4I5Gq9HN0U1Bwq33vFPAZAkO4JlDw"
API_KEY = "PlULA9huVUk7cl0SjkB8atEPl"
API_SECRET = "wh9UpbYi557Fc2zBR4dHITGnKcrbJWIRF0aWkAUle9wnS44vSZ"
ACCESS_TOKEN = "1682942311934881793-fHMXA4lJNaEgEzNBlN8oSS8NvjzWoS"
ACCESS_TOKEN_SECRET = "TboliXwD0G6XMUJ86oK2F4BIZvpTIJigaNi3KBf9NMHN3"


# クライアント関数を作成
def ClientInfo():
    client = tweepy.Client(bearer_token=BEARER_TOKEN,
                           consumer_key=API_KEY,
                           consumer_secret=API_SECRET,
                           access_token=ACCESS_TOKEN,
                           access_token_secret=ACCESS_TOKEN_SECRET,
                           )

    return client

# ガター内の緑色のボタンを押すとスクリプトを実行します。
if __name__ == '__main__':
    # オブジェクト作成
    client = tweepy.Client(
        consumer_key=API_KEY ,
        consumer_secret=API_SECRET,
        access_token=ACCESS_TOKEN,
        access_token_secret=ACCESS_TOKEN_SECRET
    )

    # ツイートする
    client.create_tweet(text='テスト')
"""
