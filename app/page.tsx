"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import Carousel from "./components/Carousel";
import { ProductSummaryDTO } from "./types/dto";

interface ProductCardProps {
  product: ProductSummaryDTO["product"];
  image: ProductSummaryDTO["productImage"] | null;
}

export default function Home() {
  const [products, setProducts] = useState<ProductSummaryDTO[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const size = 12;

  const fetchProducts = async (page: number) => {
    try {
      const res = await fetch(`/api/products?page=${page}&size=${size}`);
      if (!res.ok) {
        const text = await res.text();
        console.error(text || "서버 요청 실패");
        return;
      }

      const data = await res.json();
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 0);
    } catch (error: any) {
      console.error(error?.message || "서버 요청 실패");
    }
  };

  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  // 페이지 변경 시 최상단으로 스크롤
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const ProductCard = ({ product, image }: ProductCardProps) => (
    <Link key={product.productId} href={`/products/${product.productId}`}>
      <div className="border border-black cursor-pointer hover:bg-black hover:text-white transition">
        <div className="aspect-square bg-gray-100 flex items-center justify-center">
          <div className="w-3/4 h-3/4 border border-gray-300 flex items-center justify-center">
            {image && image.imageUrl ? (
              <img
                src={image.imageUrl}
                alt={product.name}
                className="object-contain w-full h-full"
              />
            ) : (
              <span className="text-gray-500 text-sm">이미지가 없습니다.</span>
            )}
          </div>
        </div>
        <div className="p-4 space-y-1">
          <h3 className="text-sm font-medium">{product.name}</h3>
          <p className="text-sm font-light">{product.price}원</p>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <SearchBar />

      <Carousel
        products={products
          .filter((p) => p.product.categoryId === 5)
          .map((p) => ({
            productId: p.product.productId,
            name: p.product.name,
            description: p.product.description,
            price: p.product.price,
            imageUrl: p.productImage?.imageUrl || "",
          }))}
      />

      <main className="max-w-6xl mx-auto px-6 pt-10">
        <h1 className="text-4xl font-light mb-12 tracking-tight">PRODUCTS</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {products.length > 0 ? (
            products.map(({ product, productImage }) => (
              <ProductCard
                key={product.productId}
                product={product}
                image={productImage ?? null}
              />
            ))
          ) : (
            <div className="text-xl">상품이 없습니다.</div>
          )}
        </div>

        {/* 페이지네이션 버튼 */}
        <div className="flex justify-center mt-8 space-x-2">
          <button
            disabled={page === 0}
            onClick={() => setPage((prev) => prev - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            이전
          </button>
          <span className="px-2 py-1">
            {page + 1} / {totalPages}
          </span>
          <button
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            다음
          </button>
        </div>
      </main>

      <footer className="border-t border-black mt-32">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex justify-between items-center text-sm">
            <p className="font-light">&copy; 2025 AVAD STORE</p>
            <div className="flex space-x-6">
              <Link href="/about" className="hover:underline">
                ABOUT
              </Link>
              <Link href="/contact" className="hover:underline">
                CONTACT
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
