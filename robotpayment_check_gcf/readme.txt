firebase initでfunctionを初期化

デプロイは
gcloud functions deploy robotpay_subscription --gen2 --runtime=python311 --region=asia-northeast1 --source=. --entry-point=hello_http --trigger-http --allow-unauthenticated
かfirebase deploy

functionsフォルダがデフォルトの場合生成されるが削除

firebase.jsonの"source": を "."へ変更

main.pyでリージョン指定
options.set_global_options(region=options.SupportedRegion.ASIA_NORTHEAST1)

pycharmでは1プロジェクト1仮想環境のためパス"source": を "."にするためフォルダを分けた

各APIリクエストのクエリパラメータ例
・初回決済
?gid=80317939&rst=1&ap=TestMod&ec=&god=80316455&cod=&am=980&tx=0&sf=0&ta=980&submit=%E8%B3%BC%E5%85%A5&acid=1002297792

・自動更新決済
?gid=80315946&rst=1&cod=&acid=1002288607&am=777&tx=0&sf=0&ta=777&ec=

・課金停止
?gid=80123354&rst=4&cod=&acid=1002293424&ec=