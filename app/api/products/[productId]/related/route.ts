import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ productId: string }> } // params는 Promise
) {
  // params await 해서 unwrap
  const params = await context.params;
  const productId = params.productId;

  try {
    // Spring Boot 관련상품 API 호출
    const res = await fetch(
      `http://localhost:8080/api/products/${productId}/related`
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: text || "서버 요청 실패" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "서버 요청 실패" },
      { status: 500 }
    );
  }
}
