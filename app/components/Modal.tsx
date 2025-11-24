"use client";

import React, { ReactNode, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  // 모달 꺼져 있으면 렌더링 안함
  if (!isOpen) return null;

  // 스크롤 방지 + 스크롤 튐 방지
  useEffect(() => {
    const body = document.body;
    const scrollBarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollBarWidth > 0) {
      body.style.paddingRight = `${scrollBarWidth}px`;
    }

    return () => {
      body.style.overflow = "";
      body.style.paddingRight = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-[#0000004D] flex justify-center items-start z-50 pt-50"
      onClick={onClose} // 배경 클릭 시 닫기
    >
      <div
        className="bg-white rounded-lg shadow-lg max-w-lg w-full mt-20 p-6 relative"
        onClick={(e) => e.stopPropagation()} // 내부 클릭 시 이벤트 버블링 방지
      >
        {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
        <div>{children}</div>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default Modal;
