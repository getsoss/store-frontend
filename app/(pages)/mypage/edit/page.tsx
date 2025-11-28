"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UpdateRequestDTO } from "@/app/types/dto";

export default function UpdatePage() {
  const [form, setForm] = useState({
    email: "",
    name: "",
    phone: "",
    address: "",
    addressDetail: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // 주소검색 스크립트 로딩
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).daum && (window as any).daum.Postcode) return;

    const script = document.createElement("script");
    script.src =
      "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // 초기 사용자 정보 불러오기 (GET /api/me/edit)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          alert("로그인이 필요합니다");
          router.push("/login");
          return;
        }

        const res = await fetch("/api/me/edit", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("사용자 정보를 불러오지 못했습니다.");
        const data = await res.json();
        setForm((prev) => ({
          ...prev,
          email: data.email || "",
          name: data.name || "",
          phone: formatPhone(data.phone || ""),
          address: data.address || "",
        }));
      } catch (err: any) {
        setError(
          err.message || "사용자 정보를 불러오는 중 오류가 발생했습니다."
        );
      }
    };

    fetchUser();
  }, []);

  const openPostcode = () => {
    if (!(window as any).daum || !(window as any).daum.Postcode) {
      alert(
        "주소 검색 스크립트를 불러오는 중입니다. 잠시 후 다시 시도해주세요."
      );
      return;
    }

    new (window as any).daum.Postcode({
      oncomplete: (data: any) => {
        const address = data.roadAddress || data.address || "";
        setForm((prev) => ({ ...prev, address }));
      },
    }).open();
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

  const isValidPhone = (phone: string) => /^\d{3}-\d{4}-\d{4}$/.test(phone);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidPhone(form.phone)) {
      setError("전화번호를 010-1234-5678 형식으로 정확히 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const updateData: UpdateRequestDTO = {
        name: form.name,
        phone: form.phone.replace(/-/g, ""),
        address: `${form.address}${
          form.addressDetail ? ` ${form.addressDetail}` : ""
        }`.trim(),
      };

      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("로그인이 필요합니다");
        router.push("/login");
        return;
      }

      const res = await fetch("/api/me/edit", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "회원정보 수정 실패");

      alert("내 정보가 수정되었습니다");
      router.push("/mypage");
    } catch (err: any) {
      setError(err.message || "회원정보 수정 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-md p-4 mt-10">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => router.push("/mypage")}
          className="text-sm inline-flex items-center cursor-pointer"
        >
          ← 돌아가기
        </button>
      </div>
      <h1 className="text-2xl font-bold mb-4">회원정보 수정</h1>

      <form onSubmit={onSubmit} className="grid gap-3">
        <label className="grid gap-1">
          <span>이메일</span>
          <input
            type="email"
            name="email"
            value={form.email}
            readOnly
            className="px-3 py-2 border border-gray-300 rounded-md bg-gray-200 cursor-not-allowed"
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
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
          />
        </label>

        {/* 주소 입력 + 검색 버튼 */}
        <label className="grid gap-1">
          <span>주소</span>
          <div className="flex gap-2">
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={onChange}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
            />
            <button
              type="button"
              onClick={openPostcode}
              className="px-3.5 py-2.5 rounded-md border border-gray-300 hover:bg-gray-50"
            >
              주소검색
            </button>
          </div>
        </label>

        <label className="grid gap-1">
          <input
            type="text"
            name="addressDetail"
            value={form.addressDetail}
            onChange={onChange}
            placeholder="동/호수, 건물명, 상세 위치 등"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="px-3.5 py-2.5 rounded-md bg-neutral-900 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "처리 중..." : "정보 수정"}
        </button>

        {error && <p className="text-red-600">{error}</p>}
      </form>
    </main>
  );
}
