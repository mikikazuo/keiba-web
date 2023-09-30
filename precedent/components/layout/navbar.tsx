"use client";

import { useAuthContext } from "@/components/theme-provider";
import { usePathname } from "next/navigation";
import LoadingCircle from "../shared/icons/loading-circle";
import { useSignInModal } from "./sign-in-modal";
import UserDropdown from "./user-dropdown";

export default function Navbar() {
  const { SignInModal, setShowSignInModal } = useSignInModal();
  const { user } = useAuthContext();

  const pathname = usePathname();
  return pathname == "/maintenance" ? null : (
    <>
      <SignInModal />
      <div className={`fixed top-2 z-30 w-full transition-all`}>
        <div className="mx-5 flex h-16 max-w-screen-xl items-center justify-between xl:mx-auto">
          <div />
          <div>
            {user ? (
              <UserDropdown />
            ) : user === null ? (
              <button
                className="rounded-full border border-white bg-black/60 p-1.5 px-4 text-white backdrop-blur-xl transition-all hover:bg-white hover:text-black"
                onClick={() => setShowSignInModal(true)}
              >
                ログイン / 登録
              </button>
            ) : (
              <LoadingCircle />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
