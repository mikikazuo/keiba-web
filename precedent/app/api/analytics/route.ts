import { customInitApp } from "@/lib/firebaseSDK/firebase-admin-config";
import { db } from "@/lib/firebaseSDK/firebase-config";
import { IAnalysis, cardOrder } from "@/lib/getDb/analysis";
import { auth } from "firebase-admin";
import { doc, getDoc } from "firebase/firestore";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
const { BigQuery } = require("@google-cloud/bigquery");

// 関数外でも、このファイルに記載したAPIを呼び出す時に毎回呼ばれる
// Init the Firebase SDK every time the server is called
customInitApp();

export async function GET(request: Request) {
  //認証
  const authorization = headers().get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return NextResponse.json({});
  const idToken = authorization.split("Bearer ")[1];
  const decodedToken = await auth().verifyIdToken(idToken);
  if (!decodedToken)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );

  //支払済み期間内かどうか
  const docRef = doc(db, "users", decodedToken.uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    if (docSnap.data().subscriptionEndDate) {
      if (new Date() > docSnap.data().subscriptionEndDate.toDate())
        return NextResponse.json(
          { error: "SubscriptionEndDate over Error" },
          { status: 200 },
        );
    } else
      return NextResponse.json(
        { error: "Not subscriptionEndDate" },
        { status: 200 },
      );
  } else return NextResponse.json({ error: "Db not exist" }, { status: 500 });

  //取得
  const { searchParams } = new URL(request.url);
  const tableId = searchParams.get("range");

  const bigqueryClient = new BigQuery().dataset("analysis");
  const sqlQuery = `SELECT * FROM \`${tableId}\``;
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
  return NextResponse.json(rows);
}
