import { getApp, getApps, initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
const firebaseConfig = {
  apiKey: "AIzaSyAoLSR96ukfHMpRvy9_Ln_SDcDYunJYkEQ",
  authDomain:
    process.env.NODE_ENV !== "production"
      ? "keiba-web-forgcf.firebaseapp.com"
      : "reversekeiba.com", //firebaseのcookieチェック回避用（参考：https://qiita.com/ryoko_yamazaki/items/3f7c7d4acba074490b96）
  projectId: "keiba-web-forgcf",
  storageBucket: "keiba-web-forgcf.appspot.com",
  messagingSenderId: "623337494542",
  appId: "1:623337494542:web:4e3cd897c71fce487ac45f",
  measurementId: "G-P4CNX8FVMN",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const functions = getFunctions(app, "asia-northeast1");
//エミュレート時のCLoud Functions用
if (process.env.NODE_ENV !== "production")
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
export { auth, db, functions, provider };
