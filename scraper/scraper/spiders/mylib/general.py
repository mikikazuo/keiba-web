from google.cloud import storage

def get_last_slash_word(url):
    """
    filterはリスト内の空文字を除去する
    :return urlの最後の文字列
    """
    return list(filter(None, url.split('/')))[-1]

def write_html(output_dir_path, file_name, response):
    """
    HTMLだけとってくる
    htmlの記載に「charset=euc-jp」がない場合、encodingの別途指定が必要。
    :param output_dir_path:
    :param file_name: URLのキーのなるid部分
    :param response:
    """
    path = output_dir_path + file_name + '.html'
    # html_file = open(path, 'w', encoding='euc-jp')
    # html_file.write(response.text.replace('\ufffd', ''))  #TODO 使っていないが大丈夫か継続観測 文字コードeuc-jpに変換できない文字削除
    # html_file.close()
    repository("keiba-html", path, response.body)

def repository(bucket_name: str, file_name: str, data: str):
    """upload json file to GCS
    """
    # Select Bucket
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    print(f'Bucket: {bucket.name}')

    # Upload Data
    blob = bucket.blob(file_name)
    blob.upload_from_string(data, content_type='text/html')
    print(f"Uploaded: {file_name}")
