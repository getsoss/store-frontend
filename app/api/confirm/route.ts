import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { paymentKey, orderId, amount } = await req.json();

  const res = await fetch("http://localhost:8080/api/payment/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });

  if (!res.ok) {
    return NextResponse.json(
      { message: "서버 응답이 실패했습니다." },
      { status: res.status }
    );
  }
  const data = await res.json();
  return NextResponse.json(data);
}
