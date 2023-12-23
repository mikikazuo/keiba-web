"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  if (pathname == "/maintenance") return null;
  return (
    <>
      <div
        className="mb-10 animate-fade-up text-center text-sm text-white opacity-0"
        style={{ animationFillMode: "forwards" }}
      >
        <div className="m-auto flex h-36 flex-col content-center justify-around md:h-full md:w-[32rem] md:flex-row ">
          <Link href="/">トップページ</Link>
          <Link href="/specified">特定商取引法に基づく表記</Link>
          <Link href="/terms">利用規約</Link>
          <Link href="/privacy">プライバシーポリシー</Link>
        </div>
      </div>
      <div
        className="mb-10 animate-fade-up text-center text-white opacity-0 md:text-xl"
        style={{ animationFillMode: "forwards" }}
      >
        ©2023
        <a className="text-blue-300" href="https://twitter.com/keibareverse">
          &nbsp;逆張り星人
        </a>
      </div>
    </>
  );
}
