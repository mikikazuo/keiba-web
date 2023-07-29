"use client";

import { useEffect, useState } from "react";

export default function CountingNumbers({
  value,
  decimal,
  className,
  start = 0,
  duration = 800,
}: {
  value: number;
  decimal: number;
  className: string;
  start?: number;
  duration?: number;
}) {
  const [count, setCount] = useState(start);

  useEffect(() => {
    let startTime: number | undefined;
    const animateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const timePassed = timestamp - startTime;
      const progress = timePassed / duration;
      const rouded = Math.round(value * decimal) / decimal;
      const currentCount = easeOutQuad(progress, 0, rouded, 1, decimal);
      if (currentCount >= rouded) {
        setCount(rouded);
        return;
      }
      setCount(currentCount);
      requestAnimationFrame(animateCount);
    };
    requestAnimationFrame(animateCount);
  }, [value, duration]);

  return <p className={className}>{Intl.NumberFormat().format(count)}</p>;
}
const easeOutQuad = (
  t: number,
  b: number,
  c: number,
  d: number,
  decimal: number,
) => {
  t = t > d ? d : t / d;
  return Math.round((-c * t * (t - 2) + b) * decimal) / decimal;
};
