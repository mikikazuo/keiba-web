// useStateを使う場合宣言必須
"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { isMobile } from "react-device-detect";
import "../../app/custom.css";
import WebVitals from "./web-vitals";

export default function BeginnerCard() {
  const [flip, setFlip] = useState(false);
  const flipCard = () => setFlip(!flip);
  return (
    <motion.div
      whileHover={isMobile ? {} : { scale: [1, 1.2, 1.15], zIndex: 1 }}
      whileTap={isMobile ? { scale: 0.9, zIndex: 1 } : {}}
      transition={{ duration: 0.3 }}
      className={`flip-card ${flip != true ? "front-flip" : "back-flip"}`}
    >
      <button onClick={flipCard} className="flip-card-inner">
        <div className="flip-card-front gas he">
          <div className="gas he col-span-1 h-[10.5rem] overflow-hidden">
            <div className="flex h-full justify-between">
              <div className="grid w-48 items-center text-center">
                <h2 className="rad rounded-xl border-2 border-sky-500 bg-gradient-to-br from-white to-stone-200 bg-clip-text font-display text-xl font-bold text-transparent md:text-3xl md:font-medium">
                  {"馬券名"}
                </h2>
                <ul className="prose-base -mt-2 whitespace-pre leading-normal text-white">
                  <li className="rounded-xl border-2 border-sky-500 text-sm">{`回収率が最大になる人気番`}</li>
                  <li className="rounded-xl border-2 border-sky-500 text-xs">{`トータルの回収額\n(毎レース100円購入時)`}</li>
                  <li className="rounded-xl border-2 border-sky-500 text-xs">{`購入対象レース内での最大回収額`}</li>
                  <li className="rounded-xl border-2 border-sky-500 text-xs">{`最大回収額のレースの1着馬`}</li>
                </ul>
              </div>
              <div className="my-auto">
                <WebVitals title="回収率" color="text-green-500" ratio={1} />
              </div>
            </div>
          </div>
          <div className="h-8 rounded-xl border-2 border-sky-500 font-bold text-white">{`勝ったレース数 / 購入対象レース数`}</div>
        </div>
        <div className="flip-card-back gas pu">
          <div className="gas pu col-span-1 h-[10.5rem] overflow-hidden">
            <div className="flex h-full justify-between">
              <div className="grid w-48 items-center text-center">
                <h2 className="my-2 rounded-xl border-2 border-sky-500 bg-gradient-to-br from-white to-stone-200 bg-clip-text font-display text-xl font-bold text-transparent md:text-3xl md:font-medium">
                  {"馬券名"}
                </h2>
                <ul className="prose-sm -mt-2 leading-normal text-white">
                  <li className="whitespace-pre text-xs">{`以下、購入対象レース内で\n最大回収額となったレース情報`}</li>
                  <li className="rounded-xl border-2 border-sky-500">{`レース日`}</li>
                  <li className="rounded-xl border-2 border-sky-500">{`レース場所`}</li>
                  <li className="rounded-xl border-2 border-sky-500">{`ラウンド数 & レース名`}</li>
                </ul>
              </div>
              <div className="my-auto">
                <WebVitals title="勝率" color="text-purple-500" ratio={1} />
              </div>
            </div>
          </div>
          <div className="h-8 rounded-xl border-2 border-sky-500 font-bold text-white">{`勝ったレース数 / 購入対象レース数`}</div>
        </div>
      </button>
    </motion.div>
  );
}
