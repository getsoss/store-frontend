import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization) {
      return NextResponse.json({ error: "인증 토큰 필요" }, { status: 401 });
    }

    const res = await fetch("http://localhost:8080/api/orders", {
      headers: { Authorization: authorization },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: text || "주문 조회 실패" },
        { status: res.status }
      );
    }

    const existingOrder = await res.json();
    return NextResponse.json(existingOrder || null, { status: 200 });
  } catch (err: any) {
    console.error("GET 주문 API 오류:", err);
    return NextResponse.json(
      { error: err.message || "서버 오류" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization) {
      return NextResponse.json({ error: "인증 토큰 필요" }, { status: 401 });
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

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: text || "주문 생성 실패" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("POST 주문 API 오류:", err);
    return NextResponse.json(
      { error: err.message || "서버 오류" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization) {
      return NextResponse.json({ error: "인증 토큰 필요" }, { status: 401 });
    }

    const body = await request.json();
    const orderId = params.orderId;

    const res = await fetch(`http://localhost:8080/api/orders/${orderId}`, {
      method: "PATCH",
      headers: {
        Authorization: authorization,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: text || "주문 수정 실패" },
        { status: res.status }
      );
    }

    const dataText = await res.text();
    const data = dataText ? JSON.parse(dataText) : null;

    return NextResponse.json(data || { orderId }, { status: 200 });
  } catch (err: any) {
    console.error("PATCH 주문 API 오류:", err);
    return NextResponse.json(
      { error: err.message || "서버 오류" },
      { status: 500 }
    );
  }
}
