import Beginner from "@/components/home/beginner";
import Card from "@/components/home/card";
import PremiumCards from "@/components/home/premium-cards";
import { Twitter } from "@/components/shared/icons";
import { getAnalysis, getUpdateDate } from "@/lib/getDb/analysis";
import Image from "next/image";
import Link from "next/link";
import Balancer from "react-wrap-balancer";

export const revalidate = 0;
export default async function Home() {
  const _updateDate = getUpdateDate("week");
  const _analysisWeek = getAnalysis("week");

  //サーバーコンポーネント側でクッキーの呼び出しは不可(emulatorでは取得できたが、デプロイ後は不可)
  //できると示唆するサイトもあるが、firebase上だと相性が悪い？
  // const cookieStore = cookies();

  const [updateDate, analysisWeek] = await Promise.all([
    _updateDate,
    _analysisWeek,
  ]);
  return (
    <>
      <div className="z-10 mt-5 w-full max-w-xl">
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
          </h1>
        </div>
        <p
          className="animate-fade-up text-center text-gray-300 opacity-0 md:text-xl"
          style={{ animationDelay: "0.25s", animationFillMode: "forwards" }}
        >
          <Balancer>
            最新の人気ベースの最大回収率がまるわかりっぽ！ <br />
            中央競馬で指定人気を買い続けた場合を
            <br className="md:hidden" />
            シミュレーションするぽ～ <br /> <br />
            毎週更新だぽ（{`${updateDate}更新`}）
          </Balancer>
        </p>
        <div
          className="my-10 flex animate-fade-up justify-around opacity-0"
          style={{ animationDelay: "0.25s", animationFillMode: "forwards" }}
        >
          <Beginner />
          <a
            href="https://twitter.com/intent/tweet?text=無料で最新の人気ベースの最大回収率がまるわかりっぽ！%0a毎週更新だぽ%0a&hashtags=逆張り星人&url=reversekeiba.com"
            target="_blank"
            rel="noreferrer"
            className="tweet-btn my-auto flex space-x-2 overflow-hidden rounded-full bg-gray-600 px-7 py-3 transition-colors hover:bg-blue-200"
          >
            <Twitter className="h-5 w-5 text-[#1d9bf0]" />
            <p className="text-sm font-semibold text-white">ポストする</p>
          </a>
        </div>
      </div>
      <div
        className="flex w-72 animate-fade-up justify-between opacity-0"
        style={{ animationDelay: "0.25s", animationFillMode: "forwards" }}
      >
        <a
          href="#month"
          className="inline-block rounded-md border border-white bg-black/60 p-1.5 px-4 text-white backdrop-blur-xl transition-all hover:bg-white hover:text-black"
        >
          直近 １ヶ月へ
        </a>
        <a
          href="#three-month"
          className="inline-block rounded-md border border-white bg-black/60 p-1.5 px-4 text-white backdrop-blur-xl transition-all hover:bg-white hover:text-black"
        >
          直近 ３ヶ月へ
        </a>
      </div>
      <h2
        className="range-title gas xe mt-10 animate-fade-up text-center text-2xl font-bold"
        style={{ animationFillMode: "forwards" }}
      >
        直近 １週間
      </h2>
      <div className="repeat mt-10 grid w-11/12 max-w-screen-xl animate-fade-up gap-y-10">
        {analysisWeek.map((info) => (
          <Card key={info.buy_type} info={info} />
        ))}
      </div>
      <div className="mb-14" id="month"></div>
      <h2
        className="range-title gas xe animate-fade-up text-center text-2xl font-bold"
        id="month"
        style={{ animationFillMode: "forwards" }}
      >
        直近 １ヶ月
      </h2>
      <PremiumCards range="month" />
      <div className="mb-14" id="three-month"></div>
      <h2
        className="range-title gas xe animate-fade-up text-center text-2xl font-bold"
        style={{ animationFillMode: "forwards" }}
      >
        直近 ３ヶ月
      </h2>
      <PremiumCards range="three_month" />
      <Image
        className="mx-auto mt-10"
        src="/favicons/android-chrome-192x192.png"
        alt="logo"
        width={96}
        height={96}
      />
      <div
        className="bottom-30 fixed z-30 w-full animate-fade-up transition-all"
        style={{ animationFillMode: "forwards" }}
      >
        <div className="mx-3 flex h-16 max-w-screen-xl items-center justify-between xl:mx-auto">
          <div />
          <div className="flex">
            <Link
              href="/price"
              className="mr-3 inline-block rounded-full border border-white bg-black/60 p-1.5 px-4 text-white backdrop-blur-xl transition-all hover:bg-white hover:text-black"
            >
              有料プラン登録
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
