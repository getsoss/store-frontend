import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://localhost:8080/api/products");
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: text || "서버 요청 실패" },
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

export async function POST(request: NextRequest) {
  try {
    // 🔹 JSON 데이터 파싱
    const { name, description, price, category_id } = await request.json();

    const body = {
      name,
      description,
      price,
      categoryId: category_id, // 필드명 맞추기기
    };

    const res = await fetch("http://localhost:8080/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();

    if (!res.ok) {
      return NextResponse.json(
        { error: text || "Request failed" },
        { status: res.status }
      );
    }

    // 🔹 백엔드에서 반환된 상품 데이터 그대로 전달
    const created = text ? JSON.parse(text) : null;
    return NextResponse.json(created, { status: 200 });
  } catch (error: any) {
    console.error("상품 업로드 오류:", error);
    return NextResponse.json(
      { error: error?.message || "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
