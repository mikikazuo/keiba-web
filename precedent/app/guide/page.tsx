import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "逆張り星人とは",
  description:
    "逆張り戦略により高リターンを実現。過去のデータ結果がいつでも見られるため安心して逆張りできる。",
};

export default function Page() {
  return (
    <>
      <div
        className="mx-6 w-auto max-w-7xl animate-fade-up text-white"
        style={{ animationDelay: "0.15s", animationFillMode: "forwards" }}
      >
        <h1 className="my-8 text-center text-3xl font-bold md:text-4xl">
          逆張りこそが正義
        </h1>
        <p className="mt-5 text-left text-xl font-bold md:text-2xl">
          ◇ 競馬の「人気」とは？
        </p>
        <Image
          className=""
          src="/guide1.png"
          alt="logo"
          width={600}
          height={300}
        />
        <p className=":text-xl mt-5 text-center font-bold">
          たくさんの人に選ばれている馬は人気馬となり、
          <br className="sm:hidden" />
          リターンが少なくなるっぽ。
        </p>
        <p className="mt-8 text-left text-xl font-bold md:text-2xl">
          ◇ そこで逆張り戦略
        </p>
        <Image
          className=""
          src="/guide2.png"
          alt="logo"
          width={600}
          height={300}
        />
        <p className="mt-5 text-center font-bold md:text-xl">
          不人気馬を買い続けることで
          <br className="sm:hidden" />
          トータルでプラス回収を目指すぽ～☆。
        </p>
        <p className="mb-4 mt-8 text-left text-xl font-bold md:text-2xl">
          ◇ 〇〇番人気を
          <span className="sm:hidden">
            <br />
            &emsp;&nbsp;
          </span>
          買い続けた結果を毎週更新
        </p>
        <Image
          className=""
          src="/guide3.png"
          alt="logo"
          width={600}
          height={300}
        />
        <p className="mt-5 text-center font-bold md:text-xl">
          データ結果として出ているから安心して逆張り！
        </p>
      </div>
    </>
  );
}
