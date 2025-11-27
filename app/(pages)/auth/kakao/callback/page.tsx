"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function KakaoCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const error = searchParams.get("error");

    if (error) {
      router.push(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    if (accessToken) {
      // refreshToken은 HttpOnly 쿠키로 설정되었으므로, accessToken만 저장
      localStorage.setItem("accessToken", accessToken);
      router.push("/");
    } else {
      // 코드가 남았다면 다시 API 라우트로 요청
      const code = searchParams.get("code");
      if (code) {
        // 이 부분이 백엔드에서 리다이렉트되기 전 카카오 인증 코드를 받을 때 발생
        window.location.href = `/api/auth/kakao/callback?code=${code}`;
      } else {
        router.push(
          `/login?error=${encodeURIComponent("로그인 정보가 없습니다.")}`
        );
      }
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="max-w-md w-full rounded-2xl border border-neutral-200 bg-white p-8 shadow-md text-center">
        <h1 className="text-2xl font-semibold mb-4 text-neutral-900">
          카카오 로그인 처리 중...
        </h1>
        <p className="text-sm text-neutral-500">
          잠시만 기다려주세요. 완료되면 자동으로 메인 페이지로 이동합니다.
        </p>
      </div>
    </div>
  );
}
