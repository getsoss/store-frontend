"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import SearchBar from "@/app/components/SearchBar";
import { ProductSummaryDTO, ProductImage, Product } from "@/app/types/dto";

interface ProductCardProps {
  product: Product;
  image: ProductImage | null;
}

export default function SearchResultsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const keyword = params.keyword;
  let page = parseInt(searchParams.get("page") || "0");
  let size = parseInt(searchParams.get("size") || "12");

  if (isNaN(page)) page = 0;
  if (isNaN(size)) size = 12;

  const [products, setProducts] = useState<ProductSummaryDTO[]>([]);
  const [totalPages, setTotalPages] = useState(0);

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
      setTotalPages(Math.ceil((data.total || 0) / size));
    } catch (error: any) {
      console.error(error?.message || "검색 요청 실패");
    }
  };

  useEffect(() => {
    fetchSearchResults();
  }, [keyword, page, size]);

  const ProductCard = ({ product, image }: ProductCardProps) => (
    <Link key={product.productId} href={`/products/${product.productId}`}>
      <div className="border border-black cursor-pointer hover:bg-black hover:text-white transition h-full">
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
        <div className="p-4 space-y-1 flex flex-col justify-between">
          <h3 className="text-sm font-medium overflow-hidden whitespace-nowrap text-ellipsis">
            {product.name}
          </h3>
          <p className="text-sm font-light">{product.price}원</p>
        </div>
      </div>
    </Link>
  );

  const handlePageChange = (newPage: number) => {
    router.push(`/products/search/${keyword}?page=${newPage}&size=${size}`);
  };

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
          {products.length > 0 ? (
            products.map(({ product, productImage }) => (
              <ProductCard
                key={product.productId}
                product={product}
                image={productImage ?? null}
              />
            ))
          ) : (
            <p className="col-span-3 text-center">검색 결과가 없습니다.</p>
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-4 mt-8">
            <button
              disabled={page === 0}
              className="px-4 py-2 border rounded disabled:opacity-50"
              onClick={() => handlePageChange(page - 1)}
            >
              이전
            </button>

            <span className="px-4 py-2">
              {page + 1} / {totalPages}
            </span>

            <button
              disabled={page + 1 >= totalPages}
              className="px-4 py-2 border rounded disabled:opacity-50"
              onClick={() => handlePageChange(page + 1)}
            >
              다음
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
