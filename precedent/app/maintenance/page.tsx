"use client";
import { Twitter } from "@/components/shared/icons";
import { motion } from "framer-motion";
import Image from "next/image";
import "../../app/neon.scss";

export default async function Page() {
  return (
    <>
      <div className="z-10 w-full max-w-xl flex-col justify-between">
        <div className="title mt-2">
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
            stiffness: 760,
            damping: 200,
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
        <div className="title">
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
      <div
        className="my-10 flex animate-fade-up justify-around opacity-0"
        style={{ animationDelay: "0.25s", animationFillMode: "forwards" }}
      >
        <a
          href="https://twitter.com/intent/tweet?text=ぽーぽぽっぽー、逆張り星人だぽ%0aサイトオープンまでもうしばらくお待ちくださいっぽ☆%0a&hashtags=逆張り星人&url=reversekeiba.com"
          target="_blank"
          rel="noreferrer"
          className="tweet-btn flex space-x-2 overflow-hidden rounded-full bg-blue-100 px-7 py-3 transition-colors hover:bg-blue-200"
        >
          <Twitter className="h-5 w-5 text-[#1d9bf0]" />
          <p className="text-sm font-semibold text-[#1d9bf0]">ツイートする</p>
        </a>{" "}
      </div>
    </>
  );
}
