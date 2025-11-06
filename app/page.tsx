"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
function parseJwt(token: string | null) {
  if (!token) return null;
  try {
    const base64Payload = token.split(".")[1];
    const payload = JSON.parse(atob(base64Payload));
    return payload;
  } catch (e) {
    return null;
  }
}

interface ProductCardProps {
  product: Product;
  image: Image | null;
}

interface Product {
  productId: number;
  name: string;
  description: string;
  price: number;
  categoryId: number;
}

interface Image {
  imageId: number;
  productId: number;
  imageUrl: string;
  isMain: boolean;
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState([]);
  const [images, setImages] = useState<Image[]>([]);
  useEffect(() => {
    // JWT 체크는 동기 처리
    const token = localStorage.getItem("authToken");
    const payload = token ? parseJwt(token) : null;

    if (payload && payload.exp * 1000 > Date.now()) {
      setIsLoggedIn(true);
      const role = (payload as any)?.role;
      setIsAdmin(role === "admin");
    } else {
      localStorage.removeItem("authToken");
      setIsLoggedIn(false);
      setIsAdmin(false);
    }

    // 제품 요청 비동기 처리
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) {
          const text = await res.text();
          console.error(text || "서버 요청 실패");
          return;
        }
        const data = await res.json();
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

        const data = await res.json();
        const onlyMainImages = data.filter(
          (image: Image) => image.isMain === true
        );
        setImages(onlyMainImages);
      } catch (error: any) {
        console.error(error?.message || "서버 요청 실패");
      }
    };

    // fetch 호출 시작
    fetchProducts();
    fetchProductsImages();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
    window.location.reload();
  };

  const ProductCard = ({ product, image }: ProductCardProps) => {
    return (
      <Link
        key={product.productId}
        href={`/products/${product.productId}`}
        className="hover:underline"
      >
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

  console.log(images);
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-black">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold tracking-tight">
              STORE
            </Link>
            <div className="flex items-center space-x-8">
              <Link href="/products" className="text-sm hover:underline">
                PRODUCTS
              </Link>

              {isLoggedIn ? (
                <div className="flex space-x-8">
                  {isAdmin && (
                    <Link
                      href="/products/upload"
                      className="text-sm hover:underline"
                    >
                      UPLOAD
                    </Link>
                  )}
                  <Link href="/mypage" className="text-sm hover:underline">
                    MYPAGE
                  </Link>
                  <a className="text-sm hover:underline" onClick={handleLogout}>
                    LOGOUT
                  </a>
                </div>
              ) : (
                <div className="flex space-x-8">
                  <Link href="/signup" className="text-sm hover:underline">
                    SIGN UP
                  </Link>
                  <Link href="/login" className="text-sm hover:underline">
                    LOGIN
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-light mb-12 tracking-tight">PRODUCTS</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {products.length > 0 ? (
            products.map((product: Product) => {
              const image = images.find(
                (img) => img.productId === product.productId
              ) as Image;

              return (
                <ProductCard
                  key={product.productId}
                  product={product}
                  image={image}
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
        </div>
      </footer>
    </div>
  );
}
