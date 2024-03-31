from datetime import datetime, timedelta, timezone
from enum import Enum

from dateutil.relativedelta import relativedelta
from firebase_admin import initialize_app, firestore
from firebase_functions import https_fn, options
from google.cloud.firestore_v1 import FieldFilter

app = initialize_app()
# リージョン指定　コマンドで指定する場合なくていい　参考　https://zenn.dev/singularity/articles/deploy_firebase_functions_in_different_resion
options.set_global_options(region=options.SupportedRegion.ASIA_NORTHEAST1)


# class syntax
class Mode(Enum):
    NEW = 1
    UPDATE = 2
    STOP = 3
    ERR = 4


@https_fn.on_request()
def robotpay_subscription(req: https_fn.Request) -> https_fn.Response:
    """
    サブスクペイの決済登録 もしくは 自動更新
    :param req:
    :return:
    """
    # 決済番号
    payment_id = req.args.get("gid")
    # 自動課金番号
    subscription_id = req.args.get("acid")

    mode = Mode.ERR
    if req.args.get("rst") == "1":
        mode = Mode.UPDATE if req.args.get("submit") is None else Mode.NEW
    elif req.args.get("rst") == "4":
        mode = Mode.STOP
    elif payment_id is None or subscription_id is None:
        return https_fn.Response("No text parameter provided", status=400)
    else:
        return https_fn.Response("Error code", status=400)

    db = firestore.client()
    if mode is Mode.NEW:
        db.collection("subscription").document(subscription_id).set({"paymentId": payment_id})
        return https_fn.Response(f"Message with subscriptionId {subscription_id} added.")
    else:
        docs = list(
            db.collection("users")
            .where(filter=FieldFilter("subscriptionId", "==", subscription_id))
            .stream()
        )
        if len(docs) != 1:
            return https_fn.Response(f"subscriptionId {subscription_id} not found.")

        doc = docs[0]
        if mode is Mode.UPDATE:
            start_date = datetime.now(timezone(timedelta(hours=9)))
            end_date = start_date + relativedelta(months=doc.to_dict()['payMonthRange'])
            db.collection("users").document(doc.id).set({"paymentId": payment_id,
                                                         "subscriptionStartDate": start_date,
                                                         "subscriptionEndDate": end_date,
                                                         "nextPayDate": end_date}, merge=True)
            return https_fn.Response(f"Message with uid {doc.id}, subscriptionId {subscription_id} updated.")
        else:
            db.collection("users").document(doc.id).set({"nextPayDate": None}, merge=True)
            return https_fn.Response(f"Message with uid {doc.id}, subscriptionId {subscription_id} stopped.")
