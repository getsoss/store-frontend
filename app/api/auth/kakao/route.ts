import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const code = formData.get("code") as string;

    if (!code) {
      return NextResponse.json(
        { error: "인가 코드가 필요합니다." },
        { status: 400 }
      );
    }

    const backendUrl = "http://localhost:8080/api/auth/oauth/kakao/token";

    const params = new URLSearchParams();
    params.append("code", code);

    const backendRes = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
      credentials: "include", // 중요!
    });

    const setCookie = backendRes.headers.get("set-cookie"); // ★★★ 핵심 ★★★

    const responseJson = await backendRes.json();

    const nextResponse = NextResponse.json(responseJson);

    if (setCookie) {
      nextResponse.headers.set("set-cookie", setCookie); // ★ 쿠키 전달 ★
    }

    return nextResponse;
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "서버 오류" },
      { status: 500 }
    );
  }
}
