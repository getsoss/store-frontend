"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Toast from "@/app/components/Toast";
import { ProductResponseDTO, ProductSummaryDTO } from "@/app/types/dto";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [productDetail, setProductDetail] = useState<ProductResponseDTO>();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [wished, setWished] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [selectedSizeId, setSelectedSizeId] = useState<number | "">("");
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<ProductSummaryDTO[]>(
    []
  );

  // 상품 상세 fetch
  const fetchProductDetail = async (productId: number) => {
    try {
      const token = localStorage.getItem("accessToken");
      const headers: HeadersInit = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/products/${productId}`, { headers });
      if (!res.ok) {
        const text = await res.text();
        console.error(text || "상품 상세 fetch 실패");
        return;
      }

      const data = await res.json();
      setProductDetail({
        product: data.product,
        category: data.category,
        images: data.images,
        sizes: data.sizes.map((s: any) => ({
          productSizeId: s.productSizeId,
          size: s.size,
        })), // <-- 이제 id와 size 모두 포함
        hashtags: data.hashtags,
        likeCount: data.likeCount,
        isLiked: data.isLiked,
        isWished: data.isWished,
      });
      setLiked(data.isLiked || false);
      setWished(data.isWished || false);
      console.log(data);
    } catch (error: any) {
      console.error(error?.message || "상품 상세 fetch 오류");
    }
  };

  // 관련상품 fetch
  const fetchRelatedProducts = async (productId: number) => {
    try {
      const res = await fetch(`/api/products/${productId}/related`);
      if (!res.ok) return;
      const data = await res.json();
      setRelatedProducts(data);
    } catch (e) {
      console.error("관련상품 fetch 오류:", e);
    }
  };

  useEffect(() => {
    const id = Number(params.productId);
    fetchProductDetail(id);
    fetchRelatedProducts(id);
  }, [params.productId]);

  // 좋아요 토글
  const handleLikeToggle = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("로그인이 필요합니다.");
        router.push("/login");
        return;
      }

      const productId = Number(params.productId);
      const method = liked ? "DELETE" : "POST";
      const res = await fetch(`/api/products/${productId}/like`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "좋아요 처리 실패");
        return;
      }

      const nextLiked = !liked;
      setLiked(nextLiked);

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
      console.error("좋아요 오류:", error);
      alert("좋아요 처리 중 오류 발생");
    }
  };

  // 찜 토글
  const handleWishToggle = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("로그인이 필요합니다.");
        router.push("/login");
        return;
      }

      const productId = Number(params.productId);
      const method = wished ? "DELETE" : "POST";
      const res = await fetch(`/api/products/${productId}/wish`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "찜 처리 실패");
        return;
      }

      setWished(!wished);
    } catch (error: any) {
      console.error("찜 오류:", error);
      alert("찜 처리 중 오류 발생");
    }
  };

  // 장바구니 추가
  const handleAddToCart = async () => {
    try {
      if (selectedSizeId === "") {
        alert("사이즈를 선택해주세요.");
        return;
      }
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("로그인이 필요합니다.");
        router.push("/login");
        return;
      }

      const productId = Number(params.productId);
      const productSizeId = selectedSizeId;
      const res = await fetch("/api/me/carts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, quantity, productSizeId }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "장바구니 추가 실패");
        return;
      }

      setShowToast(true);
    } catch (error: any) {
      console.error("장바구니 오류:", error);
      alert("장바구니 처리 중 오류 발생");
    }
  };

  // 바로 구매
  const handleBuyNow = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("로그인이 필요합니다.");
        router.push("/login");
        return;
      }

      const productId = Number(params.productId);
      const res = await fetch("/api/me/carts/buy-now", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          quantity,
          productSizeId: selectedSizeId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "바로 구매 실패");
        return;
      }

      router.push("/cart");
    } catch (error) {
      console.error("바로 구매 오류:", error);
      alert("바로 구매 처리 중 오류 발생");
    }
  };

  const handleSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedSizeId(value ? Number(value) : "");
  };

  const handleClickHashtag = (h: string) => {
    router.push(`/products/search/${encodeURIComponent(h)}?page=0&size=12`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-20">
        {/* 돌아가기 버튼 */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm inline-flex items-center cursor-pointer"
          >
            ← 돌아가기
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* 이미지 캐러셀 */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-gray-50 border border-gray-200 rounded-lg overflow-hidden group">
              {productDetail?.images && productDetail.images.length > 0 ? (
                <>
                  <div className="relative w-full h-full overflow-hidden">
                    <div
                      className="flex h-full transition-transform duration-500 ease-in-out"
                      style={{
                        transform: `translateX(-${selectedImageIndex * 100}%)`,
                      }}
                    >
                      {productDetail.images.map((image, index) => (
                        <div
                          key={image.imageId}
                          className="min-w-full h-full relative"
                        >
                          <Image
                            src={image.imageUrl}
                            alt={`${productDetail.product?.name ?? ""} ${
                              index + 1
                            }`}
                            width={600}
                            height={600}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 캐러셀 버튼 */}
                  {productDetail.images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isTransitioning) return;
                          setIsTransitioning(true);
                          setSelectedImageIndex((prev) =>
                            prev === 0
                              ? productDetail.images.length - 1
                              : prev - 1
                          );
                          setTimeout(() => setIsTransitioning(false), 500);
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
                        >
                          <path d="M15 18l-6-6 6-6" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isTransitioning) return;
                          setIsTransitioning(true);
                          setSelectedImageIndex((prev) =>
                            prev === productDetail.images.length - 1
                              ? 0
                              : prev + 1
                          );
                          setTimeout(() => setIsTransitioning(false), 500);
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
                    onClick={() => {
                      if (isTransitioning) return;
                      setIsTransitioning(true);
                      setSelectedImageIndex(index);
                      setTimeout(() => setIsTransitioning(false), 500);
                    }}
                    className={`aspect-square border rounded-lg overflow-hidden transition-all ${
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
                <h1 className="text-4xl font-light mt-2 mb-4 tracking-tight break-words">
                  {productDetail?.product?.name}
                </h1>
                <p className="text-3xl font-medium">
                  {productDetail?.product?.price.toLocaleString()}원
                </p>
              </div>

              {/* 상품 설명 */}
              <div className="pt-6 border-t border-gray-200">
                <h2 className="text-sm font-medium mb-3 uppercase tracking-wide">
                  상품 설명
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line break-words">
                  {productDetail?.product?.description}
                </p>
              </div>

              {/* 상품 정보 */}
              <div className="pt-6 border-t border-gray-200">
                <h2 className="text-sm font-medium mb-3 uppercase tracking-wide">
                  상품 정보
                </h2>
                <dl className="gap-3 text-sm">
                  {/* 가격 */}
                  <div className="mb-2 flex justify-between">
                    <dt className="text-gray-500">가격</dt>
                    <dd className="font-medium">
                      {productDetail?.product?.price.toLocaleString()}원
                    </dd>
                  </div>

                  {/* 사이즈 */}
                  <div className="flex justify-between items-center">
                    <dt className="text-gray-500 mb-1 ">사이즈</dt>
                    <dd>
                      <div>
                        <select
                          className="w-full border p-2 rounded"
                          onChange={handleSizeChange}
                        >
                          <option value="">사이즈 선택</option>
                          {productDetail?.sizes.map((s, index) => (
                            // s가 { size: string, productSizeId: number } 형태라고 가정
                            <option key={index} value={s.productSizeId}>
                              {s.size}
                            </option>
                          ))}
                        </select>
                      </div>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* 해시태그 */}
            {productDetail?.hashtags && productDetail.hashtags.length > 0 && (
              <div className="flex gap-2 flex-wrap my-3">
                {productDetail.hashtags.map((h, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full border border-gray-300 text-gray-700 cursor-pointer"
                    onClick={() => handleClickHashtag(h.name)}
                  >
                    #{h.name}
                  </span>
                ))}
              </div>
            )}

            {/* 수량 및 총 가격 */}
            <div className="pt-6 border-t border-gray-200">
              <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="w-8 h-8 border border-gray-300 rounded bg-white hover:bg-gray-100 flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 12h14" />
                    </svg>
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-16 h-8 text-center border border-gray-300 rounded bg-white"
                  />
                  <button
                    onClick={() => setQuantity((prev) => prev + 1)}
                    className="w-8 h-8 border border-gray-300 rounded bg-white hover:bg-gray-100 flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-1">총 가격</p>
                  <p className="text-2xl font-medium">
                    {(
                      (productDetail?.product?.price ?? 0) * quantity
                    ).toLocaleString()}
                    원
                  </p>
                </div>
              </div>
            </div>

            {/* 버튼 섹션 */}
            <div className="pt-8 gap-2 flex">
              <button
                onClick={handleAddToCart}
                className="w-full py-4 bg-black text-white hover:bg-gray-800 transition-colors text-sm uppercase tracking-wide"
              >
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
              <button
                onClick={handleBuyNow}
                className="w-full py-4 border border-black hover:bg-black hover:text-white transition-colors text-sm uppercase tracking-wide"
              >
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
                <span className="text-xs mt-1 font-medium">
                  {productDetail?.likeCount || 0}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 관련상품 섹션 */}
        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-medium mb-4">관련 상품</h2>
            <div className="grid grid-cols-5 gap-4">
              {relatedProducts.map((item) => (
                <div
                  key={item.product.productId}
                  className="overflow-hidden p-2 flex flex-col cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() =>
                    router.push(`/products/${item.product.productId}`)
                  }
                >
                  {item.productImage ? (
                    <Image
                      src={item.productImage.imageUrl}
                      alt={item.product.name}
                      width={200}
                      height={200}
                      className="object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                      이미지 없음
                    </div>
                  )}
                  <p className="mt-2 text-sm">{item.product.name}</p>
                  <p className="mt-1 font-medium">
                    {item.product.price.toLocaleString()}원
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {showToast && (
        <Toast
          message="장바구니에 상품을 담았습니다."
          linkText="바로가기"
          linkHref="/cart"
          onClose={() => setShowToast(false)}
          duration={5000}
        />
      )}

      {/* FOOTER */}
      <footer className="border-t border-black mt-32">
        <div className="max-w-6xl mx-auto px-6 py-12 flex justify-between items-center text-sm">
          <p className="font-light">&copy; 2025 AVAD STORE</p>
        </div>
      </footer>
    </div>
  );
}
