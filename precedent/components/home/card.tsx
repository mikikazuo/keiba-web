// useStateを使う場合宣言必須
"use client";
import { IAnalysis } from "@/lib/getDb/analysis";
import { motion } from "framer-motion";
import { useState } from "react";
import "../../app/custom.css";
import WebVitals from "./web-vitals";

export default function Card({ info }: { info: IAnalysis }) {
  const [flip, setFlip] = useState(false);
  const flipCard = () => setFlip(!flip);
  return (
    <motion.div
      whileHover={{ scale: [1, 1.2, 1.15], zIndex: 1 }}
      transition={{ duration: 0.3 }}
      className={`flip-card ${flip != true ? "front-flip" : "back-flip"}`}
    >
      <div className="flip-card-inner">
        <div className="flip-card-front gas he">
          <button onClick={flipCard}>
            <div
              className={`gas he col-span-1 h-[10.5rem] overflow-hidden rounded-xl`}
            >
              <div className="flex justify-between">
                <div className="grid w-40 items-center text-center">
                  <h2 className="mb-2 bg-gradient-to-br from-white to-stone-200 bg-clip-text font-display text-xl font-bold text-transparent md:text-3xl md:font-medium">
                    {info.buy_type}
                  </h2>
                  <ul className="prose-base -mt-2 leading-normal text-white">
                    <li className="text-2xl">{`${info.popularity}${
                      info.popularity.length < 9 ? "番人気" : ""
                    }`}</li>
                    <div className="mx-auto grid grid-cols-2 text-sm">
                      <div className="text-right">回収額：</div>
                      <div>{`${info.payback.toLocaleString()} 円`}</div>
                      <div className="text-right">MVP：</div>
                      <div>{`${info.payback_mvp.toLocaleString()} 円`}</div>
                    </div>
                  </ul>
                </div>
                <div>
                  <WebVitals
                    title="回収率"
                    color="text-green-500"
                    ratio={info.payback / info.whole_cnt / 100}
                  ></WebVitals>
                </div>
              </div>
            </div>
            <div className="my-2 font-bold text-white">{` ${info.cnt} レース / 全 ${info.whole_cnt} レース中`}</div>
          </button>
        </div>
        <div className="flip-card-back gas pu">
          <button onClick={flipCard}>
            <div
              className={`gas pu col-span-1 h-[10.5rem] overflow-hidden rounded-xl`}
            >
              <div className="flex justify-between">
                <div className="grid w-40 items-center text-center">
                  <h2 className="mb-2 bg-gradient-to-br from-white to-stone-200 bg-clip-text font-display text-xl font-bold text-transparent md:text-3xl md:font-medium">
                    {info.buy_type}
                  </h2>
                  <ul className="prose-sm -mt-2 leading-normal text-white">
                    <li className="text-base">{`～ MVPレース ～`}</li>
                    <li>{`${info.date}`}</li>
                    <li>{`${info.place}`}</li>
                    <li>{`${info.round}R ${info.name}`}</li>
                  </ul>
                </div>
                <div>
                  <WebVitals
                    title="勝率"
                    color="text-purple-500"
                    ratio={info.cnt / info.whole_cnt}
                  ></WebVitals>
                </div>
              </div>
            </div>
            <div className="my-2 font-bold text-white">{`${info.cnt} レース / 全 ${info.whole_cnt} レース中`}</div>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
