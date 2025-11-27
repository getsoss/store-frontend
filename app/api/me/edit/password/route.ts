import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const authorization = request.headers.get("authorization");

    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (authorization) headers.Authorization = authorization;

    // Spring API 호출
    const res = await fetch("http://localhost:8080/api/members/password", {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res
        .json()
        .catch(async () => ({ error: await res.text() }));
      return NextResponse.json(
        { error: data.error || "비밀번호 변경 실패" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "비밀번호 변경 실패" },
      { status: 500 }
    );
  }
}
