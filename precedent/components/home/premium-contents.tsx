"use client";

import { auth } from "@/lib/firebaseSDK/firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const hideCard = (
  <div className="repeat my-10 grid w-11/12 max-w-screen-xl animate-fade-up gap-y-10">
    <motion.div className={`flip-card`}>
      <div className="flip-card-inner">
        <div className="flip-card-front gas xe">
          <div className="text-3xl font-bold">
            有料会員限定公開
            <br></br>
            <div className="mt-5 text-sm font-bold">
              右上より 「ログイン/登録」 してください
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  </div>
);

export default function PremiumContents() {
  const [isDisplay, setDisplay] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    try {
      //onAuthStateChangedをAPI側で呼ぶとログイン直後だとタイミングが早くユーザを認識できてない。
      //（待ちが効いていない、ログイン後状態で改めてページの再読み込みが必要）
      //基本コンポーネント側で呼び出す方がいい。
      return onAuthStateChanged(auth, (user) => {
        setDisplay(user != null);
      });
    } catch (error) {
      setDisplay(false);
      throw error;
    }
  }, [auth]);

  //isDisplayの状態フラグの変更に伴う再レンダリングは、コンポーネントに引数として渡した場合認識されない
  //フラグ利用は変数を作ったコンポーネント内で行う必要あり
  return (
    <>
      {/* <h2
        className="range-title gas xe mt-20 animate-fade-up text-center text-2xl font-bold "
        style={{ animationFillMode: "forwards" }}
      >
        {"直近 １ヶ月"}
      </h2>
      {isDisplay ? <Cards range="month" /> : hideCard}
      <h2
        className="range-title gas xe mt-20 animate-fade-up text-center text-2xl font-bold "
        style={{ animationFillMode: "forwards" }}
      >
        {"直近 ３ヶ月"}
      </h2>
      {isDisplay ? <Cards range="month" /> : hideCard} */}
    </>
  );
}
