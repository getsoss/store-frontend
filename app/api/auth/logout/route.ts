import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.headers
      .get("authorization")
      ?.replace("Bearer ", "");
    if (!accessToken) {
      return NextResponse.json(
        { error: "토큰이 필요합니다." },
        { status: 400 }
      );
    }

    const res = await fetch("http://localhost:8080/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.text();
      return NextResponse.json(
        { error: errorData || "로그아웃 요청에 실패했습니다." },
        { status: res.status }
      );
    }

    return NextResponse.json({ message: "로그아웃 성공" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
