import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { error: "리프레시 토큰이 필요합니다." },
        { status: 400 }
      );
    }

    const backendUrl = "http://localhost:8080/api/auth/refresh";

    const res = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
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
