"use client";

import { IAnalysis } from "@/lib/getDb/analysis";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Card from "./card";

export default function Cards({ range }: { range: string }) {
  const [analysis, setData] = useState<IAnalysis[] | undefined>(undefined);
  const empytCards = [...new Array(8).keys()];

  useEffect(() => {
    fetch(`/api/analytics?range=${range}`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
      });
  }, []);
  return (
    <div className="repeat my-10 grid w-11/12 max-w-screen-xl animate-fade-up gap-y-10">
      {analysis?.map((info) => <Card key={info.buy_type} info={info} />) ??
        empytCards.map(
          (
            info, //空のカード表示
          ) => (
            <motion.div
              key={info}
              whileHover={{ scale: [1, 1.2, 1.15], zIndex: 1 }}
              transition={{ duration: 0.3 }}
              className={`flip-card front-flip`}
            >
              <div className="flip-card-inner">
                <div className="flip-card-front gas he">
                  <button>
                    <div
                      className={`gas he col-span-1 h-[10.5rem] w-[330px] overflow-hidden rounded-xl`}
                    ></div>
                    <div className="my-2 font-bold text-white">{"　"}</div>
                  </button>
                </div>
              </div>
            </motion.div>
          ),
        )}
    </div>
  );
}
