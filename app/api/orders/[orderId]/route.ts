import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> } // params가 Promise임
) {
  const { orderId } = await context.params; // 반드시 await 필요

  try {
    const body = await request.json();

    // Spring 서버 호출
    const res = await fetch(`http://localhost:8080/api/orders/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: request.headers.get("Authorization") || "",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error || "업데이트 실패" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "서버 오류" },
      { status: 500 }
    );
  }
}
