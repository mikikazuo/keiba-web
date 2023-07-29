"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import "../../app/neon.scss";

export default async function Page() {
  return (
    <>
      <div className="z-10 w-full max-w-xl">
        <div className="title my-6">
          <h1
            className="glitch animate-fade-up bg-clip-text text-6xl font-bold text-white opacity-0 md:text-7xl md:leading-[5rem]"
            style={{ animationDelay: "0.15s", animationFillMode: "forwards" }}
          >
            <div className="line">準備中</div>
            <div className="line">準備中</div>
            <div className="line">準備中</div>
            <div className="line">準備中</div>
            <div className="line">準備中</div>
          </h1>
        </div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ rotate: 360, scale: 0.8 }}
          transition={{
            repeat: Infinity,
            repeatType: "loop",
            duration: 2,
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
        >
          <Image
            className="mx-auto"
            src="/favicons/android-chrome-512x512.png"
            alt=""
            width={500}
            height={500}
          />
        </motion.div>
        <div className="title my-6">
          <h1
            className="glitch animate-fade-up bg-clip-text text-6xl font-bold text-white opacity-0 md:text-7xl md:leading-[5rem]"
            style={{ animationDelay: "0.15s", animationFillMode: "forwards" }}
          >
            <div className="line">だぽ☆</div>
            <div className="line">だぽ☆</div>
            <div className="line">だぽ☆</div>
            <div className="line">だぽ☆</div>
            <div className="line">だぽ☆</div>
          </h1>
        </div>
      </div>
    </>
  );
}
