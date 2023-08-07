from google.cloud import bigquery
from google.cloud.exceptions import NotFound


def get_last_slash_word(url):
    """
    filterはリスト内の空文字を除去する
    :return urlの最後の文字列
    """
    return list(filter(None, url.split('/')))[-1]


class BigQuery:
    def __init__(self, dataset_id):
        self.client = bigquery.Client()
        self.dataset_id = f"{self.client.project}.{dataset_id}"
        self.create_dataset()

    def create_dataset(self):
        try:
            self.client.get_dataset(self.dataset_id)  # Make an API request.
            print("Dataset {} already exists".format(self.dataset_id))
        except NotFound:
            dataset = bigquery.Dataset(self.dataset_id)
            dataset.location = "us-west1"
            dataset = self.client.create_dataset(dataset, timeout=30)  # Make an API request.
            print("Created dataset {}.{}".format(self.client.project, dataset.dataset_id))

    def create_table(self, table_name, schema, labels=None):
        table_id = f"{self.dataset_id}.{table_name}"

        try:
            self.client.get_table(table_id)  # Make an API request.
            print("Table {} already exists.".format(table_id))
        except NotFound:
            table = bigquery.Table(table_id, schema=schema)
            if labels:
                table.labels = labels
            table = self.client.create_table(table)  # Make an API request.
            print("Created table {}.{}.{}".format(table.project, table.dataset_id, table.table_id))

    def insert_query(self, table_name, insert_data):
        query_job = self.client.query(
            f"""
            INSERT `{self.dataset_id}.{table_name}`
            VALUES  {insert_data}
            """
        )
        query_job.result()

    def update_query(self, table_name, update_data, where):
        query_job = self.client.query(
            f"""
            UPDATE `{self.dataset_id}.{table_name}`
            SET {update_data}
            WHERE {where}
            """
        )
        query_job.result()
