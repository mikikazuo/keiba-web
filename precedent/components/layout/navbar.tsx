"use client";

import { auth } from "@/lib/firebaseSDK/firebase-config";
import { addUser } from "@/lib/login/addNewUser";
import {
  getRedirectResult,
  isSignInWithEmailLink,
  onAuthStateChanged,
  signInWithEmailLink,
  signOut,
} from "firebase/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingCircle } from "../shared/icons";
import { useSignInModal } from "./sign-in-modal";
import UserDropdown from "./user-dropdown";

export default function Navbar() {
  const { SignInModal, setShowSignInModal } = useSignInModal();
  /** nullは未ログイン、undefinedはログインかどうか確認中 */
  const [logined, setLogined] = useState<boolean | undefined>(undefined);
  const pathname = usePathname();

  function signOutUser() {
    //Sign out with the Firebase client
    signOut(auth);
    setLogined(false);
  }
  useEffect(() => {
    if (
      !auth.currentUser &&
      isSignInWithEmailLink(auth, window.location.href)
    ) {
      let email = window.localStorage.getItem("emailForSignIn");
      if (!email) {
        //TODO 使えないポップアップ処理
        //email = window.prompt("Please provide your email for confirmation");
      }
      signInWithEmailLink(auth, email ?? "", window.location.href)
        .then((result) => {
          window.localStorage.removeItem("emailForSignIn");
          setLogined(true);
          addUser(result);
        })
        .catch((error) => setLogined(false));
    } else {
      getRedirectResult(auth).then(async (userCred) => {
        /** ログイン後のリダイレクト後に１回だけ呼べる(userCredが空ではなくなる) */
        if (!userCred) return;
        addUser(userCred);
      });
      try {
        onAuthStateChanged(auth, (user) => setLogined(user != null));
      } catch (error) {
        setLogined(false);
        throw error;
      }
    }
  }, [auth]);
  if (pathname == "/maintenance") return null;
  return (
    <>
      <SignInModal />
      <div className={`fixed z-30 w-full transition-all`}>
        <div className="mr-2 flex h-16 max-w-screen-xl items-center justify-between xl:mx-auto">
          {/* {pathname != "/" ? (
            <Link
              href="/"
              className="group rounded-full border bg-black/60 px-4 py-1 text-white backdrop-blur-xl transition-all hover:bg-white hover:text-black "
            >
              <h1
                className="glitch animate-fade-up bg-clip-text text-2xl  font-bold opacity-0 group-hover:text-black md:text-3xl"
                style={{
                  animationDelay: "0.15s",
                  animationFillMode: "forwards",
                }}
              >
                <div className="line">逆張り星人</div>
                <div className="line">逆張り星人</div>
                <div className="line">逆張り星人</div>
                <div className="line">逆張り星人</div>
                <div className="line">逆張り星人</div>
              </h1>
            </Link>
          ) : (
            <div />
          )} */}
          {/* モバイルではスペースが足りない */}
          <div />
          <div className="flex">
            <Link
              href="/guide"
              className="mr-2 inline-block rounded-full border border-white bg-black/60 p-1.5 px-1 text-white backdrop-blur-xl transition-all hover:bg-white hover:text-black"
            >
              逆張り星人とは
            </Link>
            <Link
              href="/price"
              className="mr-2 inline-block rounded-full border border-white bg-black/60 p-1.5 px-1 text-white backdrop-blur-xl transition-all hover:bg-white hover:text-black"
            >
              有料プラン登録
            </Link>
            {logined ? (
              <UserDropdown signOut={signOutUser} />
            ) : logined === undefined ? (
              <div className="my-auto ml-8 flex w-12">
                <LoadingCircle />
              </div>
            ) : (
              <button
                className="rounded-full border border-white bg-black/60 p-1.5 px-1 text-white backdrop-blur-xl transition-all hover:bg-white hover:text-black"
                onClick={() => setShowSignInModal(true)}
              >
                ログイン
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
