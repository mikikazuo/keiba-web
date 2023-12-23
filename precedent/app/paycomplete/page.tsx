"use client";

import { LoadingCircle } from "@/components/shared/icons";
import { auth, db } from "@/lib/firebaseSDK/firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import { Timestamp, deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { ArrowRightCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  const [isPaid, setIsPaid] = useState<boolean | undefined>(undefined);
  const searchParams = useSearchParams();
  /** 自動課金番号 */
  const subscriptionId = searchParams.get("acid");
  /** 決済番号 */
  const paymentId = searchParams.get("gid");
  /** 決済成功かどうか */
  const isSuccess = searchParams.get("rst") == "1";
  /**
   * 購読期間（〇ヶ月）
   * 金額から判別する
   */
  const payMonthRange = Number(searchParams.get("ta")) < 1000 ? 1 : 12;
  useEffect(() => {
    if (!subscriptionId || !paymentId || !isSuccess) {
      setIsPaid(false);
      return;
    }
    let retryCnt = 0;
    const timer = setInterval(async () => {
      const docRef = doc(db, "subscription", subscriptionId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().paymentId == paymentId) {
        await deleteDoc(doc(db, "subscription", subscriptionId));
        clearInterval(timer);

        onAuthStateChanged(auth, (user) => {
          if (user) {
            const startDate = new Date();
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + payMonthRange);
            const setPaidUser = async () =>
              await setDoc(
                doc(db, "users", user.uid),
                {
                  paymentType: "credit",
                  payMonthRange: payMonthRange,
                  subscriptionId: subscriptionId,
                  paymentId: paymentId,
                  subscriptionStartDate: Timestamp.fromDate(startDate),
                  subscriptionEndDate: Timestamp.fromDate(endDate),
                  nextPayDate: Timestamp.fromDate(endDate),
                },
                { merge: true },
              );
            setPaidUser();
            setIsPaid(true);
          }
        });
      } else if (retryCnt > 10) {
        setIsPaid(false);
        clearInterval(timer);
      }
      retryCnt++;
    }, 1000);
  }, [auth]);
  return (
    <>
      <div
        className="mx-6 max-w-7xl animate-fade-up text-gray-300"
        style={{ animationDelay: "0.15s", animationFillMode: "forwards" }}
      >
        <h1 className="my-8 text-center text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
          支払完了
        </h1>
        <h1 className="mb-8 mt-12 text-center font-bold text-gray-900 dark:text-white md:text-xl">
          有料プランのご登録ありがとうございます。
          {/* <br />
          支払完了メールを送信しました。
          <br />
          ご確認ください。 */}
        </h1>
        {isPaid ? (
          <Link
            href="/"
            className="flex justify-between rounded-lg border border-gray-200 p-6 shadow hover:bg-white hover:text-black"
          >
            <h5 className="my-auto mr-3 font-bold  md:text-2xl">
              １ヶ月・3ヶ月分析をチェック
            </h5>
            <ArrowRightCircle className="h-7 w-7 md:h-8 md:w-8" />
          </Link>
        ) : isPaid === undefined ? (
          <div className="my-12 flex flex-col text-center">
            {/* <div>
              手続き中のため、このページのまま30秒～１分ほどお待ち下さい。
            </div> */}
            <div className="mx-auto mt-5">
              <LoadingCircle />
            </div>
          </div>
        ) : (
          <div className="flex justify-between rounded-lg border border-red-400 p-6 shadow">
            <h5 className="my-auto mr-3 font-bold md:text-xl">
              申し訳ございません。エラーが発生しました。
              <br />
              有料プランがご利用いただけない場合、恐れ入りますが、
              <br />
              reversekeiba@gmail.comまでご連絡ください。
            </h5>
          </div>
        )}
      </div>
    </>
  );
}
