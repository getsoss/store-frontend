"use client";

import Header from "@/app/components/Header";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Order {
  orderId: string;
  memberId: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (isoString?: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10); // YYYY-MM-DD
  };

  const fetchOrders = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("로그인이 필요합니다");
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("/api/mypage/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const text = await res.text();
        setError(text || "주문 내역 조회 실패");
        setLoading(false);
        return;
      }
      const data: Order[] = await res.json();
      setOrders(data);
      setLoading(false);
    } catch (err: any) {
      setError(err?.message || "서버 요청 실패");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-6 ">
        {/* 뒤로가기 버튼 */}
        <div className=" pt-10">
          <Link
            href="/mypage"
            className="text-sm hover:underline inline-flex items-center"
          >
            ← 마이페이지로
          </Link>
        </div>

        <h1 className="text-2xl font-semibold text-neutral-900 mb-6">
          주문 내역
        </h1>

        {loading && (
          <p className="text-gray-500 text-center py-10">
            주문 내역을 불러오는 중...
          </p>
        )}
        {error && <p className="text-red-500 text-center py-10">{error}</p>}
        {!loading && !error && orders.length === 0 && (
          <p className="text-gray-500 text-center py-10">
            주문 내역이 없습니다.
          </p>
        )}

        <div className="grid gap-6">
          {orders.map((order) => (
            <div
              key={order.orderId}
              className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-neutral-500">주문 번호</span>
                <span className="text-sm text-neutral-900">
                  {order.orderId}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-neutral-500">주문일</span>
                <span className="text-sm text-neutral-900">
                  {formatDate(order.createdAt)}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-neutral-500">상태</span>
                <span className="text-sm text-neutral-900">{order.status}</span>
              </div>
              <div className="flex justify-between items-center mt-4 pt-2 border-t border-neutral-100">
                <span className="text-sm font-medium text-neutral-500">
                  총 금액
                </span>
                <span className="text-sm font-semibold text-neutral-900">
                  {order.totalPrice.toLocaleString()}원
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
