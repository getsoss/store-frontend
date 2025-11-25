"use client";

import Modal from "@/app/components/Modal";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/app/components/Header";
import { useRouter } from "next/navigation";
import {
  loadTossPayments,
  TossPaymentsWidgets,
} from "@tosspayments/tosspayments-sdk";
import { Cart, CartItemWithProduct } from "@/app/types/dto";
import ReactModal from "react-modal";

const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
const customerKey = process.env.NEXT_PUBLIC_TOSS_CUSTOMER_KEY;

export default function CartPage() {
  const [amount, setAmount] = useState({
    currency: "KRW",
    value: 5_000,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CartItemWithProduct | null>(
    null
  );
  const [ready, setReady] = useState(false); // 결제 준비 상태
  const [widgets, setWidgets] = useState<TossPaymentsWidgets | null>(null); // 결제 위젯
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPaymentWidgets() {
      // ------  결제위젯 초기화 ------
      if (!clientKey || !customerKey) {
        console.error("clientKey와 customerKey가 모두 필요합니다.");
        return;
      }
      const tossPayments = await loadTossPayments(clientKey);
      // 회원 결제
      const paymentWidgets = tossPayments.widgets({
        customerKey,
      });

      setWidgets(paymentWidgets);
    }

    fetchPaymentWidgets();
  }, [clientKey, customerKey]);

  useEffect(() => {
    async function renderPaymentWidgets() {
      if (widgets == null) {
        return;
      }

      if (
        !document.getElementById("payment-method") ||
        !document.getElementById("agreement")
      ) {
        return;
      }
      // ------ 주문의 결제 금액 설정 -----
      await widgets.setAmount(amount);

      await Promise.all([
        // ------  결제 UI 렌더링 ------
        widgets.renderPaymentMethods({
          selector: "#payment-method",
          variantKey: "DEFAULT",
        }),
        // ------  이용약관 UI 렌더링 ------
        widgets.renderAgreement({
          selector: "#agreement",
          variantKey: "AGREEMENT",
        }),
      ]);

      setReady(true);
    }

    renderPaymentWidgets();
  }, [widgets, loading]);

  useEffect(() => {
    if (widgets == null) {
      return;
    }

    widgets.setAmount(amount);
  }, [widgets, amount]);

  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch("/api/me/carts", {
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

      const items: Cart[] = await res.json();

      // 각 장바구니 항목의 상품 정보 가져오기
      const itemsWithProducts = await Promise.all(
        items.map(async (item) => {
          try {
            const productRes = await fetch(`/api/products/${item.productId}`);
            if (productRes.ok) {
              const productData = await productRes.json();
              // 선택된 사이즈 이름 찾기
              const selectedSize = productData.sizes?.find(
                (s: { productSizeId: number }) =>
                  s.productSizeId === item.productSizeId
              )?.size;

              return {
                ...item,
                product: productData.product,
                image: productData.images?.[0],
                size: selectedSize || "없음", // cartItem.size 추가
              };
            }
          } catch (error) {
            console.error(`상품 ${item.productId} 정보 가져오기 실패:`, error);
          }
          return { ...item, size: "없음" };
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
      const token = localStorage.getItem("accessToken");
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

      const res = await fetch("/api/me/carts", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: item.productId,
          productSizeId: item.productSizeId,
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
    return sum + (item.product?.price ?? 0) * item.quantity;
  }, 0);

  widgets?.setAmount?.({ value: totalPrice, currency: "KRW" });

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

  const handleQuantityChangeClick = (item: CartItemWithProduct) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleQuantityUpdate = async (newQuantity: number) => {
    if (!selectedItem) return;

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/login");
        return;
      }
      const res = await fetch(`/api/me/carts/${selectedItem.cartId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("수량 변경 실패:", data.error || data.message);
        alert(data.error || "수량 변경 중 오류가 발생했습니다.");
        return;
      }

      console.log("수량 변경 성공:", data.message);

      // UI 상태 업데이트
      setCartItems((prev) =>
        prev.map((item) =>
          item.cartId === selectedItem.cartId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );

      setIsModalOpen(false);
    } catch (error: any) {
      console.error("수량 변경 중 오류:", error);
      alert(error?.message || "수량 변경 중 오류가 발생했습니다.");
    }
  };

  const handlePayment = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    try {
      const getRes = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const existingOrder = getRes.ok ? await getRes.json() : null;

      let orderId: string;

      // 기존 주문이 존재하고 결제대기 상태인 경우
      if (existingOrder && existingOrder.status === "결제대기") {
        const isSameItems = (orderItems: any[], cartItems: any[]) => {
          if (!orderItems) return false;
          if (orderItems.length !== cartItems.length) return false;
          return orderItems.every((oi) => {
            const match = cartItems.find((ci) => ci.productId === oi.productId);
            return (
              match &&
              match.quantity === oi.quantity &&
              match.price === oi.price
            );
          });
        };

        if (isSameItems(existingOrder.items, cartItems)) {
          orderId = existingOrder.orderId; // 동일하면 그대로 사용
        } else {
          // 장바구니 다르면 PATCH 요청
          const patchRes = await fetch(`/api/orders/${existingOrder.orderId}`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              items: cartItems.map((i) => ({
                productId: i.productId,
                quantity: i.quantity,
                price: i.product?.price || 0,
              })),
            }),
          });
          const patchData = patchRes.ok ? await patchRes.json() : null;
          orderId = patchData?.orderId ?? existingOrder.orderId;
        }
      } else {
        // 기존 주문 없으면 신규 생성
        const postRes = await fetch("/api/orders", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: cartItems.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              price: i.product?.price || 0,
            })),
          }),
        });
        const postData = await postRes.json();
        orderId = postData.orderId;
      }

      // toss 결제 실행
      await widgets?.requestPayment({
        orderId: orderId.toString(),
        orderName: "스토어 상품 결제",
        successUrl: window.location.origin + "/success",
        failUrl: window.location.origin + "/fail",
        customerEmail: "customer123@gmail.com",
        customerName: "김토스",
        customerMobilePhone: "01012341234",
      });
    } catch (error: any) {
      console.error("결제 처리 오류:", error);
      alert("결제 처리 중 문제가 발생했습니다.");
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
          장바구니
        </h1>

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
                      수량: {item.quantity}개 | 사이즈: {item.size || "없음"}{" "}
                      <button
                        className="text-black border border-gray-200 rounded-md px-1 py-1"
                        onClick={() => handleQuantityChangeClick(item)}
                      >
                        변경
                      </button>
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
                <button
                  disabled={!ready}
                  className="w-full py-3 bg-black text-white hover:bg-gray-800 transition-colors"
                  onClick={handlePayment}
                >
                  주문하기
                </button>
              </div>
              <div className="wrapper">
                <div className="box_section">
                  {/* 결제 UI */}
                  <div id="payment-method" />
                  {/* 이용약관 UI */}
                  <div id="agreement" />
                </div>
              </div>
            </div>
          </div>
        )}

        {isModalOpen && selectedItem && (
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="수량 변경"
          >
            <div className="flex flex-col gap-3">
              <input
                type="number"
                min={1}
                defaultValue={selectedItem.quantity}
                className="border p-2 rounded w-full"
                id="quantity-input"
              />
              <button
                className="bg-black text-white py-2 rounded hover:bg-gray-800"
                onClick={() => {
                  const input = document.getElementById(
                    "quantity-input"
                  ) as HTMLInputElement;
                  handleQuantityUpdate(Number(input.value));
                }}
              >
                변경 완료
              </button>
            </div>
          </Modal>
        )}
      </main>
    </div>
  );
}
