"use client";

import Link from "next/link";
import Image from "next/image";
import Header from "@/app/components/Header";
import { useParams } from "next/navigation";

export default function LikesPage() {
  const params = useParams();
  const memberEncoded = params.member as string;
  const encodedMember = memberEncoded || "";

  const dummyLikes = [
    {
      productId: 101,
      name: "미니멀 블랙 코트",
      price: 159000,
      imageUrl: "/uploads/images/41737382-4239-4caf-93a7-3828ca56cf4f.jpg",
    },
    {
      productId: 102,
      name: "화이트 러닝 스니커즈",
      price: 89000,
      imageUrl: "/uploads/images/f0de1424-66c2-42fb-9cc6-97f6d2da8325.jpg",
    },
    {
      productId: 103,
      name: "데일리 크로스백",
      price: 59000,
      imageUrl: "/uploads/images/556dc9e4-8bb2-49a2-a26b-5506414a7e0f.jpg",
    },
    {
      productId: 104,
      name: "라이트 블루 데님",
      price: 69000,
      imageUrl: "/uploads/images/83b86b4e-981c-4522-9956-16820480ebf1.jpg",
    },
  ];
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="mb-6">
          <Link
            href={`/members/${encodedMember}`}
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

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {dummyLikes.map((item) => (
            <Link
              key={item.productId}
              href={`/products/${item.productId}`}
              className="group rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm transition hover:-translate-y-1 hover:shadow-md hover:border-neutral-900"
            >
              <div className="aspect-square bg-neutral-50 relative">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-medium text-neutral-900 line-clamp-1">
                  {item.name}
                </h3>
                <p className="mt-1 text-sm text-neutral-700">
                  {item.price.toLocaleString()}원
                </p>
                <span className="mt-2 inline-flex text-xs text-neutral-500">
                  ♥ 좋아요
                </span>
              </div>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
