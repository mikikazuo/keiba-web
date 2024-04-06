import Footer from "@/components/layout/footer";

import Navbar from "@/components/layout/navbar";
import Upbtn from "@/components/layout/upbtn";
import GoogleAnalytics from "@/lib/googleAnalytics/GaScript";
import ShortcutIcon from "@/lib/shorcutIcon";
import cx from "classnames";
import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import "./darkforce.scss";
import { inter, sfPro } from "./fonts";
import "./globals.css";
import "./neon.scss";

export const metadata: Metadata = {
  title: "逆張り星人｜競馬分析攻略",
  description:
    "〇〇番人気を買い続けるだけで回収率100%越え！？最新の人気ベースの最大回収率や逆境を覆す穴馬がまるわかり！毎週更新",
  twitter: {
    card: "summary_large_image",
    title: "逆張り星人｜競馬分析攻略",
    description:
      "〇〇番人気を買い続けるだけで回収率100%越え！？最新の人気ベースの最大回収率や逆境を覆す穴馬ががまるわかり！毎週更新",
    creator: "@keibareverse",
    images: ["https://reversekeiba.com/logo.png"],
  },
  themeColor: "#FFF",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const img = (
    <Image src="/spaceback.png" priority alt="" width={500} height={500} />
  );

  const sample = (id: string) => (
    <div key={id} id={id} className="h-full w-full">
      {img}
    </div>
  );
  return (
    <html lang="en" className="scroll-smooth">
      <body className={cx(sfPro.variable, inter.variable)}>
        <GoogleAnalytics />
        <ShortcutIcon />
        <div className="opacity-50">
          <div className="fixed top-0 w-[500px]">{img}</div>
          <div className="fixed left-[500px] top-0 w-[500px]">{img}</div>
          <div className="fixed left-[1000px] top-0 w-[500px]">{img}</div>
          <div className="fixed left-[1500px] top-0 w-[500px]">{img}</div>
          <div className="fixed top-[500px] w-[500px]">{img}</div>
          <div className="fixed left-[500px] top-[500px] w-[500px]">{img}</div>
          <div className="fixed left-[1000px] top-[500px] w-[500px]">{img}</div>
          <div className="fixed left-[1500px] top-[500px] w-[500px]">{img}</div>
        </div>
        <div className="divSample">
          {[...Array(6).keys()].map((x) => sample("d" + (x + 1)))}
        </div>

        {/* <div className="to-cyan-100 fixed h-screen w-full bg-gradient-to-br from-green-100 to-green-200 via-white" /> */}
        <div className="to-cyan-100 fixed h-screen w-full" />

        <Suspense fallback="...">
          {/* @ ts-expect-error Server Component */}
          <Navbar />
        </Suspense>
        <main className="flex w-full flex-col items-center justify-center py-10">
          {children}
        </main>
        <Upbtn />
        <Footer />
      </body>
    </html>
  );
}
