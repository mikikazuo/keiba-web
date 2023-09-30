"use client";

import Popover from "@/components/shared/popover";
import { useAuthContext } from "@/components/theme-provider";
import { auth } from "@/lib/firebaseSDK/firebase-config";
import { signOut } from "firebase/auth";
import { Banknote, LogOut, Settings } from "lucide-react";

import { useState } from "react";

export default function UserDropdown() {
  const [openPopover, setOpenPopover] = useState(false);
  const { user } = useAuthContext();

  return (
    <div className="relative inline-block text-left">
      <Popover
        content={
          <div className="w-full rounded-md bg-white p-2 sm:w-56">
            {/* <Link
              className="flex items-center justify-start space-x-2 relative w-full rounded-md p-2 text-left text-sm transition-all duration-75 hover:bg-gray-100"
              href="/dashboard"
            >
              <LayoutDashboard className="h-4 w-4" />
              <p className="text-sm">Dashboard</p>
            </Link> */}
            <div className="mb-3">{user?.displayName + " 様"}</div>
            <button
              className="relative flex w-full cursor-not-allowed items-center justify-start space-x-2 rounded-md p-2 text-left text-sm transition-all duration-75 hover:bg-gray-100"
              disabled
            >
              <Settings className="h-4 w-4" />
              <p className="text-sm">登録情報</p>
            </button>
            <button
              className="relative flex w-full cursor-not-allowed items-center justify-start space-x-2 rounded-md p-2 text-left text-sm transition-all duration-75 hover:bg-gray-100"
              disabled
            >
              <Banknote className="h-4 w-4" />
              <p className="text-sm">支払情報</p>
            </button>
            <button
              className="relative flex w-full items-center justify-start space-x-2 rounded-md p-2 text-left text-sm transition-all duration-75 hover:bg-gray-100"
              onClick={() =>
                signOut(auth)
                  .then(() => {
                    // Sign-out successful.
                  })
                  .catch((error) => {
                    // An error happened.
                  })
              }
            >
              <LogOut className="h-4 w-4" />
              <p className="text-sm">ログアウト</p>
            </button>
          </div>
        }
        align="end"
        openPopover={openPopover}
        setOpenPopover={setOpenPopover}
      >
        <button
          onClick={() => setOpenPopover(!openPopover)}
          className="items-center rounded-full border border-gray-300 bg-black/60 p-1.5 px-4  text-white backdrop-blur-xl transition-all duration-75 hover:bg-white hover:text-black focus:outline-none active:scale-95"
        >
          アカウント情報
          {/* <Image
            alt={email}
            src={image || `https://avatars.dicebear.com/api/micah/${email}.svg`}
            width={40}
            height={40}
          /> */}
        </button>
      </Popover>
    </div>
  );
}
