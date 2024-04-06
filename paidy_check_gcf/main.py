import json
import os
from datetime import datetime, timezone, timedelta
from typing import Any

import requests
from dateutil.relativedelta import relativedelta
from firebase_admin import initialize_app, firestore
from firebase_functions import https_fn, options
from google.cloud.firestore_v1 import FieldFilter

app = initialize_app()
options.set_global_options(region=options.SupportedRegion.ASIA_NORTHEAST1)


def output_body(pay_month_range, subscription_id, prefecture, zip_code, uid):
    unit_price = 890 if pay_month_range == 1 else 8909
    tax = 90 if pay_month_range == 1 else 891
    return {
        "token_id": subscription_id,
        "amount": unit_price + tax,
        "currency": "JPY",
        "store_name": "逆張り星人",
        "buyer_data": {
            "age": 0,
            "ltv": 0,
            "order_count": 0,
            "last_order_amount": 0,
            "last_order_at": 0,
        },
        "order": {
            "items": [
                {
                    "quantity": 1,
                    "title": ("１ヶ月" if pay_month_range == 1 else "年間") + "プラン",
                    "unit_price": unit_price,
                },
            ],
            "tax": tax,
        },
        "shipping_address": {
            "state": prefecture,
            "zip": zip_code,
        },
        "metadata": {"uid": uid},
    }


@https_fn.on_request()
def paidy_subscription(req: https_fn.Request) -> https_fn.Response:
    db = firestore.Client()
    start_date = datetime.now(timezone(timedelta(hours=9)))
    docs = list(db.collection('users').where(filter=FieldFilter("nextPayDate", "<=", start_date)).where(
        filter=FieldFilter("paymentType", "==", "paidy")).stream())

    response_message = []
    for doc in docs:
        doc_dict = doc.to_dict()
        headers = {"Authorization": "Bearer " + os.environ.get("PD_SECRET_KEY")}
        response = requests.get("https://api.paidy.com/payments/" + doc_dict['paymentId'], headers=headers)
        if not response.ok:
            return https_fn.Response("Past payments error")
        response = response.json()
        response = requests.post("https://api.paidy.com/payments", headers=headers, data=json.dumps(
            output_body(doc_dict['payMonthRange'], doc_dict['subscriptionId'], response["shipping_address"]["state"],
                        response["shipping_address"]["zip"], response["metadata"]["uid"])))
        if not response.ok:
            return https_fn.Response("Payments error")
        response = response.json()
        response = requests.post(f"https://api.paidy.com/payments/{response['id']}/captures", headers=headers,
                                 data=json.dumps({}))
        if not response.ok:
            return https_fn.Response("Captures error")
        response = response.json()

        end_date = start_date + relativedelta(months=doc_dict['payMonthRange'])
        db.collection("users").document(doc.id).set({"paymentId": response["id"],
                                                     "subscriptionStartDate": start_date,
                                                     "subscriptionEndDate": end_date,
                                                     "nextPayDate": end_date}, merge=True),
        response_message.append(f"Message with uid {doc.id}, subscriptionId {doc_dict['subscriptionId']} updated.")

    return https_fn.Response("<br>".join(response_message)) if docs else https_fn.Response("None action")


@https_fn.on_call()
def paidy_first_subscription(req: https_fn.CallableRequest) -> Any:
    """
    Next.jsの Api Routerでpaidyに対してHTTPリクエストを行ったところ、Cloud Flareでバッドゲートウェイエラーが発生？した
    （ローカル起動であれば問題なかったが、実際にFirebase Hostingにデプロイした本番環境で発生）
    CORSが原因と思われる（reversekeiba ⇒ paidy　ドメインをまたぐ）

    これを回避するため。Cloud Functionsのアプリ呼び出し経由（https_fn.on_call()とhttps_fn.CallableRequestの使用）にした
    url経由の場合、CORSに引っかかるためか、Cloud Functions側で止まった

    シークレットキーはサーバ持ちのため問題なし

    Next.jsでJSON.stringifyで辞書型を文字列化したものを送った場合、文字列を辞書（json.loads）にしてリクエスト時には辞書を文字にする（json.dumps）操作がなぜか必要
    :param req:
    :return:
    """
    uid = req.data['uid']
    if not uid:
        return {'result': 'ng'}
    zip_code = req.data['zip']
    response = requests.get(f"https://zipcloud.ibsnet.co.jp/api/search?zipcode={zip_code}")
    if not response.ok:
        return {'result': 'ng'}
    pay_month_range = req.data['pay_month_range']
    subscription_id = req.data['subscription_id']
    headers = {"Authorization": "Bearer " + os.environ.get("PD_SECRET_KEY")}
    response = requests.post("https://api.paidy.com/payments", headers=headers,
                             data=json.dumps(output_body(pay_month_range, subscription_id,
                                                         response.json()['results'][0]['address1'], zip_code, uid)))
    if not response:
        return {'result': 'ng'}
    response = requests.post(f"https://api.paidy.com/payments/{response.json()['id']}/captures",
                             headers=headers, data=json.dumps({}))
    if not response:
        return {'result': 'ng'}
    db = firestore.Client()
    start_date = datetime.now(timezone(timedelta(hours=9)))
    end_date = start_date + relativedelta(months=pay_month_range)
    db.collection("users").document(uid).set({"paymentType": "paidy",
                                              "payMonthRange": pay_month_range,
                                              "subscriptionId": subscription_id,
                                              "paymentId": response.json()["id"],
                                              "subscriptionStartDate": start_date,
                                              "subscriptionEndDate": end_date,
                                              "nextPayDate": end_date}, merge=True),
    return {'result': 'ok'}
