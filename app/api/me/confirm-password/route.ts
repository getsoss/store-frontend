import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authorization = request.headers.get("authorization");

    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (authorization) headers.Authorization = authorization;

    const res = await fetch(
      "http://localhost:8080/api/members/me/confirm-password",
      {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: text || "비밀번호 확인 실패" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "비밀번호 확인 실패" },
      { status: 500 }
    );
  }
}
