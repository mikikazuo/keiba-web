import cx from "classnames";
import { inter, sfPro } from "./fonts";
import "./globals.css";
//import Nav from "@/components/layout/nav";
import Image from "next/image";
import { Suspense } from "react";
import "./darkforce.scss";

export const metadata = {
  title: "逆張り星人",
  description: "最新の人気ベースの最大回収率がまるわかり！\n毎週更新！",
  twitter: {
    card: "summary_large_image",
    title: "逆張り星人",
    description: "最新の人気ベースの最大回収率がまるわかり！\n毎週更新！",
  },
  // metadataBase: new URL("https://precedent.dev"),
  themeColor: "#FFF",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sample = (id: string) => (
    <div id={id} className="h-full w-full">
      <Image
        src="/spaceback.png"
        alt=""
        width={500}
        height={500}
        priority={true}
      />
    </div>
  );
  return (
    <html lang="en">
      <body className={cx(sfPro.variable, inter.variable)}>
        <div className="opacity-50">
          <div className="fixed top-0 w-[500px]">
            <Image
              src="/spaceback.png"
              alt=""
              width={500}
              height={500}
              priority={true}
            />
          </div>
          <div className="fixed left-[500px] top-0 w-[500px]">
            <Image
              src="/spaceback.png"
              alt=""
              width={500}
              height={500}
              priority={true}
            />
          </div>
          <div className="fixed left-[1000px] top-0 w-[500px]">
            <Image
              src="/spaceback.png"
              alt=""
              width={500}
              height={500}
              priority={true}
            />
          </div>
          <div className="fixed left-[1500px] top-0 w-[500px]">
            <Image
              src="/spaceback.png"
              alt=""
              width={500}
              height={500}
              priority={true}
            />
          </div>
          <div className="fixed bottom-0 w-[500px]">
            <Image
              src="/spaceback.png"
              alt=""
              width={500}
              height={500}
              priority={true}
            />
          </div>
          <div className="fixed bottom-0 left-[500px] w-[500px]">
            <Image
              src="/spaceback.png"
              alt=""
              width={500}
              height={500}
              priority={true}
            />
          </div>
          <div className="fixed bottom-0 left-[1000px] w-[500px]">
            <Image
              src="/spaceback.png"
              alt=""
              width={500}
              height={500}
              priority={true}
            />
          </div>
          <div className="fixed bottom-0 left-[1500px] w-[500px]">
            <Image
              src="/spaceback.png"
              alt=""
              width={500}
              height={500}
              priority={true}
            />
          </div>
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
        {/* <Footer /> */}
        {/* <Analytics /> */}
      </body>
    </html>
  );
}
