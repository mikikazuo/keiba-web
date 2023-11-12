import pandas as pd
from google.api_core.exceptions import NotFound
from google.cloud import bigquery

from params import week_cnt_table_id, past_week_max


class Analysis:
    is_retry = False
    # テーブルに付与しているオプションラベル名
    label_key = ['date', 'round', 'place', 'name', 'order1', 'order2', 'order3']

    def __init__(self, bq, now_cnt):
        self.bq = bq
        self.now_cnt = now_cnt
        self.buy_type_df = None  # 馬券種と着馬数(取消・除外は含まない)。カウントに使用、複数回呼ぶためクラス変数ではなくインスタンス変数にする
        self.sum_df = None

    def load_data(self, past):
        """
        :param past: 指定週間前のデータを取得する
        """
        dataset_id = f'{self.bq.client.project}.week{str(self.now_cnt - past).zfill(4)}'
        try:  # gcf上ではstart_crawl関数内のcreate_dataset関数のraiseで全終了しない（別プロセッサで動いているせいか？）ため、ここで弾く
            self.bq.client.get_dataset(dataset_id)  # Make an API request.
        except NotFound:
            raise ValueError(f"再スクレイピング不要[解析]")
        tables = self.bq.client.list_tables(dataset_id)  # Make an API request.
        part_df_list = []
        buy_type_df_list = []
        for table in tables:
            part_df = self.bq.client.list_rows(f'{dataset_id}.{table.table_id}').to_dataframe(
                dtypes={'payback': 'uint32'})
            part_df = part_df.drop('umaban', axis=1)  # 後々馬番を活用するかも...
            label_dict = self.bq.client.get_table(f'{dataset_id}.{table.table_id}').labels
            # テーブルのラベル情報追加
            for key in self.label_key:
                part_df[key] = label_dict[key].replace('-', 'ー')  # TODO ラベルで全角ハイフンが使えないため置換対応　googleが対応するまでの一時的措置
            part_df_list.append(part_df)
            # ユニークな馬券種と着馬数
            buy_type_df_list.append(
                pd.DataFrame({'buy_type': part_df.buy_type.unique(), 'max_order': int(label_dict['max_order'])}))
        if not len(part_df_list):
            if past == 0:
                if Analysis.is_retry:  # TODO 年始のスキップ分チェック
                    # 最古週のデータセットを削除
                    self.bq.client.delete_dataset(f"{self.bq.client.project}.week{str(self.now_cnt - (past_week_max + 1)).zfill(4)}",
                                             delete_contents=True, not_found_ok=True)  # Make an API request.
                    self.bq.update_query(week_cnt_table_id , f'cnt={self.now_cnt}', f'cnt={self.now_cnt - 1}')
                    raise ValueError(f'データセット:{dataset_id} の週のレースが存在しないためスキップ')
                else:
                    raise ValueError(f"統合対象なし、数日後に再リトライ予定")
            else:
                print(f'データセット:{dataset_id} の週のレースが存在しないためスキップ')
                return

        self.sum_df = pd.concat(part_df_list) if self.sum_df is None else pd.concat(
            [self.sum_df, pd.concat(part_df_list)])
        self.buy_type_df = pd.concat(buy_type_df_list) if self.buy_type_df is None else pd.concat(
            [self.buy_type_df, pd.concat(buy_type_df_list)])
        formed_datetime = pd.to_datetime(self.sum_df.date, format='%Y年%m月%d日')
        print(
            f'データセット:{dataset_id}  範囲期間: {min(formed_datetime).date().strftime("%Y年%m月%d日")}～{max(formed_datetime).date().strftime("%Y年%m月%d日")}')

    def gen_unique_df(self):
        """
        馬券タイプ＆人気パターンをユニーク化、度数集計、ペイバック合計集計
        """
        unique_list = []
        self.sum_df = self.sum_df.reset_index(drop=True)
        for buy_type in self.sum_df.buy_type.unique():
            filter_buy_type = self.sum_df[self.sum_df.buy_type == buy_type]
            for popularity in filter_buy_type.popularity.unique():
                filter_popularity = filter_buy_type[filter_buy_type.popularity == popularity]
                # 払い戻し最大の行情報
                mvp = filter_popularity.loc[filter_popularity.payback.idxmax()]

                max_popularity = max([int(pop) for pop in popularity.split() if pop.isdecimal()])
                # 指定人気で購入可能なレース数
                buyable_cnt = ((self.buy_type_df.buy_type == buy_type) & (
                        self.buy_type_df.max_order >= max_popularity)).sum()
                buy_type_cnt = (self.buy_type_df.buy_type == buy_type).sum()
                unique_list.append(
                    [buy_type, popularity, filter_popularity.payback.sum()] + [mvp[key] for key in self.label_key] +
                    [mvp.payback, len(filter_popularity), buyable_cnt, buy_type_cnt]
                )
        unique_df = pd.DataFrame(unique_list)
        unique_df.columns = list(self.sum_df.columns) + ['payback_mvp', 'win_cnt', 'buyable_cnt', 'buy_type_cnt']
        return unique_df

    def register(self, table_id):
        schema = [
            bigquery.SchemaField("buy_type", "STRING", mode="REQUIRED"),
            bigquery.SchemaField("popularity", "STRING", mode="REQUIRED"),
            bigquery.SchemaField("payback", "INTEGER", mode="REQUIRED"),
            bigquery.SchemaField("date", "STRING", mode="REQUIRED"),
            bigquery.SchemaField("round", "STRING", mode="REQUIRED"),
            bigquery.SchemaField("place", "STRING", mode="REQUIRED"),
            bigquery.SchemaField("name", "STRING", mode="REQUIRED"),
            bigquery.SchemaField("order1", "STRING", mode="REQUIRED"),
            bigquery.SchemaField("order2", "STRING", mode="REQUIRED"),
            bigquery.SchemaField("order3", "STRING", mode="REQUIRED"),
            bigquery.SchemaField("payback_mvp", "INTEGER", mode="REQUIRED"),
            bigquery.SchemaField("win_cnt", "INTEGER", mode="REQUIRED"),  # 指定人気での勝利数
            bigquery.SchemaField("buyable_cnt", "INTEGER", mode="REQUIRED"),  # 指定人気で購入可能なレース数
            bigquery.SchemaField("buy_type_cnt", "INTEGER", mode="REQUIRED"),  # 指定馬券種販売のレース数
        ]

        self.bq.client.delete_table(f"{self.bq.dataset_id}.{table_id}", not_found_ok=True)
        self.bq.create_table(table_id, schema)

        unique_df = self.gen_unique_df()
        data_list = []
        # ペイバック値が最大となるデータを選択する
        for buy_type in unique_df.buy_type.unique():
            filter_buy_type = unique_df[unique_df.buy_type == buy_type]
            top_df = filter_buy_type.loc[(filter_buy_type.payback / filter_buy_type.buyable_cnt).idxmax()]
            data_list.append(str(tuple(top_df)))
        self.bq.insert_query(table_id, ",".join(data_list))
