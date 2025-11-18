"use client";

import Header from "@/app/components/Header";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Member } from "@/app/types/dto";
import { useRouter } from "next/navigation";

const summaryItems = [
  {
    title: "찜 내역",
    description: "관심 있는 상품들을 한 번에 확인해요.",
    countLabel: "찜한 상품",
    href: "/wishlist",
  },
  {
    title: "좋아요 내역",
    description: "좋아요한 리뷰와 콘텐츠를 모아봐요.",
    countLabel: "좋아요",
    href: "/likes",
  },
  {
    title: "장바구니",
    description: "담아둔 상품을 확인하고 주문을 진행하세요.",
    countLabel: "담긴 상품",
    href: "/cart",
  },
  {
    title: "주문 내역",
    description: "최근 주문 현황과 배송 상태를 확인해요.",
    countLabel: "주문 건수",
    href: "/mypage/orders",
  },
];

export default function MyPage() {
  const router = useRouter();
  const [memberInfo, setMemberInfo] = useState<Member | null>(null);

  const formatDate = (isoString?: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10); // YYYY-MM-DD
  };

  function parseJwt(token: string | null) {
    if (!token) return null;
    try {
      const base64Payload = token.split(".")[1];
      const payload = JSON.parse(atob(base64Payload));
      return payload;
    } catch {
      return null;
    }
  }

  const fetchMemberDetail = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("로그인이 필요합니다");
        router.push("/login");
        return;
      }
      const res = await fetch(`/api/members`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const text = await res.text();
        console.error(text || "서버 요청 실패");
        return;
      }
      const data = await res.json();
      setMemberInfo(data);
    } catch (error: any) {
      console.error(error?.message || "서버 요청 실패");
    }
  };

  useEffect(() => {
    fetchMemberDetail();
  }, []);
  return (
    <div>
      <Header />
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
        <header className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white px-6 py-8 shadow-sm mt-10">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-1 flex-col gap-1">
              <h1 className="text-2xl font-semibold text-neutral-900 py-5">
                {memberInfo?.name}님, 안녕하세요!
              </h1>
              <p className="text-sm text-neutral-500">
                프로필과 활동 내역을 확인하고 관리할 수 있는 공간입니다.
              </p>
            </div>
            <button
              type="button"
              className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
            >
              프로필 수정하기
            </button>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-neutral-500">
            <div>
              <span className="block text-neutral-400">이메일</span>
              <span className="text-neutral-900">{memberInfo?.email}</span>
            </div>
            <div>
              <span className="block text-neutral-400">가입일</span>
              <span className="text-neutral-900">
                {memberInfo?.createdAt ? formatDate(memberInfo.createdAt) : ""}
              </span>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-4">
          {summaryItems.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-neutral-900 hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-neutral-900">
                    {item.title}
                  </h2>
                </div>
                <p className="text-sm text-neutral-500">{item.description}</p>
              </div>
              <span className="mt-6 inline-flex w-fit items-center gap-2 text-sm font-medium text-neutral-700 transition group-hover:text-neutral-900">
                {item.countLabel} 보기 →
              </span>
            </Link>
          ))}
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">
                주문 현황
              </h2>
              <p className="text-sm text-neutral-500">
                최근 주문의 진행 상태를 한눈에 확인하세요.
              </p>
            </div>
          </header>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {[
              { label: "결제 완료", status: "0건" },
              { label: "배송 준비중", status: "0건" },
              { label: "배송중", status: "0건" },
              { label: "배송 완료", status: "0건" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-neutral-100 bg-neutral-50 px-4 py-5 text-center text-sm"
              >
                <span className="block text-neutral-500">{item.label}</span>
                <span className="mt-2 block text-lg font-semibold text-neutral-900">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
