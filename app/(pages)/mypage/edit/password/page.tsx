"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PasswordUpdatePage() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (
      !form.currentPassword ||
      !form.newPassword ||
      !form.newPasswordConfirm
    ) {
      setError("모든 항목을 입력해주세요.");
      return false;
    }
    if (form.newPassword.length < 6) {
      setError("비밀번호는 10자 이상, 영문과 숫자를 모두 포함해야 합니다.");
      return false;
    }
    if (form.newPassword !== form.newPasswordConfirm) {
      setError("새 비밀번호와 확인이 일치하지 않습니다.");
      return false;
    }
    return true;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("로그인이 필요합니다");
        router.push("/login");
        return;
      }

      const res = await fetch("/api/me/edit/password", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "비밀번호 변경 실패");

      alert("비밀번호가 성공적으로 변경되었습니다.");
      router.push("/mypage");
    } catch (err: any) {
      setError(err.message || "비밀번호 변경 중 오류가 발생했습니다.");
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
      <h1 className="text-2xl font-bold mb-4">비밀번호 변경</h1>

      <form onSubmit={onSubmit} className="grid gap-3">
        <label className="grid gap-1">
          <span>현재 비밀번호</span>
          <input
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={onChange}
            required
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
          />
        </label>

        <label className="grid gap-1">
          <span>새 비밀번호</span>
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={onChange}
            required
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
          />
        </label>

        <label className="grid gap-1">
          <span>새 비밀번호 확인</span>
          <input
            type="password"
            name="newPasswordConfirm"
            value={form.newPasswordConfirm}
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
          {loading ? "변경 중..." : "비밀번호 변경"}
        </button>

        {error && <p className="text-red-600">{error}</p>}
      </form>
    </main>
  );
}
