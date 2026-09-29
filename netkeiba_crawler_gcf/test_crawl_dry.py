"""
クロールドライランテスト
BigQueryへの書き込みをモック（スキップ）し、
netkeiba.com からページ取得・パースができるかのみ確認する。

実行方法:
    python test_crawl_dry.py
"""
import logging
from datetime import datetime, timedelta
from unittest.mock import MagicMock, patch

from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings

# ロガー設定（INFO以上を表示）
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s'
)
logger = logging.getLogger(__name__)

# --------------------------------------------------------------------------
# BigQuery をモックに差し替え
# テスト時は実際のBigQuery接続を行わない
# --------------------------------------------------------------------------
mock_bq = MagicMock()
mock_bq.create_table = MagicMock(side_effect=lambda *a, **kw: logger.info(f"[MOCK] create_table: {a}"))
mock_bq.insert_query = MagicMock(side_effect=lambda *a, **kw: logger.info(f"[MOCK] insert_query: {a[0]} 件数:{a[1].count('(')if len(a)>1 else 0}"))

parse_results = []  # パース結果を収集


def run_dry_crawl():
    """
    直近1週間分（past=0）のみをクロールするドライランを実行する
    """
    with patch('my_crawler.spiders.mylib.general.BigQuery', return_value=mock_bq) as mock_bq_cls:
        # BigQuery インスタンス化をモックに差し替え
        mock_bq_cls.return_value = mock_bq

        process = CrawlerProcess(get_project_settings())

        # dataset_no="0000", past=0 → 直近1週間
        process.crawl("race_crawler", "0000", 0)
        process.start()

    logger.info("=" * 60)
    logger.info("ドライランテスト完了")
    logger.info(f"  create_table 呼び出し回数: {mock_bq.create_table.call_count}")
    logger.info(f"  insert_query 呼び出し回数: {mock_bq.insert_query.call_count}")

    if mock_bq.insert_query.call_count > 0:
        logger.info("✅ パース成功: レースデータを取得できました")
    else:
        logger.warning("⚠️  insert_query が0回 → データ取得できなかった可能性あり")
        logger.warning("   robots.txt でブロック、ページ構造変更、対象レースなし、などを確認してください")


if __name__ == '__main__':
    run_dry_crawl()
