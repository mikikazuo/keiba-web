import CountingNumbers from "@/components/shared/counting-numbers";
import { motion } from "framer-motion";

export default function WebVitals({
  title,
  color,
  ratio,
}: {
  title: string;
  color: string;
  ratio: number;
}) {
  return (
    <div className="relative">
      {/* 値と円グラフの座標を動かす場合はmotion.svgのwidth,heightを変更する */}
      <motion.svg viewBox="0 0 140 140" width={135} height={170}>
        <motion.circle
          initial={{ pathLength: 0 }}
          animate={{ pathLength: ratio > 1 ? 1 : ratio }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 2, ease: "easeOut" }}
          strokeWidth={7}
          strokeDasharray="0 1"
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          cx="70"
          cy="70"
          r="55"
          fill={color.match("green") ? "#DCFCE7" : "#D9D1FC"}
          stroke={color.match("green") ? "#22C55E" : "#7548FA"}
        />
      </motion.svg>
      <div className={"absolute inset-x-0 top-11 " + color}>{title}</div>
      <CountingNumbers
        value={ratio * 100}
        decimal={color.match("green") ? 1 : 100}
        duration={2500}
        className={
          "absolute inset-0 top-1 mx-auto flex items-center justify-center font-display text-2xl " +
          color
        }
      />
      <div className={"absolute left-[3.8rem] top-[6.4rem] text-xl " + color}>
        %
      </div>
    </div>
  );
}
