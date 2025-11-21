import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code");

    const backendRes = await fetch(
      `http://localhost:8080/api/auth/oauth/kakao/callback?code=${code}`,
      {
        method: "GET",
        credentials: "include", // 중요
      }
    );

    const setCookie = backendRes.headers.get("set-cookie"); // ★★★ 중요 ★★★
    const data = await backendRes.json();

    const redirectUrl = new URL(
      `/auth/kakao/callback?accessToken=${data.accessToken}&refreshToken=${data.refreshToken}`,
      request.url
    );

    const res = NextResponse.redirect(redirectUrl);

    if (setCookie) {
      res.headers.set("set-cookie", setCookie); // ★ 브라우저로 전달
    }

    return res;
  } catch (error: any) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent("서버오류")}`, request.url)
    );
  }
}
