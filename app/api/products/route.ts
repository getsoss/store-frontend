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
    const form = await request.formData();
    const name = form.get("name") as string | null;
    const description = form.get("description") as string | null;
    const priceStr = form.get("price") as string | null;
    const categoryIdStr = form.get("category_id") as string | null;

    const price = priceStr != null ? Number(priceStr) : undefined;
    const categoryId =
      categoryIdStr != null ? Number(categoryIdStr) : undefined;

    const body: any = {
      name: name ?? undefined,
      description: description ?? undefined,
      price,
      categoryId,
    };

    const res = await fetch("http://localhost:8080/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.text();

    if (!res.ok) {
      return NextResponse.json(
        { error: data || "Request failed" },
        { status: res.status }
      );
    }

    return NextResponse.json(
      { message: "상품이 등록되었습니다." },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
