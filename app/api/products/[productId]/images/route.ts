import { NextRequest, NextResponse } from "next/server";

export async function GET(productId: number) {
  try {
    const res = await fetch(
      `http://localhost:8080/api/products/${productId}/images`
    );
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        {
          error: text || "서버 요청 실패",
        },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "서버 요청 실패" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await context.params;
    const formData = await request.formData();

    const res = await fetch(
      `http://localhost:8080/api/products/${productId}/images`,
      {
        method: "POST",
        body: formData,
      }
    );

    const text = await res.text();

    if (!res.ok) {
      return NextResponse.json(
        { error: text || "업로드 실패" },
        { status: res.status }
      );
    }

    const data = text ? JSON.parse(text) : null;
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: error?.message || "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
