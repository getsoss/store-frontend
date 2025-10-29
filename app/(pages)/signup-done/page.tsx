"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupDonePage() {
  const router = useRouter();

  const [userInfo, setUserInfo] = useState<{
    id?: string;
    email?: string;
    name?: string;
  }>({});

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("signupResult");
      if (raw) {
        const parsed = JSON.parse(raw);
        setUserInfo(parsed);
        sessionStorage.removeItem("signupResult");
      }
    } catch {}
  }, []);

  return (
    <main className="mx-auto max-w-md p-4 mt-10">
      <h1 className="text-2xl font-bold mb-6 text-center">회원 가입 완료</h1>

      {/* Main Content Box */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <p className="text-center text-lg mb-4">
          {userInfo.name}님 축하합니다!
        </p>
        <p className="text-center mb-2">회원가입이 완료 되었습니다.</p>

        <hr className="border-gray-200 mb-6" />

        {/* User Information */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="font-medium">이름</div>
          <div>{userInfo.name}</div>
          <div className="font-medium">이메일</div>
          <div>{userInfo.email || "-"}</div>
        </div>
      </div>

      {/* Go to Main Button */}
      <button
        onClick={() => router.push("/")}
        className="w-full px-3.5 py-2.5 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
      >
        메인으로 이동
      </button>
    </main>
  );
}
