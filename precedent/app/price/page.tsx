"use client";

import { Google, LoadingCircle, LoadingDots } from "@/components/shared/icons";
import { auth, db, provider } from "@/lib/firebaseSDK/firebase-config";
import { addUser } from "@/lib/login/addNewUser";
import {
  getRedirectResult,
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithRedirect,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { ArrowRightCircle } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

const actionCodeSettings = {
  // URL you want to redirect back to. The domain (www.example.com) for this
  // URL must be in the authorized domains list in the Firebase Console.
  url:
    process.env.NODE_ENV !== "production"
      ? "http://localhost:3000/price"
      : "https://reversekeiba.com/price",
  // This must be true.
  handleCodeInApp: true,
};

export default function Page() {
  const [signInClicked, setSignInClicked] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  type RangeType = undefined | "month" | "year";
  const [payRange, setPayRange] = useState<RangeType>(undefined);
  type MethodType = undefined | "credit";
  const [payMethod, setPayMethod] = useState<MethodType>(undefined);
  /** nullは未ログイン、undefinedはログインかどうか確認中 */
  const [logined, setLogined] = useState<boolean | undefined>(undefined);
  const [eMail, setEMail] = useState("");
  /** 有料プラン期間かどうか */
  const [isPaid, setIsPaid] = useState<boolean | undefined>(undefined);
  /** 必要な選択項目を選択したかどうか */
  const isNotPayable =
    logined != true ||
    payRange == undefined ||
    payMethod == undefined ||
    isPaid != false;

  type FormData = {
    email: string;
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const formRef = useRef(null);
  /** メール送信 */
  const onSubmit = handleSubmit(async (data) => {
    const formData = new FormData(formRef.current!);
    const token = formData.get("cf-turnstile-response");
    const res = await fetch("/api/verify", {
      method: "POST",
      body: JSON.stringify({ token }),
      headers: {
        "content-type": "application/json",
      },
    });

    const result = await res.json();
    //CAPTCHAの検証通過
    if (result.success) {
      setSendEmail(true);
      sendSignInLinkToEmail(auth, data.email, actionCodeSettings)
        .then(() => {
          // The link was successfully sent. Inform the user.
          // Save the email locally so you don't need to ask the user for it again
          // if they open the link on the same device.
          window.localStorage.setItem("emailForSignIn", data.email);
          // ...
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          // ...
        });
    }
  });

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
        onAuthStateChanged(auth, async (user) => {
          setLogined(user != null);
          if (user) {
            if (user.email) setEMail(user.email);
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists())
              setIsPaid(
                docSnap.data().subscriptionEndDate
                  ? new Date() <= docSnap.data().subscriptionEndDate.toDate()
                  : false,
              );
          }
        });
      } catch (error) {
        setLogined(false);
        throw error;
      }
    }
  }, [auth]);

  return (
    <>
      <div
        className="w-full max-w-2xl animate-fade-up text-gray-300"
        style={{ animationDelay: "0.15s", animationFillMode: "forwards" }}
      >
        <h1 className="my-8 text-center text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
          有料プラン登録
          {/* <span class="text-primary dark:text-white">reimagination.</span> */}
        </h1>
        <h1 className="mb-8 mt-12 text-center text-xl font-bold text-gray-900 dark:text-white md:text-2xl">
          長期的な分析が可能へ！
        </h1>
        <h1 className=" my-4 text-center font-bold text-gray-900 dark:text-white md:text-xl">
          直近１ヶ月・３ヶ月分析が閲覧可能。
        </h1>
        <h1 className="md:text my-4 text-center font-bold text-gray-900 dark:text-white md:text-xl">
          短期と長期を組み合わせた
          <br className="md:hidden" />
          総合的な分析で回収率の向上へ。
        </h1>
        <h2
          className="gas xe mt-10 animate-fade-up py-2 text-center text-xl font-bold md:text-2xl"
          style={{ animationFillMode: "forwards" }}
        >
          １．アカウント登録 / ログイン
        </h2>
        {logined ? (
          <div className="mt-6 animate-fade-up text-center text-xl font-bold text-gray-100 md:text-2xl">
            ログイン済み
          </div>
        ) : logined === undefined ? (
          <div className="mx-auto my-12 flex w-12">
            <LoadingCircle />
          </div>
        ) : (
          <>
            <div className="my-6 text-white">
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 underline hover:text-blue-500"
              >
                利用規約
              </a>
              及び
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 underline hover:text-blue-500"
              >
                プライバシーポリシー
              </a>
              に同意のうえ下記よりアカウント登録の方法をお選びください。
            </div>
            <div className="flex justify-around text-white">
              <button
                disabled={signInClicked}
                className={`${
                  signInClicked
                    ? "cursor-not-allowed border-gray-200 bg-gray-100"
                    : "border border-gray-200 bg-white text-black hover:bg-gray-50"
                } flex h-10 w-full max-w-md items-center justify-center space-x-3 rounded-md border text-sm shadow-sm transition-all duration-75 focus:outline-none`}
                onClick={() => {
                  setSignInClicked(true);
                  signInWithRedirect(auth, provider);
                }}
              >
                {signInClicked ? (
                  <LoadingDots color="#808080" />
                ) : (
                  <>
                    <Google className="h-5 w-5" />
                    <p>Googleアカウントで登録 / ログイン</p>
                  </>
                )}
              </button>
            </div>
            {/* <div className="mt-6 animate-fade-up text-center text-xl font-bold text-gray-100 md:text-2xl">
              もしくは
            </div>
            <form
              ref={formRef}
              className="mx-auto mb-4 mt-7 max-w-md rounded bg-gray-100 px-8 pb-8 pt-6 shadow-md"
              onSubmit={onSubmit}
            >
              {sendEmail ? (
                <div className="mx-auto text-black">
                  メールを送信しました。
                  <br />
                  メール記載のURLからログインしてください。
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label
                      className="mb-2 block text-sm font-bold text-gray-700"
                      htmlFor="email"
                    >
                      メールアドレス
                    </label>
                    <input
                      disabled={signInClicked}
                      className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                      id="email"
                      {...register("email", {
                        required: "メールアドレスを入力してください。",
                        pattern: {
                          value: /^[\w\-._]+@[\w\-._]+\.[A-Za-z]+/,
                          message: "入力形式がメールアドレスではありません。",
                        },
                      })}
                    />
                    {errors.email?.message && (
                      <div className="text-red-500">{errors.email.message}</div>
                    )}
                  </div>
                  <Turnstile
                    className="w-1/2"
                    siteKey="0x4AAAAAAANib26enhWX8vYa"
                    options={{
                      theme: "light",
                    }}
                  />
                  <button
                    disabled={signInClicked}
                    type="submit"
                    className={`mt-6 ${
                      signInClicked
                        ? "cursor-not-allowed border-gray-200 bg-gray-100"
                        : "border border-gray-200 bg-white text-black hover:bg-gray-50"
                    } flex h-10 w-full items-center justify-center space-x-3 rounded-md border text-sm shadow-sm transition-all duration-75 focus:outline-none`}
                  >
                    {signInClicked ? (
                      <LoadingDots color="#808080" />
                    ) : (
                      <p>メールアドレスで登録 / ログイン </p>
                    )}
                  </button>
                </>
              )}
            </form> */}
          </>
        )}
        <h2
          className="range-title gas xe mt-10 animate-fade-up py-2 text-center text-xl font-bold md:text-2xl"
          style={{ animationFillMode: "forwards" }}
        >
          ２．期間（自動更新）
        </h2>
        <div className="my-5 text-white">期間を選択してください。</div>
        <div className="flex justify-around text-white">
          <button
            className={`${
              payRange == "month" ? "bg-white text-black" : "bg-black"
            } group relative max-w-sm rounded-lg border border-gray-200 p-6 shadow transition-all hover:bg-white hover:text-black`}
            onClick={() => setPayRange("month")}
          >
            <h5 className="mb-2 text-2xl font-bold tracking-tight">１ヶ月</h5>
            <p
              className={`${
                payRange == "month" ? "text-gray-500" : ""
              } font-normal text-gray-300 group-hover:text-gray-500`}
            >
              980円(税込)/月
            </p>
          </button>
          <button
            className={`${
              payRange == "year" ? "bg-white text-black" : "bg-black"
            } group relative max-w-sm rounded-lg border border-gray-200 p-6 shadow transition-all hover:bg-white hover:text-black`}
            onClick={() => setPayRange("year")}
          >
            <div className="absolute right-[-20px] top-[-15px] rounded-full border border-green-300 bg-black/60 p-1.5 px-4 text-sm text-white backdrop-blur-xl transition-all">
              <p>1,960円お得</p>
            </div>

            <h5 className="mb-2 text-2xl font-bold tracking-tight">年間</h5>
            <p
              className={`${
                payRange == "year" ? "text-gray-500" : ""
              } font-normal text-gray-300 group-hover:text-gray-500`}
            >
              9,800円(税込)/年
            </p>
          </button>
        </div>
        <h2
          className="range-title gas xe mt-10 animate-fade-up py-2 text-center text-xl font-bold md:text-2xl"
          style={{ animationFillMode: "forwards" }}
        >
          ３．支払方法
        </h2>
        <div className="my-5 text-white">支払方法を選択してください。</div>
        <div className="flex justify-around text-white">
          <button
            className={`${
              payMethod == "credit" ? "bg-white text-black" : "bg-black"
            } relative rounded-lg border border-gray-200 bg-black p-6 shadow transition-all  hover:bg-white hover:text-black`}
            onClick={() => setPayMethod("credit")}
          >
            <h5 className="mb-2 text-2xl font-bold">クレジットカード</h5>
            <div className="mx-auto flex w-40 justify-around">
              <Image
                src="/jcb-logo.gif"
                alt="JCBLogo"
                className="h-[38.8px] w-[50.5px]"
                width={50.5}
                height={38.8}
              />
              <Image
                src="/amex-logo.png"
                alt="amexLogo"
                className="h-[40px] w-[40px]"
                width={40}
                height={40}
              />
              <Image
                src="/diners-logo.gif"
                alt="dinersLogo"
                className="h-[40px] w-[54px]"
                width={54}
                height={40}
              />
            </div>
          </button>
        </div>
        <div className="mt-12 flex flex-row-reverse text-white">
          <form
            action="https://credit.j-payment.co.jp/link/creditcard"
            method="POST"
          >
            <input type="hidden" name="aid" value="127241" />
            <input
              type="hidden"
              name="iid"
              value={payRange == "month" ? "month_plan" : "year_plan"}
            />
            <input type="hidden" name="em" value={eMail} />
            <button
              className={`${
                isNotPayable ? "cursor-not-allowed opacity-50" : ""
              } mr-2 flex w-48 rounded-lg border border-gray-200 bg-black p-4 shadow transition-all hover:bg-white hover:text-black`}
              type="submit"
              name="submit"
              value="購入"
              disabled={isNotPayable}
            >
              <h5 className="mr-3 w-full text-2xl font-bold">支払へ進む</h5>
              <ArrowRightCircle className="h-8 w-8" />
            </button>
          </form>
          {isPaid ? (
            <div className="mr-2 text-sm text-red-400">
              現在、お客様は支払済みの有料プラン期間内です。
              <br />
              期間外後にお試しください。
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
    </>
  );
}
