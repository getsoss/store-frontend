"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function KakaoCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const error = searchParams.get("error");

    if (error) {
      router.push(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    if (accessToken && refreshToken) {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      router.push("/");
    } else {
      // 기존 fallback: code가 있으면 API route 호출
      const code = searchParams.get("code");
      if (code) {
        window.location.href = `/api/auth/kakao/callback?code=${code}`;
      } else {
        router.push(`/login?error=${encodeURIComponent("토큰이 없습니다.")}`);
      }
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg">카카오 로그인 처리 중...</p>
      </div>
    </div>
  );
}
