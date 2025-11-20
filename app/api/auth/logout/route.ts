import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.headers
      .get("authorization")
      ?.replace("Bearer ", "");
    if (!accessToken) {
      return NextResponse.json({ error: "토큰 필요" }, { status: 400 });
    }

    const res = await fetch("http://localhost:8080/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include", // 쿠키 포함
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: text || "로그아웃 실패" },
        { status: res.status }
      );
    }

    return NextResponse.json({ message: "로그아웃 성공" });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "서버 오류" },
      { status: 500 }
    );
  }
}
