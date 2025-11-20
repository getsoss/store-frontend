import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // 클라이언트가 body에 담지 않으므로 쿠키에서 가져오기
    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "리프레시 토큰이 필요합니다." },
        { status: 401 }
      );
    }

    const res = await fetch("http://localhost:8080/api/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `refreshToken=${refreshToken}`, // 쿠키 전달
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Refresh 요청 실패:", errorText);
      return NextResponse.json(
        { error: errorText || "Refresh 요청 실패" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Refresh 요청 오류", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
