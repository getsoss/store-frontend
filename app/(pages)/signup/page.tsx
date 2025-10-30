"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [form, setForm] = useState({
    email: "",
    name: "",
    phone: "",
    address: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const formatPhone = (value: string) => {
    const nums = value.replace(/[^0-9]/g, "");
    if (nums.length <= 3) return nums;
    if (nums.length <= 7) return `${nums.slice(0, 3)}-${nums.slice(3)}`;
    return `${nums.slice(0, 3)}-${nums.slice(3, 7)}-${nums.slice(7, 11)}`;
  };

  const onPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setForm((prev) => ({ ...prev, phone: formatPhone(value) }));
  };

  const isValidPhone = (phone: string) => {
    return /^\d{3}-\d{4}-\d{4}$/.test(phone);
  };

  const isValidPassword = (pw: string) => {
    return pw.length >= 10 && /[a-zA-Z]/.test(pw) && /\d/.test(pw);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isValidPhone(form.phone)) {
      setError("전화번호를 010-1234-5678 형식으로 정확히 입력해주세요.");
      return;
    }
    if (!isValidPassword(form.password)) {
      setError("비밀번호는 10자 이상, 영문과 숫자를 모두 포함해야 합니다.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          name: form.name,
          phone: form.phone.replace(/-/g, ""),
          address: form.address,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || `Request failed with status ${res.status}`
        );
      }

      try {
        sessionStorage.setItem(
          "signupResult",
          JSON.stringify({
            id: data?.id ?? "",
            email: form.email,
            name: form.name,
          })
        );
      } catch {}

      router.push(`/signup-done`);
    } catch (err: any) {
      if (err.message && typeof err.message === "string") {
        setError(err.message);
      } else {
        setError("회원가입 중 오류가 발생했습니다.");
      }
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
            onChange={onPhoneChange}
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
            placeholder="10자 이상의 영문, 숫자만 가능합니다."
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

        {error ? <p className="text-red-600">{error}</p> : null}
      </form>
    </main>
  );
}
