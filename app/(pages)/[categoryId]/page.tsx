"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import {
  Category,
  Product,
  ProductImage,
  ProductSummaryDTO,
} from "../../types/dto";
import { useParams } from "next/navigation";
import SearchBar from "@/app/components/SearchBar";

interface ProductCardProps {
  product: Product;
  image: ProductImage | null;
}

export default function Home() {
  const params = useParams();
  const categoryId = Number(params.categoryId); // URL에서 categoryId 추출
  const [categories, setCategories] = useState<Category[]>([]);
  const [productSummary, setProductSummary] = useState<ProductSummaryDTO[]>([]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) {
        const text = await res.text();
        console.error(text || "서버 요청 실패");
        return;
      }
      const data = await res.json();
      setCategories(data);
      console.log(data);
    } catch (error: any) {
      console.error(error?.message || "서버 요청 실패");
    }
  };

  const fetchProductWithImage = async (categoryId: number) => {
    try {
      const res = await fetch(`/api/categories/${categoryId}/products`);
      if (!res.ok) {
        const text = await res.text();
        console.error(text || "서버 요청 실패");
        return;
      }
      const data = await res.json();
      setProductSummary(data);
      console.log(data);
    } catch (error: any) {
      console.error(error?.message || "서버 요청 실패");
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProductWithImage(Number(params.categoryId));
  }, []);

  const category = categories.find((c) => c.categoryId === categoryId);

  const ProductCard = ({ product, image }: ProductCardProps) => {
    return (
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
                <span className="text-gray-500 text-sm">
                  이미지가 없습니다.
                </span>
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
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <SearchBar />
      <main className="max-w-6xl mx-auto px-6 pt-10">
        <h1 className="text-4xl font-light mb-12 tracking-tight">
          {category?.name.toUpperCase()}
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {productSummary.length > 0 ? (
            productSummary.map((productSummary: ProductSummaryDTO) => {
              const image = productSummary.productImage;
              return (
                <ProductCard
                  key={productSummary.product.productId}
                  product={productSummary.product}
                  image={image ?? null}
                />
              );
            })
          ) : (
            <div className="text-xl">상품이 없습니다. </div>
          )}
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
