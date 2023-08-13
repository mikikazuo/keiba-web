# keiba-web
競馬サイト

[サイト(precedent)] 
コマンド「firebase experiments:enable webframeworks」でfirebaseがnextjsを認識できるようにする。
ローカルでbigqueryを参照するためにADC 認証情報が必要 https://cloud.google.com/docs/authentication/gcloud?hl=ja#gcloud-credentials

[cloudflareのリダイレクトルール] ブラウザキャッシュが残っている場合はリダイレクトされない。(逆にリダイレクト解除の場合は反映される) cloudflareでパージした場合は、ブラウザキャッシュ、エッジキャッシュ共に消えて、最新の情報を取得する。
