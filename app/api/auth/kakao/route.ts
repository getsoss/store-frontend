import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const code = formData.get("code") as string;

    if (!code) {
      return NextResponse.json(
        { error: "인가 코드가 필요합니다." },
        { status: 400 }
      );
    }

    const backendUrl = "http://localhost:8080/api/auth/oauth/kakao/token";
    const params = new URLSearchParams();
    params.append("code", code);

    const res = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!res.ok) {
      const errorData = await res
        .json()
        .catch(() => ({ error: "카카오 로그인 실패" }));
      return NextResponse.json(
        {
          error:
            errorData.error ||
            errorData.message ||
            "카카오 로그인 요청에 실패했습니다.",
        },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("카카오 로그인 API 오류:", error);
    return NextResponse.json(
      { error: error?.message || "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
