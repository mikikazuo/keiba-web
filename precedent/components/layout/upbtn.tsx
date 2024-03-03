"use client";

import { ChevronUp } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Upbtn() {
  const pathname = usePathname();
  if (pathname == "/maintenance") return null;
  return (
    <div className={`fixed bottom-2 right-2 z-10 transition-all`}>
      <div className="mx-3 flex h-16 max-w-screen-xl items-center justify-between xl:mx-auto">
        <div className="flex">
          <a
            href="#"
            className="inline-block rounded-full border border-white bg-black/60 p-1.5 px-4 text-white backdrop-blur-xl transition-all hover:bg-white hover:text-black"
          >
            <ChevronUp />
          </a>
        </div>
      </div>
    </div>
  );
}
