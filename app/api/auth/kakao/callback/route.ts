import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent(
            "카카오 로그인이 취소되었습니다."
          )}`,
          request.url
        )
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL(
          "/login?error=" + encodeURIComponent("인증 코드가 없습니다."),
          request.url
        )
      );
    }

    const res = await fetch(
      `http://localhost:8080/api/auth/oauth/kakao/callback?code=${code}`,
      {
        method: "GET",
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent(errorText || "로그인 실패")}`,
          request.url
        )
      );
    }

    const data = await res.json();
    const token = data?.accessToken;

    if (!token) {
      return NextResponse.redirect(
        new URL(
          "/login?error=" + encodeURIComponent("토큰을 받지 못했습니다."),
          request.url
        )
      );
    }

    return NextResponse.redirect(
      new URL(
        `/auth/kakao/callback?token=${encodeURIComponent(token)}`,
        request.url
      )
    );
  } catch (error: any) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(error?.message || "서버 오류")}`,
        request.url
      )
    );
  }
}
