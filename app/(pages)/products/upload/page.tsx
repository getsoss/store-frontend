"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function parseJwt(token: string | null) {
  if (!token) return null;
  try {
    const base64Payload = token.split(".")[1];
    const payload = JSON.parse(atob(base64Payload));
    return payload;
  } catch (e) {
    return null;
  }
}

export default function ProductUploadPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const payload = parseJwt(token);
    if (!payload || payload.exp * 1000 <= Date.now()) {
      router.replace("/login");
      return;
    }
    try {
      const role = (payload as any)?.role as string | undefined;
      const roles = (payload as any)?.roles as string[] | undefined;
      const isAdmin =
        role === "admin" || (Array.isArray(roles) && roles.includes("admin"));
      if (!isAdmin) {
        router.replace("/");
        return;
      }
      setAllowed(true);
    } catch {
      router.replace("/");
    }
  }, [router]);

  if (!allowed) return null;

  return (
    <main className="mx-auto max-w-2xl p-6 mt-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">상품 등록</h1>
        <Link href="/" className="text-sm hover:underline">
          돌아가기
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <p className="text-sm text-gray-600 mb-4">
          상품 등록 기능은 준비 중입니다.
        </p>
        <div className="grid grid-cols-1 gap-4">
          <input className="border p-2 rounded" placeholder="상품명" disabled />
          <input className="border p-2 rounded" placeholder="가격" disabled />
          <textarea
            className="border p-2 rounded"
            placeholder="설명"
            rows={4}
            disabled
          />
          <button
            className="px-3.5 py-2.5 rounded-md bg-gray-200 text-gray-800"
            disabled
          >
            등록하기
          </button>
        </div>
      </div>
    </main>
  );
}
