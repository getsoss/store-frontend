// app/mypage/edit/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // authorization 헤더 가져오기 (JWT 등)
    const authorization = request.headers.get("authorization");

    const headers: HeadersInit = {};
    if (authorization) headers.Authorization = authorization;

    // Spring API 호출 (로컬)
    const res = await fetch("http://localhost:8080/api/members/me", {
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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // authorization 헤더 가져오기
    const authorization = request.headers.get("authorization");

    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (authorization) headers.Authorization = authorization;

    // Spring API 호출
    const res = await fetch("http://localhost:8080/api/members/edit", {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: text || "회원정보 수정 실패" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "회원정보 수정 실패" },
      { status: 500 }
    );
  }
}
