import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ cartId: string }> } // params는 Promise
) {
  try {
    const { cartId } = await params; // ✅ await로 풀기

    const authorization = request.headers.get("Authorization");
    if (!authorization) {
      return NextResponse.json(
        { error: "인증 토큰이 필요합니다." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const res = await fetch(`http://localhost:8080/api/carts/${cartId}`, {
      method: "PATCH",
      headers: {
        Authorization: authorization,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();

    if (!res.ok) {
      return NextResponse.json(
        { error: text || "장바구니 수량 변경에 실패했습니다." },
        { status: res.status }
      );
    }

    return NextResponse.json(
      { message: text || "장바구니 수량이 변경되었습니다." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("PATCH 장바구니 API 오류:", error);
    return NextResponse.json(
      { error: error?.message || "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
