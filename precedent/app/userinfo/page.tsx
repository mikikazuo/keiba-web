"use client";

import { auth, db } from "@/lib/firebaseSDK/firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import type { Metadata } from "next";
import { useEffect, useState } from "react";

export const metadata: Metadata = {
  // 省略
  robots: {
    index: false, // noindexの設定
    googleBot: {
      index: false,
    },
  },
};

export default function Page() {
  const [start, setStart] = useState<string | undefined>(undefined);
  const [end, setEnd] = useState<string | undefined>(undefined);
  const [nextPayDate, setNextPayDate] = useState<string | undefined>(undefined);

  const [subscriptionId, setSubscriptionId] = useState<string | undefined>(
    undefined,
  );
  const [paymentId, setPaymentId] = useState<string | undefined>(undefined);
  const [copied, setCopied] = useState("コピー");

  useEffect(() => {
    try {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setNextPayDate(
              data.nextPayDate?.toDate().toLocaleDateString() ?? "停止中",
            );
            setSubscriptionId(data.subscriptionId);
            setPaymentId(data.paymentId);
            const st = data.subscriptionStartDate?.toDate();
            if (st) {
              setStart(st.toLocaleDateString());
              setEnd(data.subscriptionEndDate?.toDate().toLocaleDateString());
            } else setStart("有料プラン未登録");
          } else {
            setStart("有料プラン未登録");
            setNextPayDate("有料プラン未登録");
          }
        } else {
          setStart(undefined);
          setNextPayDate(undefined);
          setSubscriptionId(undefined);
        }
      });
    } catch (error) {
      throw error;
    }
  }, [auth]);
  return (
    <>
      <div
        className="mx-6 max-w-7xl animate-fade-up text-gray-300"
        style={{ animationDelay: "0.15s", animationFillMode: "forwards" }}
      >
        <h1 className="my-8 text-center text-3xl font-bold text-white md:text-4xl">
          登録情報
        </h1>
        <h1 className="mb-8 mt-12 grid grid-flow-col grid-rows-2 gap-2 text-center font-bold text-white md:text-xl">
          <div className="flex flex-row-reverse">直近の支払済み期間：</div>
          <div className="flex flex-row-reverse"> 次回の支払予定日：</div>
          <div>{start && end ? `${start} ～ ${end}` : start ?? " . . ."}</div>
          <div> {nextPayDate ?? " . . ."}</div>
        </h1>
        <div className="mt-14 flex">
          <div> 自動課金番号：{subscriptionId}</div>
          <button
            className="ml-3 flex rounded-lg border border-gray-200 bg-black p-2 py-1 shadow transition-all hover:bg-white hover:text-black"
            disabled={nextPayDate == "停止中" || nextPayDate == undefined}
            onClick={() => {
              navigator.clipboard.writeText(subscriptionId ?? "");
              setCopied("コピー済");
            }}
          >
            <h5 className="text-xs font-bold">{copied}</h5>
          </button>
        </div>
        <form
          action="https://credit.j-payment.co.jp/link/creditcard/auto-charge/stop"
          method="GET"
        >
          <input type="hidden" name="aid" value="127241" />
          <input type="hidden" name="tid" value={paymentId} />

          <div className="flex">
            退会する場合、以下ボタンからページ遷移後に自動課金番号を入力し進んで下さい。
          </div>
          <button
            className={`${
              nextPayDate == "停止中" || nextPayDate == undefined
                ? "cursor-not-allowed opacity-50"
                : ""
            } group mx-auto mt-7 flex rounded-lg border border-gray-200 bg-black p-3 shadow transition-all hover:bg-red-500 hover:text-white`}
            disabled={nextPayDate == "停止中" || nextPayDate == undefined}
          >
            <h5 className="text-sm font-bold">自動更新を停止する</h5>
          </button>
        </form>
      </div>
    </>
  );
}
