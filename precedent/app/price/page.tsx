"use client";
import { Google, LoadingCircle, LoadingDots } from "@/components/shared/icons";
import {
  auth,
  db,
  functions,
  provider,
} from "@/lib/firebaseSDK/firebase-config";
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
import { httpsCallable } from "firebase/functions";
import { motion } from "framer-motion";
import { ArrowRightCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script";
import React, { useEffect, useRef, useState } from "react";
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
declare global {
  interface Window {
    Paidy: any;
  }
}

export default function Page() {
  React.useEffect(() => {
    document.title = "逆張り星人｜有料プラン登録";
  }, []);

  const router = useRouter();
  const [signInClicked, setSignInClicked] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  type RangeType = undefined | 1 | 12;
  const [payMonthRange, setPayRange] = useState<RangeType>(undefined);
  type MethodType = undefined | "credit" | "paidy";
  const [payMethod, setPayMethod] = useState<MethodType>(undefined);
  /** nullは未ログイン、undefinedはログインかどうか確認中 */
  const [logined, setLogined] = useState<boolean | undefined>(undefined);
  const [eMail, setEMail] = useState("");
  /** 有料プラン期間かどうか */
  const [isPaid, setIsPaid] = useState<boolean | undefined>(undefined);

  //paidy用必要情報
  // 入力フォームの型定義
  type PaidyFormDaata = {
    first_name: string;
    last_name: string;
    zip: string;
  };

  const {
    register: paidyRegister,
    handleSubmit: paidyHandleSubmit,
    formState: { errors: paidyErrors },
  } = useForm<PaidyFormDaata>();

  const onPaidySubmit = paidyHandleSubmit((data) => {
    let zip = data.zip;
    if (zip.length === 7 && !zip.includes("-"))
      zip = zip.slice(0, 3) + "-" + zip.slice(3);

    const config = {
      api_key: "pk_live_2cnjl64gj8sd0heo4nv0uiebib",
      logo_url: "https://reversekeiba.com/logo.png",
      closed: function (callbackData: {
        id: string;
        create_at: string;
        status: string;
      }) {
        const addMessage = httpsCallable(functions, "paidy_first_subscription");
        addMessage({
          subscription_id: callbackData.id,
          pay_month_range: payMonthRange,
          zip: zip,
          uid: auth.currentUser?.uid,
        }).then((res) => {
          const data = res.data as { result: string };
          if (data.result != "ok") {
            router.push("/paycomplete?rst=2");
            throw new Error(`error`);
          }
          router.push("/paycomplete?rst=1");
        });
      },
      token: {
        wallet_id: "default",
        type: "recurring",
      },
    };

    const paidyHandler = window.Paidy.configure(config);
    const payload = {
      store_name: "逆張り星人",
      buyer: {
        email: auth.currentUser?.email,
        name1: `${data.first_name}　${data.last_name}`,
      },
      metadata: { uid: auth.currentUser?.uid },
    };
    paidyHandler.launch(payload);
  });

  /** 必要な選択項目を選択したかどうか */
  const isNotPayable =
    logined != true ||
    payMonthRange == undefined ||
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

  /** paidy用入力フォームアニメーション */
  const variants = {
    open: { opacity: 1, height: "auto" },
    closed: { opacity: 0, height: 0 },
  };

  return (
    <>
      <Script src="https://apps.paidy.com/" />
      <div
        className="w-full max-w-2xl animate-fade-up text-gray-300"
        style={{ animationDelay: "0.15s", animationFillMode: "forwards" }}
      >
        <h1 className="my-8 text-center text-3xl font-bold text-white md:text-4xl">
          有料プラン登録
        </h1>
        <h1 className="mb-8 mt-12 text-center text-xl font-bold text-white md:text-2xl">
          長期的な分析が可能へ！
        </h1>
        <h1 className=" my-4 text-center font-bold text-white md:text-xl">
          直近１ヶ月・３ヶ月分析が閲覧可能。
        </h1>
        <h1 className="md:text my-4 text-center font-bold text-white md:text-xl">
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
          <div className="my-12 flex justify-center">
            <LoadingCircle />
          </div>
        ) : (
          <>
            <div className="my-6 text-white">
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-4 text-blue-300 underline hover:text-blue-500"
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
        <div className="my-5 ml-4 text-white">期間を選択してください。</div>
        <div className="flex justify-around text-white">
          <button
            className={`${
              payMonthRange == 1 ? "bg-white text-black" : "bg-black"
            } group relative w-40 max-w-sm rounded-lg border border-gray-200 py-6 shadow transition-all hover:bg-white hover:text-black`}
            onClick={() => setPayRange(1)}
          >
            <h5 className="mb-2 text-2xl font-bold tracking-tight">１ヶ月</h5>
            <p
              className={`${
                payMonthRange == 1 ? "text-gray-500" : ""
              } font-normal text-gray-300 group-hover:text-gray-500`}
            >
              980円(税込)/月
            </p>
          </button>
          <button
            className={`${
              payMonthRange == 12 ? "bg-white text-black" : "bg-black"
            } group relative w-40 max-w-sm rounded-lg border border-gray-200 py-6 shadow transition-all hover:bg-white hover:text-black`}
            onClick={() => setPayRange(12)}
          >
            <div className="absolute right-[-10px] top-[-15px] rounded-full border border-green-300 bg-black/60 p-1.5 px-4 text-sm text-white backdrop-blur-xl transition-all">
              <p>1,960円お得</p>
            </div>

            <h5 className="mb-2 text-2xl font-bold tracking-tight">年間</h5>
            <p
              className={`${
                payMonthRange == 12 ? "text-gray-500" : ""
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
        <div className="my-5 ml-4 text-white">支払方法を選択してください。</div>
        <div className="flex justify-around text-white">
          <button
            className={`${
              payMethod == "credit" ? "bg-white text-black" : "bg-black"
            } relative w-44 rounded-lg border border-gray-200 bg-black py-6 shadow transition-all hover:bg-white hover:text-black`}
            onClick={() => setPayMethod("credit")}
          >
            <h5 className="mb-5 text-lg font-bold">クレジットカード</h5>
            <div className="mx-auto flex w-40 justify-around">
              {/* flex内では他の画像サイズによって比率が帰られてしまうためclassでピクセル指定を追加で行った */}
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
          <button
            className={`${
              payMethod == "paidy" ? "bg-white text-black" : "bg-black"
            } group relative w-44 rounded-lg border border-gray-200 bg-black shadow transition-all  hover:bg-white hover:text-black`}
            onClick={() => setPayMethod("paidy")}
          >
            <h5 className="my-3 ml-3 font-bold">あと払い（ペイディ）</h5>
            <div className="mx-auto flex justify-around">
              <Image
                className={`h-auto w-36 group-hover:visible ${
                  payMethod == "paidy" ? "visible" : "invisible"
                }`}
                src="/paidy-logo-light.png"
                alt="paidyLogo"
                width={130}
                height={0}
              />
              <Image
                className={`absolute h-auto w-36 group-hover:invisible ${
                  payMethod == "paidy" ? "invisible" : "visible"
                }`}
                src="/paidy-logo-dark.png"
                alt="paidyLogo"
                width={130}
                height={0}
              />
            </div>
          </button>
        </div>
        <div className="mr-6 mt-5 text-right">
          ※「ペイディ」については
          <Link
            href="https://paidy.com/landing/"
            className="text-blue-400"
            target="_blank"
            rel="noopener noreferrer"
          >
            こちら
          </Link>
        </div>

        {/* paidyでローカルでテストする際はコントロールパネルの設定を変更するように */}
        <form
          onSubmit={payMethod == "paidy" ? onPaidySubmit : () => {}}
          action={
            payMethod == "credit"
              ? "https://credit.j-payment.co.jp/link/creditcard"
              : ""
          }
          method="POST"
        >
          {/* robot paymentテスト決済時にエラーが出る場合は過去の決済を消して上限？を回復させるように */}
          <input type="hidden" name="aid" value="127241" />
          <input
            type="hidden"
            name="iid"
            value={payMonthRange == 1 ? "month_plan" : "year_plan"}
          />
          <input type="hidden" name="em" value={eMail} />

          <motion.div
            className={payMethod == "paidy" ? "visible" : "invisible"}
            variants={variants}
            initial="closed"
            animate={payMethod == "paidy" ? "open" : "closed"}
            transition={{ duration: 0.3 }}
          >
            <div className="ml-6">
              <label
                htmlFor="first_name"
                className="mb-2 block text-sm font-medium leading-6"
              >
                名前
              </label>
              <label
                htmlFor="first_name"
                className="mr-2 text-sm font-medium leading-6"
              >
                姓：
              </label>
              <input
                maxLength={30}
                id="first_name"
                type="text"
                className="w-28 rounded-md border-0 px-3 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                {...paidyRegister("first_name", { required: true })}
              />
              <label
                htmlFor="last_name"
                className="ml-4 mr-2 text-sm font-medium leading-6"
              >
                名：
              </label>
              <input
                maxLength={30}
                id="last_name"
                type="text"
                className="w-28 rounded-md border-0 px-3 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                {...paidyRegister("last_name", { required: true })}
              />
              {paidyErrors.first_name && (
                <div className="text-red-500">姓を入力してください。</div>
              )}
              {paidyErrors.last_name && (
                <div className="text-red-500">名を入力してください。</div>
              )}
              <div className="mt-5 w-36">
                <label
                  htmlFor="zip"
                  className="my-2 text-sm font-medium leading-6"
                >
                  郵便番号
                </label>
                <div className="mt-2 rounded-md shadow-sm">
                  <input
                    id="zip"
                    type="tel"
                    minLength={7}
                    maxLength={8}
                    className="w-36 rounded-md border-0 py-1.5 pl-3  text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    {...paidyRegister("zip", {
                      required: "郵便番号を入力してください。",
                      pattern: {
                        value: /^[0-9]{3}-?[0-9]{4}$/,
                        message:
                          "郵便番号は数字3桁-数字4桁の形式で入力してください（例：123-4567）",
                      },
                    })}
                  />
                </div>
              </div>
              <div className="text-red-500">{paidyErrors.zip?.message}</div>
            </div>
          </motion.div>
          <div className="flex justify-end">
            <button
              className={`${
                isNotPayable ? "cursor-not-allowed opacity-50" : ""
              } mr-2 mt-4 flex w-48 rounded-lg border border-gray-200 bg-black p-4 shadow transition-all hover:bg-white hover:text-black`}
              type="submit"
              name="submit"
              value="購入"
              disabled={isNotPayable}
            >
              <h5 className="mr-3 w-full text-2xl font-bold">
                {logined != true ? "未ログイン" : "支払へ進む"}
              </h5>
              <ArrowRightCircle className="h-8 w-8" />
            </button>
          </div>
        </form>
        {isPaid && (
          <div className="mr-2 text-sm text-red-400">
            現在、お客様は支払済みの有料プラン期間内です。
            <br />
            期間外後にお試しください。
          </div>
        )}
      </div>
    </>
  );
}
