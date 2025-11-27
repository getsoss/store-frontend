// api/auth/kakao/callback/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const backendUrl = `http://localhost:8080/api/auth/oauth/kakao/callback?code=${code}`;

  try {
    const backendRes = await fetch(backendUrl, {
      method: "GET",
      credentials: "include",
      // 상태 코드를 읽기 위해 response.json() 전에 확인 필요
    });

    const data = await backendRes.json();

    // 1. 카카오 연동 회원가입이 필요한 경우 (백엔드에서 307 응답)
    // 백엔드가 307로 응답해도 fetch는 응답을 그대로 가져오므로 상태 코드를 직접 확인할 필요가 있습니다.
    // 여기서는 body에 담긴 "redirect" 필드를 기준으로 판단합니다.
    if (data.redirect === "/signup/kakao") {
      const redirectUrl = new URL(
        // 쿼리 파라미터에 kakaoId 추가
        `/signup/kakao?email=${encodeURIComponent(
          data.email
        )}&name=${encodeURIComponent(data.name)}&kakaoId=${encodeURIComponent(
          data.kakaoId
        )}`,
        request.url
      );
      return NextResponse.redirect(redirectUrl);
    }

    // 2. 카카오 로그인 성공 (기존 회원)
    if (backendRes.ok) {
      const setCookieHeaders = backendRes.headers.getSetCookie(); // 최신 Next.js API 사용

      // 기존의 토큰 응답 처리 (백엔드가 refreshToken을 쿠키로 설정했으므로, 여기서는 accessToken만 처리)
      const redirectUrl = new URL(
        `/auth/kakao/callback?accessToken=${data.accessToken}`,
        request.url
      );

      const res = NextResponse.redirect(redirectUrl);

      // 백엔드에서 설정한 refreshToken 쿠키를 프론트엔드 응답 헤더에 추가
      if (setCookieHeaders && setCookieHeaders.length > 0) {
        setCookieHeaders.forEach((cookie) =>
          res.headers.append("set-cookie", cookie)
        );
      }
      return res;
    }

    // 기타 에러 처리
    throw new Error(data.error || "카카오 로그인 처리 실패");
  } catch (error: any) {
    console.error("Kakao Callback Error:", error);
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(
          error.message || "서버 오류가 발생했습니다."
        )}`,
        request.url
      )
    );
  }
}
