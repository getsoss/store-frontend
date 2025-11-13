"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/app/components/Header";
import { useRouter } from "next/navigation";

interface CartItem {
  cartId: number;
  memberId: number;
  productId: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  productId: number;
  name: string;
  price: number;
  description: string;
}

interface ProductImage {
  imageId: number;
  imageUrl: string;
  isMain: boolean;
}

interface CartItemWithProduct extends CartItem {
  product?: Product;
  image?: ProductImage;
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch("/api/carts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        const text = await res.text();
        console.error(text || "장바구니 조회 실패");
        return;
      }

      const items: CartItem[] = await res.json();

      // 각 장바구니 항목의 상품 정보 가져오기
      const itemsWithProducts = await Promise.all(
        items.map(async (item) => {
          try {
            const productRes = await fetch(`/api/products/${item.productId}`);
            if (productRes.ok) {
              const productData = await productRes.json();
              return {
                ...item,
                product: productData.product,
                image: productData.images?.[0],
              };
            }
          } catch (error) {
            console.error(`상품 ${item.productId} 정보 가져오기 실패:`, error);
          }
          return item;
        })
      );

      setCartItems(itemsWithProducts);
    } catch (error: any) {
      console.error("장바구니 조회 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (cartId: number) => {
    if (!confirm("장바구니에서 삭제하시겠습니까?")) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.push("/login");
        return;
      }

      // cartId로 해당 항목 찾기
      const item = cartItems.find((item) => item.cartId === cartId);
      if (!item) {
        alert("삭제할 항목을 찾을 수 없습니다.");
        return;
      }

      const res = await fetch("/api/carts", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: item.productId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "장바구니에서 상품 삭제가 실패했습니다.");
        return;
      }

      setCartItems((prev) => prev.filter((item) => item.cartId !== cartId));
    } catch (error: any) {
      console.error("장바구니 삭제 오류:", error);
      alert("장바구니 삭제 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const totalPrice = cartItems.reduce((sum, item) => {
    return sum + (item.product?.price || 0) * item.quantity;
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center">로딩 중...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-light mb-8">장바구니</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">장바구니가 비어있습니다.</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors"
            >
              쇼핑하러 가기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 장바구니 목록 */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.cartId}
                  className="border border-gray-200 rounded-lg p-4 flex gap-4"
                >
                  {item.image ? (
                    <Link href={`/products/${item.productId}`}>
                      <div className="relative w-24 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image.imageUrl}
                          alt={item.product?.name || "상품 이미지"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </Link>
                  ) : (
                    <div className="w-24 h-24 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center text-gray-400">
                      이미지 없음
                    </div>
                  )}

                  <div className="flex-1">
                    <Link href={`/products/${item.productId}`}>
                      <h3 className="font-medium mb-2 hover:underline">
                        {item.product?.name || "상품명 없음"}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-500 mb-2">
                      수량: {item.quantity}개
                    </p>
                    <p className="text-lg font-medium">
                      {item.product?.price
                        ? (item.product.price * item.quantity).toLocaleString()
                        : 0}
                      원
                    </p>
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item.cartId)}
                    className="text-gray-400 hover:text-gray-600 transition-colors self-start"
                    aria-label="삭제"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5"
                    >
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* 주문 요약 */}
            <div className="lg:col-span-1">
              <div className="border border-gray-200 rounded-lg p-6 sticky top-4">
                <h2 className="text-xl font-medium mb-4">주문 요약</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">상품 금액</span>
                    <span>{totalPrice.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">배송비</span>
                    <span>무료</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between font-medium">
                    <span>총 결제금액</span>
                    <span>{totalPrice.toLocaleString()}원</span>
                  </div>
                </div>
                <button className="w-full py-3 bg-black text-white hover:bg-gray-800 transition-colors">
                  주문하기
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
