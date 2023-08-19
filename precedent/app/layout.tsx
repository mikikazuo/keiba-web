import cx from "classnames";
import { inter, sfPro } from "./fonts";
import "./globals.css";
//import Nav from "@/components/layout/nav";
import Footer from "@/components/layout/footer";
import GoogleAnalytics from "@/lib/googleAnalytics/GaScript";
import ShortcutIcon from "@/lib/shorcutIcon";
import Image from "next/image";
import { Suspense } from "react";
import "./darkforce.scss";
import "./neon.scss";

export const metadata = {
  title: "逆張り星人 - 競馬分析攻略",
  description: "最新の人気ベースの最大回収率がまるわかりっぽ！毎週更新だぽ",
  twitter: {
    card: "summary_large_image",
    title: "逆張り星人 - 競馬分析攻略",
    description:
      "最新の人気ベースの最大回収率が無料でまるわかりっぽ！毎週更新だぽ",
    creator: "@reversekeiba",
    images: ["https://reversekeiba.com/logo.png"],
  },
  themeColor: "#FFF",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const img = <Image src="/spaceback.png" alt="" width={500} height={500} />;

  const sample = (id: string) => (
    <div id={id} className="h-full w-full">
      {img}
    </div>
  );
  return (
    <html lang="en">
      <body className={cx(sfPro.variable, inter.variable)}>
        <GoogleAnalytics />
        <ShortcutIcon />
        <div className="opacity-50">
          <div className="fixed top-0 w-[500px]">{img}</div>
          <div className="fixed left-[500px] top-0 w-[500px]">{img}</div>
          <div className="fixed left-[1000px] top-0 w-[500px]">{img}</div>
          <div className="fixed left-[1500px] top-0 w-[500px]">{img}</div>
          <div className="fixed bottom-0 w-[500px]">{img}</div>
          <div className="fixed bottom-0 left-[500px] w-[500px]">{img}</div>
          <div className="fixed bottom-0 left-[1000px] w-[500px]">{img}</div>
          <div className="lPeft-[1500px] fixed bottom-0 w-[500px]">{img}</div>
        </div>
        <div className="divSample">
          {[...Array(6).keys()].map((x) => sample("d" + (x + 1)))}
        </div>

        {/* <div className="to-cyan-100 fixed h-screen w-full bg-gradient-to-br from-green-100 to-green-200 via-white" /> */}
        <div className="to-cyan-100 fixed h-screen w-full" />
        <Suspense fallback="...">
          {/* @ ts-expect-error Server Component */}
          {/* <Nav /> */}
        </Suspense>
        <main className="flex w-full flex-col items-center justify-center py-10">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
