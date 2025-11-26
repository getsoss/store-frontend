"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginRequestDTO, LoginResponseDTO } from "@/app/types/dto";

export default function LoginPage() {
  const [form, setForm] = useState<LoginRequestDTO>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
        credentials: "include", // 쿠키 수신
      });

      const data: LoginResponseDTO = await res.json();

      if (!res.ok) {
        throw new Error((data as any)?.error || "로그인 실패");
      }

      // 이제 accessToken만 localStorage에 저장
      try {
        localStorage.setItem("accessToken", data.accessToken);
      } catch {}

      router.push("/");
    } catch (err: any) {
      setError("로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleKakaoLogin = () => {
    const redirectUri = encodeURIComponent(
      `${window.location.origin}/auth/kakao/callback`
    );
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=db9fb19e427540250b00561168b26017&redirect_uri=${redirectUri}&response_type=code`;
    window.location.href = kakaoAuthUrl;
  };

  return (
    <main className="mx-auto max-w-md p-4 mt-10">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-4 text-sm text-gray-500 hover:text-black transition"
      >
        ← 돌아가기
      </button>
      <h1 className="text-2xl font-bold mb-4">로그인</h1>
      <form onSubmit={onSubmit} className="grid gap-3">
        <label className="grid gap-1">
          <span>이메일</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            required
            placeholder="you@example.com"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
          />
        </label>
        <label className="grid gap-1">
          <span>비밀번호</span>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            required
            minLength={6}
            placeholder="비밀번호"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="px-3.5 py-2.5 rounded-md bg-neutral-900 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "처리 중..." : "로그인"}
        </button>

        {error ? <p className="text-red-600">{error}</p> : null}
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">또는</span>
          </div>
        </div>

        <button
          onClick={handleKakaoLogin}
          className="mt-4 w-full px-3.5 py-2.5 rounded-md bg-[#FEE500] text-black font-medium hover:bg-[#FDD835] transition"
        >
          카카오로 회원가입
        </button>
      </div>
    </main>
  );
}
