"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Header from "@/app/components/Header";
import SearchBar from "@/app/components/SearchBar";
import { Product, ProductImage, ProductSummaryDTO } from "@/app/types/dto";

interface ProductCardProps {
  product: Product;
  image: ProductImage | null;
}

export default function SearchResultsPage() {
  const params = useParams(); // { keyword: string }
  const searchParams = useSearchParams(); // ?page=0&size=20
  const keyword = params.keyword;
  let page = parseInt(searchParams.get("page") || "0", 10);
  let size = parseInt(searchParams.get("size") || "20", 10);

  if (isNaN(page)) page = 0;
  if (isNaN(size)) size = 20;

  const [products, setProducts] = useState<ProductSummaryDTO[]>([]);

  const fetchSearchResults = async () => {
    try {
      const query =
        typeof keyword === "string" ? encodeURIComponent(keyword) : "";
      const res = await fetch(
        `/api/products/search?query=${query}&page=${page}&size=${size}`
      );

      if (!res.ok) {
        const text = await res.text();
        console.error(text || "검색 요청 실패");
        return;
      }

      const data = await res.json();
      setProducts(data.products || []);
    } catch (error: any) {
      console.error(error?.message || "검색 요청 실패");
    }
  };

  useEffect(() => {
    fetchSearchResults();
  }, [keyword, page, size]);

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
      <main className="max-w-6xl mx-auto px-6 pt-10">
        <h1 className="text-4xl font-light mb-12 tracking-tight">
          검색 결과: "
          {typeof keyword === "string" ? decodeURIComponent(keyword) : ""}"
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {products.length > 0
            ? products.map(({ product, productImage }) => (
                <ProductCard
                  key={product.productId}
                  product={product}
                  image={productImage ?? null}
                />
              ))
            : null}
        </div>
      </main>
    </div>
  );
}
