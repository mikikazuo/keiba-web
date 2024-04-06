"use client";

import { auth } from "@/lib/firebaseSDK/firebase-config";
import { IAnalysis } from "@/lib/getDb/analysis";
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { LoadingCircle } from "../shared/icons";
import Card from "./card";

const hideCard = (
  <div className="repeat mt-10 grid w-full max-w-screen-xl animate-fade-up gap-y-10">
    <motion.div className={`flip-card`}>
      <div className="flip-card-inner">
        <div className="flip-card-front gas xe">
          <div className="my-auto text-3xl font-bold">
            有料会員限定公開
            <div className="mt-5 text-sm font-bold">
              上部より 「有料プラン登録」 してください
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  </div>
);

//isDisplayの状態フラグの変更に伴う再レンダリングは、コンポーネントに引数として渡した場合認識されない
//フラグ利用は変数を作ったコンポーネント内で行う必要あり
export default function PremiumCards({ range }: { range: string }) {
  const [isPremium, setIsPremium] = useState(false);
  const [analysis, setAnalysis] = useState<IAnalysis[] | undefined>(undefined);
  const empytCards = [...new Array(8).keys()];

  //json形式のAPI取得 参考 https://dev-harry-next.com/frontend/request-api-by-fetch-function-in-nextjs
  useEffect(() => {
    //onAuthStateChangedをAPI側で呼ぶとログイン直後だとタイミングが早くユーザを認識できてない。
    //（待ちが効いていない、ログイン後状態で改めてページの再読み込みが必要）
    //基本コンポーネント側で呼び出す方がいい。
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsPremium(true);
        fetch(`/api/analytics?range=${range}`, {
          headers: {
            Authorization: `Bearer ${await user.getIdToken(true)}`,
          },
          next: { revalidate: 3600 },
        })
          .then((res) => res.json())
          .then((data) =>
            data.error ? setIsPremium(false) : setAnalysis(data),
          );
      } else setIsPremium(false);
    });
  }, [auth]);

  if (isPremium == false) return hideCard;
  return (
    <div className="repeat mt-10 grid w-full max-w-screen-xl animate-fade-up gap-y-10">
      {analysis?.map((info) => <Card key={info.buy_type} info={info} />) ??
        //空のカード表示
        empytCards.map((info) => (
          <div key={info} className="flip-card front-flip">
            <div className="flip-card-inner">
              <div className="flip-card-front gas he">
                <div className="w-full">
                  <div className="gas he col-span-1 h-[10.5rem] overflow-hidden">
                    <div className="my-auto">
                      <LoadingCircle />
                    </div>
                  </div>
                  <div className="my-2 font-bold text-white">{"　"}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}
