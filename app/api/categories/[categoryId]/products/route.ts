import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const { categoryId } = await params;
    const res = await fetch(
      `http://localhost:8080/api/categories/${categoryId}/products`
    );
    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || "서버 요청 실패",
      },
      { status: 500 }
    );
  }
}
