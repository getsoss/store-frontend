"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = () => {
    if (!query.trim()) return;
    setLoading(true);
    // 동적 라우팅: [keyword] 페이지로 이동
    router.push(`/products/search/${encodeURIComponent(query)}?page=0&size=12`);
    setLoading(false);
  };

  return (
    <div className="pt-15 pb-[20px] w-full mx-auto px-6 bg-black">
      <div className="relative max-w-5xl mx-auto w-full">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="상품 검색"
          className="w-full bg-white px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 pr-10"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        {/* 돋보기 아이콘 */}
        <button
          onClick={handleSearch}
          disabled={loading}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-black hover:cursor-pointer"
        >
          {loading ? (
            <span className="text-sm">검색 중...</span>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
