// useStateを使う場合宣言必須
"use client";
import { IAnalysis } from "@/lib/getDb/analysis";
import { motion } from "framer-motion";
import { useState } from "react";
import { isMobile } from "react-device-detect";
import "../../app/custom.css";
import WebVitals from "./web-vitals";

export default function Card({ info }: { info: IAnalysis }) {
  const [flip, setFlip] = useState(false);
  const flipCard = () => setFlip(!flip);
  return (
    <motion.div
      whileHover={isMobile ? {} : { scale: [1, 1.2, 1.15], zIndex: 1 }}
      whileTap={isMobile ? { scale: 0.9, zIndex: 1 } : {}}
      transition={{ duration: 0.3 }}
      className={`flip-card ${flip != true ? "front-flip" : "back-flip"}`}
    >
      <button onClick={flipCard} className="flip-card-inner w-full">
        <div className="flip-card-front gas he">
          <div className="gas he col-span-1 h-[10.5rem] overflow-hidden">
            <div className="flex h-full justify-between">
              <div className="grid w-48 items-center text-center">
                <h2 className="bg-gradient-to-br from-white to-stone-200 bg-clip-text font-display text-3xl font-bold text-transparent">
                  {info.buy_type}
                </h2>
                <ul className="prose-base -mt-2 leading-normal text-white">
                  <li className="text-2xl">{`${info.popularity}${
                    info.popularity.length < 9 ? "番人気" : ""
                  }`}</li>
                  <div className="relative left-7 mx-auto grid grid-cols-3 text-sm">
                    <div className="text-right">回収額：</div>
                    <div className="col-span-2 ml-3 text-left">{`${info.payback.toLocaleString()} 円`}</div>
                    <div className="text-right">MVP額：</div>
                    <div className="col-span-2 ml-3 text-left">{`${info.payback_mvp.toLocaleString()} 円`}</div>
                    <div className="text-right">MVP馬：</div>
                    <div className="col-span-2 ml-3 text-left">
                      {info.order1}
                    </div>
                  </div>
                </ul>
              </div>
              <div className="my-auto">
                <WebVitals
                  title="回収率"
                  color="text-green-500"
                  ratio={info.payback / info.buyable_cnt / 100}
                />
              </div>
            </div>
          </div>
          <div className="h-8 font-bold text-white">{` ${info.win_cnt} レース / 全 ${info.buyable_cnt} レース中`}</div>
        </div>
        <div className="flip-card-back gas pu">
          <div className="gas pu col-span-1 h-[10.5rem] overflow-hidden">
            <div className="flex h-full justify-between">
              <div className="grid w-48 items-center text-center">
                <h2 className="bg-gradient-to-br from-white to-stone-200 bg-clip-text font-display text-3xl font-bold text-transparent">
                  {info.buy_type}
                </h2>
                <ul className="prose-sm -mt-2 leading-normal text-white">
                  <li className="text-base">{`～ MVPレース ～`}</li>
                  <li>{`${info.date}`}</li>
                  <li>{`${info.place}`}</li>
                  <li>{`${info.round}R ${info.name}`}</li>
                </ul>
              </div>
              <div className="my-auto">
                <WebVitals
                  title="勝率"
                  color="text-purple-500"
                  ratio={info.win_cnt / info.buyable_cnt}
                />
              </div>
            </div>
          </div>
          <div className="h-8 font-bold text-white">{`${info.win_cnt} レース / 全 ${info.buyable_cnt} レース中`}</div>
        </div>
      </button>
    </motion.div>
  );
}
