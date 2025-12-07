import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";

/**
 * firebase admin設定　参考 https://kiyobl.com/firebase-admin/
 * FIREBASE_ は reserved prefixなためFB_にした 参考 https://zenn.dev/nbstsh/scraps/c6f51aeff03cea#comment-6ff850073560e2
 * .env.localがfirebase hostingでは認識されないためデプロイする場合にのみ以下を直接代入へ変更すること
 */
export function customInitApp() {
  try {
    getApp();
  } catch {
    if (
      process.env.FB_PROJECT_ID &&
      process.env.FB_CLIENT_EMAIL &&
      process.env.FB_PRIVATE_KEY
    ) {
      const firebaseAdminConfig = {
        credential: cert({
          projectId: process.env.FB_PROJECT_ID,
          clientEmail: process.env.FB_CLIENT_EMAIL,
          privateKey: process.env.FB_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      };
      initializeApp(firebaseAdminConfig);
    } else {
      // 環境変数が設定されていない場合（Cloud Functionsなど）、デフォルトの認証情報を使用
      // プロジェクトIDを明示的に設定（デプロイ先で自動設定されない場合があるため）
      initializeApp({ projectId: "keiba-web-forgcf" });
    }
  }
}
