import json
import os
from datetime import datetime, timezone, timedelta

import requests
from dateutil.relativedelta import relativedelta
from firebase_admin import initialize_app, firestore
from firebase_functions import https_fn, options
from google.cloud.firestore_v1 import FieldFilter

app = initialize_app()
# リージョン指定　コマンドで指定する場合なくていい　参考　https://zenn.dev/singularity/articles/deploy_firebase_functions_in_different_resion
options.set_global_options(region=options.SupportedRegion.ASIA_NORTHEAST1)


@https_fn.on_request()
def paidy_subscription(req: https_fn.Request) -> https_fn.Response:
    # Firestoreへの接続
    db = firestore.Client()
    start_date = datetime.now(timezone(timedelta(hours=9)))
    docs = list(db.collection('users').where(filter=FieldFilter("nextPayDate", "<=", start_date)).where(
        filter=FieldFilter("paymentType", "==", "paidy")).stream())

    response_message = []

    # 各ドキュメントの内容を表示
    for doc in docs:
        doc_dict = doc.to_dict()
        # リクエストヘッダー
        headers = {"Authorization": "Bearer " + os.environ.get("PD_SECRET_KEY")}
        response = requests.get("https://api.paidy.com/payments/" + doc_dict['paymentId'], headers=headers).json()

        unit_price = 890 if doc_dict['payMonthRange'] == 1 else 8909
        tax = 90 if doc_dict['payMonthRange'] == 1 else 891
        # リクエストボディ
        data = {
            "token_id": doc_dict['subscriptionId'],
            "amount": unit_price + tax,
            "currency": "JPY",
            "description": "逆張り星人",
            "buyer_data": {
                "age": 0,
                "ltv": 0,
                "order_count": 0,
                "last_order_amount": 0,
                "last_order_at": 0,
            },
            "order": {
                "items": [{
                    "quantity": 1,
                    "title": ("１ヶ月" if doc_dict['payMonthRange'] == 1 else "年間") + "プラン",
                    "unit_price": unit_price
                }],
                "tax": tax,
            },
            "shipping_address": {
                "state": response["shipping_address"]["state"],
                "zip": response["shipping_address"]["zip"]
            }
        }

        # POSTリクエストを送信
        response = requests.post("https://api.paidy.com/payments", headers=headers, data=json.dumps(data)).json()
        response = requests.post(f"https://api.paidy.com/payments/{response['id']}/captures", headers=headers,
                                 data=json.dumps({})).json()

        end_date = start_date + relativedelta(months=doc_dict['payMonthRange'])
        db.collection("users").document(doc.id).set({"paymentId": response["id"],
                                                     "subscriptionStartDate": start_date,
                                                     "subscriptionEndDate": end_date,
                                                     "nextPayDate": end_date}, merge=True),
        response_message.append(f"Message with uid {doc.id}, subscriptionId {doc_dict['subscriptionId']} updated.")

    return https_fn.Response("<br>".join(response_message)) if docs else https_fn.Response("None action")
