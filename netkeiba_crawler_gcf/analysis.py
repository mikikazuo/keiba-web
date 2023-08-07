import pandas as pd
from google.cloud import bigquery

class Analysis:
    # テーブルに付与しているオプションラベル名
    label_key = ['date', 'round', 'place', 'name', 'order1', 'order2', 'order3']

    def __init__(self, bq, now_cnt):
        self.bq = bq
        self.now_cnt = now_cnt
        self.buy_type_cnt = []  # 複数回本クラスを呼ぶためクラス変数ではなくインスタンス変数にする

    def load_data(self, past):
        """
        :param past: 指定週間前のデータを取得する
        """
        dataset_id = f'{self.bq.client.project}.week{str(self.now_cnt - past).zfill(4)}'
        tables = self.bq.client.list_tables(dataset_id)  # Make an API request.
        part_df_list = []
        for table in tables:
            part_df = self.bq.client.list_rows(f'{dataset_id}.{table.table_id}').to_dataframe(
                dtypes={'payback': 'uint32'})
            part_df = part_df.drop('umaban', axis=1)  # 後々馬番を活用するかも...
            for uniq in part_df.buy_type.unique():
                self.buy_type_cnt.append(uniq)
            label_dict = self.bq.client.get_table(f'{dataset_id}.{table.table_id}').labels
            # テーブルのラベル情報追加
            for key in self.label_key:
                part_df[key] = label_dict[key].replace('-', 'ー')  # TODO ラベルで全角ハイフンが使えないため置換対応　googleが対応するまでの一時的措置
            part_df_list.append(part_df)
        self.sum_df = pd.concat(part_df_list)
        formed_datetime = pd.to_datetime(self.sum_df.date, format='%Y年%m月%d日')
        print(
            f'テーブル:{dataset_id}  範囲期間: {min(formed_datetime).date().strftime("%Y年%m月%d日")}～{max(formed_datetime).date().strftime("%Y年%m月%d日")}')
        self.sum_df = self.sum_df.reset_index(drop=True)

    def gen_unique_df(self):
        """
        馬券タイプ＆人気パターンをユニーク化、度数集計、ペイバック合計集計
        """
        unique_list = []
        for buy_type in self.sum_df.buy_type.unique():
            filter_buy_type = self.sum_df[self.sum_df.buy_type == buy_type]
            for popularity in filter_buy_type.popularity.unique():
                filter_popularity = filter_buy_type[filter_buy_type.popularity == popularity]
                # 払い戻し最大の行情報
                mvp = filter_popularity.loc[filter_popularity.payback.idxmax()]
                unique_list.append(
                    [buy_type, popularity, filter_popularity.payback.sum()] +
                    [mvp[key] for key in self.label_key] + [mvp.payback, len(filter_popularity)]
                )
        unique_df = pd.DataFrame(unique_list)
        unique_df.columns = list(self.sum_df.columns) + ['payback_mvp', 'cnt']
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
            bigquery.SchemaField("cnt", "INTEGER", mode="REQUIRED"),
            bigquery.SchemaField("whole_cnt", "INTEGER", mode="REQUIRED"),
        ]

        self.bq.client.delete_table(f"{self.bq.dataset_id}.{table_id}", not_found_ok=True)
        self.bq.create_table(table_id, schema)

        unique_df = self.gen_unique_df()
        data_list = []
        # ペイバック値が最大となるデータを選択する
        for buy_type in unique_df.buy_type.unique():
            filter_buy_type = unique_df[unique_df.buy_type == buy_type]
            top_df = filter_buy_type.loc[filter_buy_type.payback.idxmax()]
            data_list.append(str(tuple(top_df) + (self.buy_type_cnt.count(buy_type),)))
        self.bq.insert_query(table_id, ",".join(data_list))
