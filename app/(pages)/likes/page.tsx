"use client";

import Link from "next/link";
import Image from "next/image";
import Header from "@/app/components/Header";
import { useEffect, useState } from "react";
import { ProductSummaryDTO } from "@/app/types/dto";
import { useRouter } from "next/navigation";

export default function LikesPage() {
  const router = useRouter();
  const [likedProducts, setLikedProducts] = useState<ProductSummaryDTO[]>([]);
  useEffect(() => {
    fetchLikeProduct();
  }, []);

  const fetchLikeProduct = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const headers: HeadersInit = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      } else {
        alert("로그인이 필요합니다");
        router.push("/login");
        return;
      }
      const res = await fetch("/api/mypage/likes", { headers });

      if (!res.ok) {
        const text = await res.text();
        console.error(text || "서버 요청 실패");
        return;
      }
      const data: ProductSummaryDTO[] = await res.json();
      setLikedProducts(data);
    } catch (error: any) {
      console.error(error?.message || "서버 요청 실패");
    }
  };
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-20">
        <div className="mb-6">
          <Link
            href="/mypage"
            className="text-sm hover:underline inline-flex items-center"
          >
            ← 마이페이지로
          </Link>
        </div>

        <h1 className="text-2xl font-semibold text-neutral-900 mb-2">
          내 좋아요
        </h1>
        <p className="text-sm text-neutral-500 mb-10">
          좋아요한 상품을 모아볼 수 있어요.
        </p>

        {likedProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">좋아요한 상품이 없습니다.</p>
          </div>
        ) : (
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {likedProducts.map((item) => (
              <Link
                key={item.product.productId}
                href={`/products/${item.product.productId}`}
                className="group rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm transition hover:-translate-y-1 hover:shadow-md hover:border-neutral-900"
              >
                <div className="aspect-square bg-neutral-50 relative">
                  {item.productImage ? (
                    <Image
                      src={item.productImage.imageUrl}
                      alt={item.product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      이미지 없음
                    </div>
                  )}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="#ef4444"
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="absolute top-2 right-2 w-6 h-6 transition-all duration-300 text-red-500 scale-110 z-20"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-neutral-900 line-clamp-1">
                    {item.product.name}
                  </h3>
                  <p className="mt-1 text-sm text-neutral-700">
                    {item.product.price.toLocaleString()}원
                  </p>
                </div>
              </Link>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
