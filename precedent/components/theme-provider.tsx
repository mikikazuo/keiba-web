"use client";

import { auth } from "@/lib/firebaseSDK/firebase-config";
import type { User } from "@firebase/auth";
import {
  getAdditionalUserInfo,
  getRedirectResult,
  onAuthStateChanged,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";

export type GlobalAuthState = { user: User | null | undefined };
const initialState: GlobalAuthState = { user: undefined };
const nullState: GlobalAuthState = { user: null };
const AuthContext = createContext<GlobalAuthState>(initialState);

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<GlobalAuthState>(initialState);

  useEffect(() => {
    getRedirectResult(auth).then((result) => {
      if (result && getAdditionalUserInfo(result)?.isNewUser)
        console.log("初回登録");
    });

    try {
      return onAuthStateChanged(auth, (user) => setUser({ user }));
    } catch (error) {
      setUser(nullState);
      throw error;
    }
  }, [auth]);

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}
export const useAuthContext = () => useContext(AuthContext);
