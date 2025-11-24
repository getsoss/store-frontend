import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || "0";
    const size = searchParams.get("size") || "12";

    const res = await fetch(
      `http://localhost:8080/api/products?page=${page}&size=${size}`
    );

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
    const body = await request.json(); // 그대로 받기

    const res = await fetch("http://localhost:8080/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body), // 그대로 전달
    });

    const text = await res.text();
    if (!res.ok)
      return NextResponse.json(
        { error: text || "Request failed" },
        { status: res.status }
      );

    const created = text ? JSON.parse(text) : null;
    return NextResponse.json(created, { status: 200 });
  } catch (error: any) {
    console.error("상품 업로드 오류:", error);
    return NextResponse.json(
      { error: error?.message || "서버 오류" },
      { status: 500 }
    );
  }
}
