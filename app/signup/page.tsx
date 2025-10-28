"use client";

import { useState } from "react";

export default function SignupPage() {
  const [form, setForm] = useState({
    email: "",
    name: "",
    phone: "",
    address: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          name: form.name,
          phone: form.phone,
          address: form.address,
          password: form.password,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed with status ${res.status}`);
      }

      setMessage("회원가입이 완료되었습니다.");
      setForm({ email: "", name: "", phone: "", address: "", password: "" });
    } catch (err: any) {
      setError(err?.message ?? "회원가입 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-md p-4 mt-10">
      <h1 className="text-2xl font-bold mb-4">회원가입</h1>
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
          <span>이름</span>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={onChange}
            required
            placeholder="홍길동"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
          />
        </label>
        <label className="grid gap-1">
          <span>휴대폰</span>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={onChange}
            required
            placeholder="010-1234-5678"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
          />
        </label>
        <label className="grid gap-1">
          <span>주소</span>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={onChange}
            required
            placeholder="서울특별시 ..."
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
            placeholder="6자 이상 비밀번호"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="px-3.5 py-2.5 rounded-md bg-neutral-900 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "처리 중..." : "회원가입"}
        </button>

        {message ? <p className="text-green-600">{message}</p> : null}
        {error ? <p className="text-red-600">{error}</p> : null}
      </form>
    </main>
  );
}
