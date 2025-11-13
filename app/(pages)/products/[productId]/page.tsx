"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/app/components/Header";
import { useRouter } from "next/navigation";

interface ProductDetail {
  product: {
    productId: number;
    name: string;
    description: string;
    price: number;
    categoryName: string;
  };
  category: {
    categoryId: string;
    name: string;
    parent_category_id: number;
  };
  images: {
    imageId: number;
    imageUrl: string;
    isMain: boolean;
  }[];
  likeCount: number;
  isLiked: boolean;
  isWished: boolean;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [productDetail, setProductDetail] = useState<ProductDetail>();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [wished, setWished] = useState(false);

  const fetchProductDetail = async (productId: number) => {
    try {
      const token = localStorage.getItem("authToken");
      const headers: HeadersInit = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/products/${productId}`, {
        headers,
      });
      if (!res.ok) {
        const text = await res.text();
        console.error(text || "서버 요청 실패");
        return;
      }

      const data = await res.json();
      setProductDetail({
        product: data.product,
        category: data.category,
        images: data.images,
        likeCount: data.likeCount,
        isLiked: data.isLiked,
        isWished: data.isWished,
      });

      // 좋아요, 찜 상태 초기화
      setLiked(data.isLiked || false);
      setWished(data.isWished || false);
    } catch (error: any) {
      console.error(error?.message || "서버 요청 실패");
    }
  };
  const handleLikeToggle = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("로그인이 필요합니다.");
        router.push("/login");
        return;
      }

      const productId = Number(params.productId);
      const method = liked ? "DELETE" : "POST";
      const res = await fetch(`/api/products/${productId}/like`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "좋아요 처리에 실패했습니다.");
        return;
      }

      // 좋아요 상태 토글
      const nextLiked = !liked;
      setLiked(nextLiked);

      // 좋아요 개수 업데이트
      if (productDetail) {
        setProductDetail({
          ...productDetail,
          likeCount: nextLiked
            ? productDetail.likeCount + 1
            : Math.max(0, productDetail.likeCount - 1),
          isLiked: nextLiked,
        });
      }
    } catch (error: any) {
      console.error("좋아요 처리 오류:", error);
      alert("좋아요 처리 중 오류가 발생했습니다.");
    }
  };

  const handleWishToggle = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("로그인이 필요합니다.");
        router.push("/login");
        return;
      }

      const productId = Number(params.productId);
      const method = wished ? "DELETE" : "POST";
      const res = await fetch(`/api/products/${productId}/wish`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "좋아요 처리에 실패했습니다.");
        return;
      }

      // 찜 상태 토글
      const nextWished = !wished;
      setWished(nextWished);
    } catch (error: any) {
      console.error("좋아요 처리 오류:", error);
      alert("좋아요 처리 중 오류가 발생했습니다.");
    }
  };
  useEffect(() => {
    fetchProductDetail(Number(params.productId));
  }, [params.productId]);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm hover:underline inline-flex items-center"
          >
            ← 돌아가기
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* 이미지 섹션 */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-gray-50 border border-gray-200 rounded-lg overflow-hidden group">
              {productDetail?.images && productDetail.images.length > 0 ? (
                <>
                  <Image
                    src={productDetail.images[selectedImageIndex].imageUrl}
                    alt={productDetail.product?.name ?? ""}
                    width={600}
                    height={600}
                    className="w-full h-full object-cover"
                  />
                  {/* 왼쪽/오른쪽 이동 버튼 - 이미지가 2개 이상일 때만 표시 */}
                  {productDetail.images.length > 1 && (
                    <>
                      {/* 왼쪽 버튼 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImageIndex((prev) =>
                            prev === 0
                              ? productDetail.images.length - 1
                              : prev - 1
                          );
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                        aria-label="이전 이미지"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-6 h-6"
                        >
                          <path d="M15 18l-6-6 6-6" />
                        </svg>
                      </button>
                      {/* 오른쪽 버튼 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImageIndex((prev) =>
                            prev === productDetail.images.length - 1
                              ? 0
                              : prev + 1
                          );
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                        aria-label="다음 이미지"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-6 h-6"
                        >
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  이미지 없음
                </div>
              )}
            </div>

            {/* 썸네일 */}
            {productDetail?.images && productDetail.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {productDetail.images.map((image, index) => (
                  <button
                    key={image.imageId}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square border rounded-lg overflow-hidden ${
                      selectedImageIndex === index
                        ? "border-black border-2"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <Image
                      src={image.imageUrl}
                      alt={`${productDetail.product?.name} ${index + 1}`}
                      width={150}
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 상품 정보 섹션 */}
          <div className="flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <span className="text-sm text-gray-500 uppercase tracking-wide">
                  {productDetail?.category?.name}
                </span>
                <h1 className="text-4xl font-light mt-2 mb-4 tracking-tight">
                  {productDetail?.product?.name}
                </h1>
                <p className="text-3xl font-medium">
                  {productDetail?.product?.price.toLocaleString()}원
                </p>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h2 className="text-sm font-medium mb-3 uppercase tracking-wide">
                  상품 설명
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {productDetail?.product?.description}
                </p>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h2 className="text-sm font-medium mb-3 uppercase tracking-wide">
                  상품 정보
                </h2>
                <dl className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">카테고리</dt>
                    <dd className="font-medium">
                      {productDetail?.category?.name}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">가격</dt>
                    <dd className="font-medium">
                      {productDetail?.product?.price.toLocaleString()}원
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* 버튼 섹션 */}
            <div className="pt-8 gap-2 flex">
              <button className="w-full py-4 bg-black text-white hover:bg-gray-800 transition-colors text-sm uppercase tracking-wide">
                장바구니에 추가
              </button>
              <button
                onClick={handleWishToggle}
                className={`group flex items-center justify-center gap-2 w-full py-4 border transition-all duration-300 text-sm uppercase tracking-wide ${
                  wished
                    ? "border-yellow-500 bg-yellow-50 hover:bg-yellow-100 text-yellow-700"
                    : "border-black hover:bg-black hover:text-white"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={wished ? "#eab308" : "none"}
                  stroke={wished ? "#eab308" : "currentColor"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`w-5 h-5 transition-all duration-300 ${
                    wished
                      ? "text-yellow-600 scale-110"
                      : "text-current group-hover:text-white"
                  }`}
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
                <span className={wished ? "text-yellow-700 font-medium" : ""}>
                  {wished ? "찜상품" : "찜하기"}
                </span>
              </button>
              <button className="w-full py-4 border border-black hover:bg-black hover:text-white transition-colors text-sm uppercase tracking-wide">
                바로 구매
              </button>
              <button
                onClick={handleLikeToggle}
                className={`group flex flex-col items-center justify-center px-4 py-2 border transition-all duration-300 ${
                  liked
                    ? "border-red-500 bg-red-50 hover:bg-red-100"
                    : "border-black hover:bg-black hover:text-white"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={liked ? "#ef4444" : "none"}
                  stroke={liked ? "#ef4444" : "currentColor"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`w-6 h-6 transition-all duration-300 ${
                    liked
                      ? "text-red-500 scale-110"
                      : "text-current group-hover:text-white"
                  }`}
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <span
                  className={`text-xs mt-1 font-medium transition-colors ${
                    liked
                      ? "text-red-600"
                      : "text-current group-hover:text-white"
                  }`}
                >
                  {productDetail?.likeCount || 0}
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-black mt-32">
        <div className="max-w-6xl mx-auto px-6 py-12 flex justify-between items-center text-sm">
          <p className="font-light">&copy; 2025 STORE</p>
          <div className="flex space-x-6">
            <Link href="/about" className="hover:underline">
              ABOUT
            </Link>
            <Link href="/contact" className="hover:underline">
              CONTACT
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
