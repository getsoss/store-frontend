import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // authorization 헤더 가져오기
    const authorization = request.headers.get("authorization");

    const headers: HeadersInit = {};
    if (authorization) {
      headers.Authorization = authorization;
    }

    // 백엔드 호출 (환경변수 없이 로컬 주소 사용)
    const res = await fetch("http://localhost:8080/api/members/me/orders", {
      headers,
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: text || "서버 요청 실패" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "서버 요청 실패" },
      { status: 500 }
    );
  }
}
