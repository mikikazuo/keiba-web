// useStateを使う場合宣言必須
"use client";
import { IAnalysis } from "@/lib/getDb/analysis";
import { motion } from "framer-motion";
import { useState } from "react";
import "../../app/custom.css";
import "../../app/neon.scss";
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
              className={`h-[10.5rem] col-span-1 overflow-hidden rounded-xl gas he`}
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
                    <li className="text-sm">{`回収額： ${info.payback}円`}</li>
                    <li className="text-sm">{`MVP： ${info.payback_mvp}円`}</li>
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
              className={`h-[10.5rem] col-span-1 overflow-hidden rounded-xl gas pu`}
            >
              <div className="flex justify-between">
                <div className="grid w-40 items-center text-center ">
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
