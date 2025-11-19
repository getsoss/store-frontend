import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { paymentKey, orderId, amount } = await req.json();

  const secretKey = "test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6";
  const encrypted = "Basic " + Buffer.from(secretKey + ":").toString("base64");

  // 🔥 Toss API에 직접 요청 (여기서 전체 결제 정보가 옴)
  const tossRes = await fetch(
    "https://api.tosspayments.com/v1/payments/confirm",
    {
      method: "POST",
      headers: {
        Authorization: encrypted,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    }
  );

  const data = await tossRes.json();

  // 🔥 전체 결제 응답을 콘솔에서 확인
  console.log("TOSS 전체 응답:", data);

  // 🔥 전체 응답을 Spring 서버로 전달
  await fetch("http://localhost:8080/api/payments/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return NextResponse.json(data);
}
