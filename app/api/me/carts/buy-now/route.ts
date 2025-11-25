import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { productId, quantity, productSizeId } = body as {
      productId: number;
      quantity: number;
      productSizeId: number;
    };

    if (!productSizeId) {
      return NextResponse.json(
        { error: "사이즈를 선택해주세요." },
        { status: 400 }
      );
    }

    const backendRes = await fetch("http://localhost:8080/api/carts/buy-now", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId, quantity, productSizeId }),
    });

    if (!backendRes.ok) {
      let errMsg = "바로 구매 처리 실패";

      try {
        const text = await backendRes.text();
        if (text) {
          const err = JSON.parse(text);
          errMsg = err.message || errMsg;
        }
      } catch (e) {
        // JSON 파싱 실패해도 무시
      }

      return NextResponse.json({ error: errMsg }, { status: 400 });
    }

    const data = await backendRes.json();

    // 성공 시 장바구니 상태 반환
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Buy-now route error:", error);
    return NextResponse.json(
      { error: error.message || "서버 오류" },
      { status: 500 }
    );
  }
};
