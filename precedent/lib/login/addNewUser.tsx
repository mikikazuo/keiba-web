"use client";

import { auth, db } from "@/lib/firebaseSDK/firebase-config";
import {
  UserCredential,
  getAdditionalUserInfo,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

/** 新規ユーザ追加 */
export const addUser = (userCred: UserCredential) => {
  if (getAdditionalUserInfo(userCred)?.isNewUser)
    onAuthStateChanged(auth, async (user) => {
      if (user)
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          paymentType: null,
          payMonthRange: null,
          subscriptionId: null,
          paymentId: null,
          subscriptionStartDate: null,
          subscriptionEndDate: null,
          nextPayDate: null,
        });
    });
};
