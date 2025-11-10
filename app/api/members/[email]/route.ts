import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { email?: string } }
) {
  try {
    let email = params?.email;
    if (!email) {
      const url = new URL(request.url);
      const segments = url.pathname.split("/");
      email = segments.pop() || segments.pop();
    }
    if (!email) {
      return NextResponse.json(
        { error: "email이 필요합니다" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `http://localhost:8080/api/members/email/${encodeURIComponent(email)}`
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: text || "서버 요청 실패" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "서버 요청 실패" },
      { status: 500 }
    );
  }
}
