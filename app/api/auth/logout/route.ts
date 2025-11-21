import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.headers
      .get("authorization")
      ?.replace("Bearer ", "");
    if (!accessToken) {
      return NextResponse.json({ error: "토큰 필요" }, { status: 400 });
    }

    // 백엔드 로그아웃 요청
    const res = await fetch("http://localhost:8080/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: text || "로그아웃 실패" },
        { status: res.status }
      );
    }

    // 브라우저 쿠키 삭제
    const response = NextResponse.json({ message: "로그아웃 성공" });
    response.cookies.set({
      name: "refreshToken",
      value: "",
      path: "/", // 쿠키 경로
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // 즉시 만료
    });

    return response;
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "서버 오류" },
      { status: 500 }
    );
  }
}
