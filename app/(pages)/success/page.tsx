// app/success/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SuccessPage() {
  const params = useSearchParams();
  const [status, setStatus] = useState("processing");

  useEffect(() => {
    const paymentKey = params.get("paymentKey");
    const orderId = params.get("orderId");
    const amount = params.get("amount");

    (async () => {
      const res = await fetch("/api/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentKey, orderId, amount }),
      });

      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("fail");
      }
    })();
  }, []);

  return (
    <div>
      {status === "processing" && <p>결제 확인 중...</p>}
      {status === "success" && <p>결제 성공!</p>}
      {status === "fail" && <p>결제 실패</p>}
    </div>
  );
}
