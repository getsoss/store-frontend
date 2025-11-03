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
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const payload = parseJwt(token);
    if (!payload || payload.exp * 1000 <= Date.now()) {
      router.replace("/login");
      return;
    }
    try {
      const role = (payload as any)?.role as string | undefined;
      const isAdmin = role === "admin";
      if (!isAdmin) {
        router.replace("/");
        return;
      }
      setAllowed(true);
    } catch {
      router.replace("/");
    }
  }, [router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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
        <div className="grid grid-cols-1 gap-4">
          <input
            className="border p-2 rounded"
            placeholder="상품명"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
          />
          <textarea
            className="border p-2 rounded"
            placeholder="설명"
            rows={4}
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
          />
          <input
            className="border p-2 rounded"
            placeholder="가격"
            type="number"
            value={formData.price}
            onChange={(e) => handleInputChange("price", e.target.value)}
          />
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium block">
                카테고리 <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                className="w-full border p-2 rounded text-base"
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                required
              >
                <option value="">카테고리 선택</option>
                <option value="electronics">전자제품</option>
                <option value="fashion">패션</option>
                <option value="beauty">뷰티</option>
                <option value="home">홈/리빙</option>
                <option value="sports">스포츠</option>
                <option value="books">도서</option>
              </select>
            </div>
          </div>
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
