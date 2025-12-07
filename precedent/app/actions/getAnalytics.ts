"use server";

import { customInitApp } from "@/lib/firebaseSDK/firebase-admin-config";
import { db } from "@/lib/firebaseSDK/firebase-config";
import { IAnalysis, cardOrder } from "@/lib/getDb/analysis";
import { auth } from "firebase-admin";
import { doc, getDoc } from "firebase/firestore";
const { BigQuery } = require("@google-cloud/bigquery");

customInitApp();

export async function getAnalyticsAction(idToken: string, range: string) {
  customInitApp();
  try {
    // 認証
    const decodedToken = await auth().verifyIdToken(idToken);
    if (!decodedToken) {
      return { error: "Unauthorized" };
    }

    // 支払済み期間内かどうか
    const docRef = doc(db, "users", decodedToken.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { error: "Db not exist" };
    }

    const data = docSnap.data();
    if (!data?.subscriptionEndDate) {
      return { error: "Not subscriptionEndDate" };
    }

    if (new Date() > data.subscriptionEndDate.toDate()) {
      return { error: "SubscriptionEndDate over Error" };
    }

    // BigQueryから取得
    const bigqueryClient = new BigQuery().dataset("analysis");
    const sqlQuery = `SELECT * FROM \`${range}\``;
    const options = {
      query: sqlQuery,
      location: "asia-east1",
    };

    const [rows]: IAnalysis[][] = await bigqueryClient.query(options);
    rows.sort((a, b) =>
      cardOrder.indexOf(a["buy_type"]) < cardOrder.indexOf(b["buy_type"])
        ? -1
        : 1,
    );

    // Server Actionsではシリアライズ可能なデータを返す必要があります
    return { data: JSON.parse(JSON.stringify(rows)) };
  } catch (error) {
    console.error("Server Action Error:", error);
    return {
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : String(error),
    };
  }
}
