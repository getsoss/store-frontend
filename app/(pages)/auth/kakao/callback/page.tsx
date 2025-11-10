"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function KakaoCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      router.push(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    if (token) {
      // 토큰을 localStorage에 저장
      localStorage.setItem("authToken", token);
      router.push("/");
    } else {
      // 토큰이 없으면 API route로 리다이렉트 (카카오에서 받은 code 처리)
      const code = searchParams.get("code");
      if (code) {
        // API route로 리다이렉트하여 백엔드 요청 처리
        window.location.href = `/api/auth/kakao/callback?code=${code}`;
      } else {
        router.push(
          `/login?error=${encodeURIComponent("인증 코드가 없습니다.")}`
        );
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
