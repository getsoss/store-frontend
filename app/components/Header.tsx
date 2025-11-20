"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Category } from "../types/dto";
import { checkLoginStatus } from "../utils/auth";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // 카테고리 로딩
  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) return console.error(await res.text());
      const data = await res.json();
      setCategories(data);
    } catch (e: any) {
      console.error(e?.message || "카테고리 로드 실패");
    }
  };

  // 로그인 체크 + 카테고리 로드
  useEffect(() => {
    fetchCategories();

    (async () => {
      const status = await checkLoginStatus(); // accessToken 자동 refresh 처리 포함
      setIsLoggedIn(status.isLoggedIn);
      setIsAdmin(status.isAdmin);
    })();
  }, []);

  // 로그아웃
  const handleLogout = async () => {
    const accessToken = localStorage.getItem("accessToken");

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        credentials: "include", // 쿠키 포함
      });
    } catch (e: any) {
      console.error(e?.message || "서버 오류");
    } finally {
      // 로컬스토리지 정리
      localStorage.removeItem("accessToken");
      setIsLoggedIn(false);
      setIsAdmin(false);
      window.location.href = "/";
    }
  };

  // 초기 상태 확인 전에는 렌더링하지 않음
  if (isLoggedIn === null) return null;

  return (
    <header className="bg-black text-white fixed w-full z-100">
      <div className="max-w-6xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            AVAD STORE
          </Link>

          {/* 카테고리 */}
          <div className="flex items-center space-x-8">
            {categories.length > 0 ? (
              categories.map((category) => (
                <Link
                  href={`/${category.categoryId}`}
                  key={category.categoryId}
                >
                  {category.name.toUpperCase()}
                </Link>
              ))
            ) : (
              <span>카테고리가 없습니다.</span>
            )}
          </div>

          {/* 로그인/로그아웃 */}
          <div className="flex items-center space-x-8">
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
                <button
                  className="text-sm hover:underline"
                  onClick={handleLogout}
                >
                  LOGOUT
                </button>
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
  );
};

export default Header;
