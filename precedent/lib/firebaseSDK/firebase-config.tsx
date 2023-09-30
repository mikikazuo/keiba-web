import { getApp, getApps, initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAoLSR96ukfHMpRvy9_Ln_SDcDYunJYkEQ",
  //authDomain: "keiba-web-forgcf.firebaseapp.com",
  authDomain: "reversekeiba.com", //firebaseのcookieチェック回避用（参考：https://qiita.com/ryoko_yamazaki/items/3f7c7d4acba074490b96）
  projectId: "keiba-web-forgcf",
  storageBucket: "keiba-web-forgcf.appspot.com",
  messagingSenderId: "623337494542",
  appId: "1:623337494542:web:4e3cd897c71fce487ac45f",
  measurementId: "G-P4CNX8FVMN",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
