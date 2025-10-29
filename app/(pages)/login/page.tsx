"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "로그인 실패");
      }

      try {
        const payload = {
          email: form.email,
          accessToken: data?.accessToken ?? "",
        };
        sessionStorage.setItem("authUser", JSON.stringify(payload));
        sessionStorage.setItem("authToken", payload.accessToken);
        console.log(payload.accessToken);
      } catch {}

      router.push("/");
    } catch (err: any) {
      setError("로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-md p-4 mt-10">
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
    </main>
  );
}
