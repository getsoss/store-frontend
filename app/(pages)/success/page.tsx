"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SuccessPage() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"processing" | "success" | "fail">(
    "processing"
  );

  useEffect(() => {
    const paymentKey = params.get("paymentKey");
    const orderId = params.get("orderId");
    const amount = Number(params.get("amount"));

    (async () => {
      try {
        const res = await fetch("/api/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentKey, orderId, amount }),
        });

        if (res.ok) setStatus("success");
        else setStatus("fail");
      } catch {
        setStatus("fail");
      }
    })();
  }, [params]);

  const handleGoHome = () => {
    router.push("/");
  };

  const statusMessage = {
    processing: "결제 확인 중...",
    success: "결제 성공!",
    fail: "결제 실패",
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white">
      <div className="max-w-md w-full rounded-2xl p-8 shadow-md text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          {statusMessage[status]}
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          {status === "processing"
            ? "잠시만 기다려주세요..."
            : status === "success"
            ? "주문이 정상적으로 완료되었습니다."
            : "결제에 실패했습니다. 다시 시도해주세요."}
        </p>

        {status === "success" && (
          <button
            onClick={handleGoHome}
            className="mt-4 w-full rounded-lg bg-black text-white py-2 px-4 text-sm font-medium transition hover:bg-gray-900"
          >
            쇼핑하기
          </button>
        )}
      </div>
    </div>
  );
}
