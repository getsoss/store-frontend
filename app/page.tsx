"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "./components/Header";
import { Product, ProductImage } from "./types/dto";
import Carousel from "./components/Carousel";
import SearchBar from "./components/SearchBar";

interface ProductCardProps {
  product: Product;
  image: ProductImage | null;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (!res.ok) {
        const text = await res.text();
        console.error(text || "서버 요청 실패");
        return;
      }
      const data: Product[] = await res.json();
      setProducts(data);
    } catch (error: any) {
      console.error(error?.message || "서버 요청 실패");
    }
  };
  const fetchProductsImages = async () => {
    try {
      const res = await fetch("/api/products/images");
      if (!res.ok) {
        const text = await res.text();
        console.error(text || "서버 요청 실패");
        return;
      }

      const data: ProductImage[] = await res.json();
      const onlyMainImages = data.filter(
        (image: ProductImage) => image.isMain === true
      );
      setImages(onlyMainImages);
    } catch (error: any) {
      console.error(error?.message || "서버 요청 실패");
    }
  };
  useEffect(() => {
    fetchProducts();
    fetchProductsImages();
  }, []);

  const ProductCard = ({ product, image }: ProductCardProps) => {
    return (
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
                <span className="text-gray-500 text-sm">
                  이미지가 없습니다.
                </span>
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
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <SearchBar />
      <Carousel></Carousel>
      <main className="max-w-6xl mx-auto px-6">
        <h1 className="text-4xl font-light mb-12 tracking-tight">PRODUCTS</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {products.length > 0 ? (
            products.map((product: Product) => {
              const image = images.find(
                (img) => img.productId === product.productId
              ) as ProductImage | undefined;

              return (
                <ProductCard
                  key={product.productId}
                  product={product}
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
