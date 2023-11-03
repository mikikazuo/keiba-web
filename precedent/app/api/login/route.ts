import { customInitApp } from "@/lib/firebaseSDK/firebase-admin-config";
import { auth } from "firebase-admin";
import { cookies, headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
// 関数外でも、このファイルに記載したAPIを呼び出す時に毎回呼ばれる
// Init the Firebase SDK every time the server is called
customInitApp();

/** ログイン中か確認 */
export async function GET(request: NextRequest) {
  const session = cookies().get("session")?.value || "";

  //Validate if the cookie exist in the request
  if (!session) return NextResponse.json({ isLogged: false }, { status: 401 });

  //Use Firebase Admin to validate the session cookie
  const decodedClaims = await auth().verifySessionCookie(session, true);
  if (!decodedClaims)
    return NextResponse.json({ isLogged: false }, { status: 401 });
  //TODO クッキー期限の検証
  return NextResponse.json({ isLogged: true }, { status: 200 });
}

/** ログイン */
export async function POST(request: NextRequest, response: NextResponse) {
  const authorization = headers().get("Authorization");
  if (authorization?.startsWith("Bearer ")) {
    const idToken = authorization.split("Bearer ")[1];
    const decodedToken = await auth().verifyIdToken(idToken);
    if (decodedToken) {
      //Generate session cookie
      const expiresIn = 60 * 60 * 24 * 5 * 1000;
      /** トークンと有効期限でクッキーに保存する用の値を作成（idトークンの後半部分が改変されている) */
      const sessionCookie = await auth().createSessionCookie(idToken, {
        expiresIn,
      });
      const options = {
        name: "session",
        value: sessionCookie,
        maxAge: expiresIn,
        httpOnly: true,
        secure: true,
      };

      //Add the cookie to the browser
      cookies().set(options);
    }
  }

  return NextResponse.json({}, { status: 200 });
}
