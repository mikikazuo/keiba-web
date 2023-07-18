// useStateを使う場合宣言必須
"use client";
import { IAnalysis } from "@/lib/getDb/analysis";
import { motion } from "framer-motion";
import { useState } from "react";
import "../../app/custom.css";
import "../../app/neon.scss";
import WebVitals from "./web-vitals";

export default function Card() {
  const [flip, setFlip] = useState(false);
  const flipCard = () => setFlip(!flip);
  return (
    <motion.div whileHover={{ scale: [1, 1.2, 1.15], zIndex: 1 }} transition={{ duration: 0.3 }} className={`flip-card ${flip != true ? "front-flip" : "back-flip"}`}>
      <div className="flip-card-inner">
        <div className="flip-card-front gas he">
          <button onClick={flipCard}>
            <div className={`h-[10.5rem] col-span-1 overflow-hidden rounded-xl gas he`}>
              <div className="flex justify-between">
                <div className="grid w-40 items-center text-center">
                  <h2 className="border-2 border-sky-500 rounded-xl rad mb-2 bg-gradient-to-br from-white to-stone-200 bg-clip-text font-display text-xl font-bold text-transparent md:text-3xl md:font-medium">
                    {'馬券名'}
                  </h2>
                  <ul className="prose-base -mt-2 leading-normal text-white whitespace-pre">
                    <li className="text-sm border-2 border-sky-500 rounded-xl">{`回収率が最大になる人気番`}</li>
                    <li className="text-xs border-2 border-sky-500 rounded-xl">{`トータルの回収額\n(毎レース100円購入時)`}</li>
                    <li className="text-xs border-2 border-sky-500 rounded-xl">{`対象レース内での最大回収額`}</li>
                  </ul>
                </div>
                <div>
                  <WebVitals
                    title="回収率"
                    color="text-green-500"
                    ratio={1}
                  ></WebVitals>
                </div>
              </div>
            </div>
            <div className="my-2 font-bold text-white border-2 border-sky-500 rounded-xl">{`勝ったレース数 / 購入対象レース数`}</div>
          </button>
        </div>
        <div className="flip-card-back gas pu">
          <button onClick={flipCard}>
            <div className={`h-[10.5rem] col-span-1 overflow-hidden rounded-xl gas pu`}            >
              <div className="flex justify-between">
                <div className="grid w-40 items-center text-center ">
                  <h2 className="border-2 border-sky-500 rounded-xl my-2 bg-gradient-to-br from-white to-stone-200 bg-clip-text font-display text-xl font-bold text-transparent md:text-3xl md:font-medium">
                    {'馬券名'}
                  </h2>
                  <ul className="prose-sm -mt-2 leading-normal text-white">
                    <li className="text-xs whitespace-pre">{`以下、対象レース内で\n最大回収額となったレース情報`}</li>
                    <li className="border-2 border-sky-500 rounded-xl">{`レース日`}</li>
                    <li className="border-2 border-sky-500 rounded-xl">{`レース場所`}</li>
                    <li className="border-2 border-sky-500 rounded-xl">{`ラウンド数 & レース名`}</li>
                  </ul>
                </div>
                <div className="my-auto">
                  <WebVitals
                    title="勝率"
                    color="text-purple-500"
                    ratio={1}
                  ></WebVitals>
                </div>
              </div>
            </div>
            <div className="my-2 font-bold text-white border-2 border-sky-500 rounded-xl">{`勝ったレース数 / 購入対象レース数`}</div>
          </button>
        </div>
      </div>
    </motion.div>
  );
}