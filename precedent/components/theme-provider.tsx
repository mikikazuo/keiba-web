// "use client";

// import { auth } from "@/lib/firebaseSDK/firebase-config";
// import type { User } from "@firebase/auth";
// import {
//   getAdditionalUserInfo,
//   getRedirectResult,
//   onAuthStateChanged,
// } from "firebase/auth";
// import { createContext, useContext, useEffect, useState } from "react";

// /** nullは未ログイン、undefinedはログインかどうか確認中 */
// export type GlobalAuthState = { user: User | null | undefined };
// const initialState: GlobalAuthState = { user: undefined };
// const nullState: GlobalAuthState = { user: null };
// const AuthContext = createContext<GlobalAuthState>(initialState);
export default function ThemeProvider({}) {
  return null;
}
// /** ログイン処理（参考：https://zenn.dev/hisho/books/617d8f9d6bd78b/viewer/chapter7） */
// export default function ThemeProvider({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const [user, setUser] = useState<GlobalAuthState>(initialState);

//   useEffect(() => {
//     getRedirectResult(auth).then((result) => {
//       if (result && getAdditionalUserInfo(result)?.isNewUser)
//         console.log("初回登録");
//     });
//     try {
//       return onAuthStateChanged(auth, (user) => setUser({ user }));
//     } catch (error) {
//       setUser(nullState);
//       throw error;
//     }
//   }, [auth]);

//   return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
// }
// export const useAuthContext = () => useContext(AuthContext);
// /**
//  * ログイン状態に応じた表示の切り替え
//  * @param logined ログイン中
//  * @param logouted ログアウト中
//  * @param confiming ログイン状態の確認中
//  * @returns
//  */
// export const useAuthContextPrint = (
//   logined: JSX.Element,
//   logouted: JSX.Element,
//   confiming: JSX.Element,
// ) => {
//   const { user } = useAuthContext();

//   return user ? logined : user === null ? logouted : confiming;
// };
