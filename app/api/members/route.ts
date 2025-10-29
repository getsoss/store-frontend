import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const res = await fetch("http://localhost:8080/api/members", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.text();

    if (!res.ok) {
      return NextResponse.json(
        { error: data || "Request failed" },
        { status: res.status }
      );
    }

    return NextResponse.json(
      { message: "회원가입이 완료되었습니다." },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
