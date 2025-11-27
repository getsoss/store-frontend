import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = await params;

    const authorization = request.headers.get("Authorization");
    if (!authorization) {
      return NextResponse.json(
        { error: "인증 토큰이 필요합니다." },
        { status: 401 }
      );
    }
    const body = await request.json();

    if (!body.hashtags || !Array.isArray(body.hashtags)) {
      return NextResponse.json(
        { error: "hashtags 배열을 전달해야 합니다." },
        { status: 400 }
      );
    }

    const res = await fetch(
      `http://localhost:8080/api/products/${productId}/hashtags`,
      {
        method: "POST",
        headers: {
          Authorization: authorization,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await res.text();

    if (!res.ok) {
      return NextResponse.json(
        { error: data || "해시태그 매핑 실패" },
        { status: res.status }
      );
    }

    return NextResponse.json(
      { message: "상품에 해시태그가 연동되었습니다." },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
