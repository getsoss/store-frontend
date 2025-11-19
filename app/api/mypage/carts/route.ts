import { NextRequest, NextResponse } from "next/server";

// 장바구니 조회
export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("Authorization");

    if (!authorization) {
      return NextResponse.json(
        { error: "인증 토큰이 필요합니다." },
        { status: 401 }
      );
    }

    const res = await fetch("http://localhost:8080/api/carts", {
      method: "GET",
      headers: {
        Authorization: authorization,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: text || "장바구니 조회에 실패했습니다." },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("장바구니 조회 API 오류:", error);
    return NextResponse.json(
      { error: error?.message || "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 장바구니 등록
export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("Authorization");

    if (!authorization) {
      return NextResponse.json(
        { error: "인증 토큰이 필요합니다." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const res = await fetch("http://localhost:8080/api/carts", {
      method: "POST",
      headers: {
        Authorization: authorization,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();

    if (!res.ok) {
      return NextResponse.json(
        { error: text || "장바구니 추가에 실패했습니다." },
        { status: res.status }
      );
    }

    return NextResponse.json(
      { message: text || "장바구니에 추가되었습니다." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("장바구니 추가 API 오류:", error);
    return NextResponse.json(
      { error: error?.message || "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 장바구니 상품 삭제
export async function DELETE(request: NextRequest) {
  try {
    const authorization = request.headers.get("Authorization");

    if (!authorization) {
      return NextResponse.json(
        { error: "인증 토큰이 필요합니다." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const res = await fetch("http://localhost:8080/api/carts", {
      method: "DELETE",
      headers: {
        Authorization: authorization,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();

    if (!res.ok) {
      return NextResponse.json(
        { error: text || "장바구니 삭제에 실패했습니다." },
        { status: res.status }
      );
    }

    return NextResponse.json(
      { message: text || "장바구니에서 삭제되었습니다." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("장바구니 삭제 API 오류:", error);
    return NextResponse.json(
      { error: error?.message || "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
