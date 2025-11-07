"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/app/components/Header";

interface Product {
  productId: number;
  name: string;
  description: string;
  price: number;
  categoryName: string;
}

interface Category {
  categoryId: string;
  name: string;
  parent_category_id: number;
}

interface ProductImage {
  imageId: number;
  imageUrl: string;
  isMain: boolean;
}

export default function ProductDetailPage() {
  const params = useParams();
  const [productInfo, setProductInfo] = useState<Product>();
  const [categoryInfo, setCategoryInfo] = useState<Category>();
  const [images, setImages] = useState<ProductImage[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const fetchProductDetail = async (productId: number) => {
    try {
      const res = await fetch(`/api/products/${productId}`);
      if (!res.ok) {
        const text = await res.text();
        console.error(text || "서버 요청 실패");
        return;
      }

      const data = await res.json();
      setProductInfo(data.product);
      setImages(data.images);
      setCategoryInfo(data.category);
    } catch (error: any) {
      console.error(error?.message || "서버 요청 실패");
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
          <Link
            href="/"
            className="text-sm hover:underline inline-flex items-center"
          >
            ← 돌아가기
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* 이미지 섹션 */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
              {images.length > 0 ? (
                <Image
                  src={images[selectedImageIndex].imageUrl}
                  alt={productInfo?.name ?? ""}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  이미지 없음
                </div>
              )}
            </div>

            {/* 썸네일 */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
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
                      alt={`${productInfo?.name} ${index + 1}`}
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
                  {categoryInfo?.name}
                </span>
                <h1 className="text-4xl font-light mt-2 mb-4 tracking-tight">
                  {productInfo?.name}
                </h1>
                <p className="text-3xl font-medium">
                  {productInfo?.price.toLocaleString()}원
                </p>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h2 className="text-sm font-medium mb-3 uppercase tracking-wide">
                  상품 설명
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {productInfo?.description}
                </p>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h2 className="text-sm font-medium mb-3 uppercase tracking-wide">
                  상품 정보
                </h2>
                <dl className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">카테고리</dt>
                    <dd className="font-medium">{categoryInfo?.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">가격</dt>
                    <dd className="font-medium">
                      {productInfo?.price.toLocaleString()}원
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* 버튼 섹션 */}
            <div className="pt-8 space-y-3">
              <button className="w-full py-4 bg-black text-white hover:bg-gray-800 transition-colors text-sm uppercase tracking-wide">
                장바구니에 추가
              </button>
              <button className="w-full py-4 border border-black hover:bg-black hover:text-white transition-colors text-sm uppercase tracking-wide">
                바로 구매
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
