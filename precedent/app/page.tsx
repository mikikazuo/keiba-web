import Card from "@/components/home/card";
import { Twitter } from "@/components/shared/icons";
import { getAnalysis, getUpdateDate } from "@/lib/getDb/analysis";
import Balancer from "react-wrap-balancer";
import Beginner from "@/components/home/beginner";
import { Link } from "lucide-react";

export default async function Home() {
  const _updateDate = getUpdateDate("week");
  const _analysisWeek = getAnalysis("week");
  const _analysisMonth = getAnalysis("month");
  const [updateDate, analysisWeek, analysisMonth] = await Promise.all([
    _updateDate,
    _analysisWeek,
    _analysisMonth,
  ]);
  return (
    <>
      <div className="m z-10 w-full max-w-xl">
        <h2
          className="ml-5 animate-fade-up text-gray-300 opacity-0 md:text-xl"
          style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}
        >
          競馬完全攻略
        </h2>
        <div className="title my-6">
          <h1
            className="glitch animate-fade-up bg-clip-text text-6xl font-bold opacity-0 md:text-7xl md:leading-[5rem]"
            style={{ animationDelay: "0.15s", animationFillMode: "forwards" }}
          >
            <div className="line">逆張り星人</div>
            <div className="line">逆張り星人</div>
            <div className="line">逆張り星人</div>
            <div className="line">逆張り星人</div>
            <div className="line">逆張り星人</div>
            <div className="line">逆張り星人</div>
            <div className="line">逆張り星人</div>
            <div className="line">逆張り星人</div>
            <div className="line">逆張り星人</div>
            <div className="line">逆張り星人</div>
          </h1>
        </div>
        <p
          className="animate-fade-up text-center text-gray-300 opacity-0 md:text-xl"
          style={{ animationDelay: "0.25s", animationFillMode: "forwards" }}
        >
          <Balancer>
            最新の人気ベースの最大回収率がまるわかり<br></br>
            指定人気で買い続けた場合をシミュレーション<br></br>
            中央競馬が対象<br></br>
            <br></br>
            毎週月曜更新（{`${updateDate}更新`}）
          </Balancer>
        </p>
        <div
          className="my-10 flex animate-fade-up justify-around opacity-0"
          style={{ animationDelay: "0.25s", animationFillMode: "forwards" }}
        >
          <Beginner />
          <a
            href="https://twitter.com/intent/tweet?text=～逆張り星人～%0a最新の人気ベースの最大回収率がまるわかり！%0a&hashtags=逆張り星人&url=reversekeiba.com"
            target="_blank"
            rel="noreferrer"
            className="tweet-btn my-auto flex space-x-2 overflow-hidden rounded-full bg-blue-100 px-7 py-3 transition-colors hover:bg-blue-200"
          >
            <Twitter className="h-5 w-5 text-[#1d9bf0]" />
            <p className="text-sm font-semibold text-[#1d9bf0]">ツイートする</p>
          </a>
        </div>
      </div>
      <h2
        className="range-title gas xe mt-5 animate-fade-up text-center text-2xl font-bold"
        style={{ animationFillMode: "forwards" }}
      >
        直近 １週間
      </h2>
      <div className="repeat my-10 grid w-full max-w-screen-xl animate-fade-up gap-y-10">
        {analysisWeek.map((info, index) => (
          <Card key={index} info={info} />
        ))}
      </div>
      <h2
        className="range-title gas xe mt-20 animate-fade-up text-center text-2xl font-bold"
        style={{ animationFillMode: "forwards" }}
      >
        直近 １ヶ月
      </h2>
      <div className="repeat my-10 grid w-full max-w-screen-xl animate-fade-up gap-y-10">
        {analysisMonth.map((info, index) => (
          <Card key={index} info={info} />
        ))}
      </div>
      <div className="text-white">
        {" "}
        ©<a href="https://twitter.com/hoge512">hoge512</a> 2023
      </div>
    </>
  );
}
