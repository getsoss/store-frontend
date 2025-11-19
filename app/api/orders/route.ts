import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("Authorization");

    if (!authorization) {
      return NextResponse.json(
        { error: "인증 토큰이 필요합니다." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const res = await fetch("http://localhost:8080/api/orders", {
      method: "POST",
      headers: {
        Authorization: authorization,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();

    if (!res.ok) {
      return NextResponse.json(
        { error: text || "주문 추가에 실패했습니다. " },
        { status: res.status }
      );
    }
    return NextResponse.json(
      {
        message: text || "주문이 추가되었습니다.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("주문 추가 API 오류: ", error);
    return NextResponse.json(
      { error: error?.message || "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
