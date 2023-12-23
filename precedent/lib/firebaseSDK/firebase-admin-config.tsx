import { cert, getApps, initializeApp } from "firebase-admin/app";

/**
 * firebase admin設定　参考 https://kiyobl.com/firebase-admin/
 * FIREBASE_ は reserved prefixなためFB_にした 参考 https://zenn.dev/nbstsh/scraps/c6f51aeff03cea#comment-6ff850073560e2
 */
const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FB_PROJECT_ID,
    clientEmail: process.env.FB_CLIENT_EMAIL,
    privateKey: process.env.FB_PRIVATE_KEY!.replace(/\\n/g, "\n"),
  }),
};

export function customInitApp() {
  if (getApps().length <= 0) {
    initializeApp(firebaseAdminConfig);
  }
}
