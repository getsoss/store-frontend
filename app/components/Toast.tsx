"use client";

import React, { useEffect } from "react";
import Link from "next/link";

interface ToastProps {
  message: string;
  linkText?: string;
  linkHref?: string;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  linkText,
  linkHref,
  onClose,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-4 right-4 z-50 transform transition-all duration-300 ease-out animate-[slideUp_0.3s_ease-out]">
      <div className="bg-black text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-4 min-w-[300px]">
        <span className="flex-1">{message}</span>
        {linkText && linkHref && (
          <Link
            href={linkHref}
            className="text-yellow-400 hover:text-yellow-300 underline font-medium whitespace-nowrap"
            onClick={onClose}
          >
            {linkText}
          </Link>
        )}
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="닫기"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

