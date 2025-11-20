import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Spring Boot 로그인 요청
    const res = await fetch("http://localhost:8080/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include", // Spring과의 쿠키 통신이 필요한 경우
    });

    const data = await res.json();

    // NextResponse 생성
    const response = NextResponse.json(data, { status: res.status });

    // Spring Boot에서 내려준 Set-Cookie를 브라우저로 전달
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
      response.headers.set("set-cookie", setCookie); // 중요
    }

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
