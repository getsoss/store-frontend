"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PasswordConfirmPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError("비밀번호를 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("로그인이 필요합니다");
        router.push("/login");
        return;
      }

      const res = await fetch("/api/me/confirm-password", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "비밀번호 확인 실패");

      // 비밀번호 확인 성공하면 회원정보 수정 페이지로 이동
      router.push("/mypage/edit");
    } catch (err: any) {
      setError(err.message || "비밀번호 확인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-md p-4 mt-10">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm inline-flex items-center cursor-pointer"
        >
          ← 돌아가기
        </button>
      </div>
      <h1 className="text-2xl font-bold mb-4">비밀번호 확인</h1>

      <form onSubmit={onSubmit} className="grid gap-3">
        <label className="grid gap-1">
          <span>비밀번호</span>
          <input
            type="password"
            name="password"
            value={password}
            onChange={onChange}
            required
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="px-3.5 py-2.5 rounded-md bg-neutral-900 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "확인 중..." : "확인"}
        </button>

        {error && <p className="text-red-600">{error}</p>}
      </form>
    </main>
  );
}
