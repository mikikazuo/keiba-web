"use client";

import { Google, LoadingDots } from "@/components/shared/icons";
import Modal from "@/components/shared/modal";
import { sendSignInLinkToEmail, signInWithPopup } from "firebase/auth";
import Image from "next/image";

import { auth, provider } from "@/lib/firebaseSDK/firebase-config";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { useForm } from "react-hook-form";

const actionCodeSettings = {
  // URL you want to redirect back to. The domain (www.example.com) for this
  // URL must be in the authorized domains list in the Firebase Console.
  url:
    process.env.NODE_ENV !== "production"
      ? "http://localhost:3000"
      : "https://reversekeiba.com",
  // This must be true.
  handleCodeInApp: true,
};

const SignInModal = ({
  showSignInModal,
  setShowSignInModal,
}: {
  showSignInModal: boolean;
  setShowSignInModal: Dispatch<SetStateAction<boolean>>;
}) => {
  const [signInClicked, setSignInClicked] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);

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

  return (
    <Modal showModal={showSignInModal} setShowModal={setShowSignInModal}>
      <div className="w-full overflow-hidden shadow-xl md:max-w-md md:rounded-2xl md:border md:border-gray-200">
        <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-200 bg-white px-4 py-6 pt-8 text-center md:px-16">
          <a href="https://precedent.dev">
            <Image
              src="/logo.png"
              alt="Logo"
              className="h-10 w-10 rounded-full"
              width={20}
              height={20}
            />
          </a>
          <h3 className="font-display text-2xl font-bold">ログイン</h3>
          <p className="text-sm text-gray-500">
            有料プラン登録済みの方はログインしてください。
          </p>
        </div>

        <div className="flex flex-col space-y-4 bg-gray-50 px-4 py-8 md:px-12">
          {sendEmail ? (
            <div className="mx-auto">
              メールを送信しました。
              <br />
              メール記載のURLからログインしてください。
            </div>
          ) : (
            <>
              <button
                disabled={signInClicked}
                className={`${
                  signInClicked
                    ? "cursor-not-allowed border-gray-200 bg-gray-100"
                    : "border border-gray-200 bg-white text-black hover:bg-gray-50"
                } flex h-10 w-full items-center justify-center space-x-3 rounded-md border text-sm shadow-sm transition-all duration-75 focus:outline-none`}
                onClick={() => {
                  setSignInClicked(true);
                  //signInWithRedirect(auth, provider);  //リダイレクト方式無効
                  signInWithPopup(auth, provider);
                  setShowSignInModal(false);
                }}
              >
                {signInClicked ? (
                  <LoadingDots color="#808080" />
                ) : (
                  <>
                    <Google className="h-5 w-5" />
                    <p>Googleアカウントでログイン</p>
                  </>
                )}
              </button>
              {/* <form
                ref={formRef}
                className="mb-4 mt-8 rounded bg-gray-100 px-8 pb-8 pt-6 shadow-md"
                onSubmit={onSubmit}
              >
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
                    <p>メールアドレスでログイン </p>
                  )}
                </button>
              </form> */}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export function useSignInModal() {
  const [showSignInModal, setShowSignInModal] = useState(false);

  const SignInModalCallback = useCallback(() => {
    return (
      <SignInModal
        showSignInModal={showSignInModal}
        setShowSignInModal={setShowSignInModal}
      />
    );
  }, [showSignInModal, setShowSignInModal]);

  return useMemo(
    () => ({ SignInModal: SignInModalCallback, setShowSignInModal }),
    [SignInModalCallback, setShowSignInModal],
  );
}
