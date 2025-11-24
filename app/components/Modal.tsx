"use client";

import React, { ReactNode, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  useEffect(() => {
    const body = document.body;
    const header = document.querySelector("header") as HTMLElement | null;

    const scrollBarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";

    if (scrollBarWidth > 0) {
      body.style.paddingRight = `${scrollBarWidth}px`;
      if (header) header.style.paddingRight = `${scrollBarWidth}px`;
    }

    return () => {
      body.style.overflow = "";
      body.style.paddingRight = "";
      if (header) header.style.paddingRight = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-[#0000004D] flex justify-center items-start z-50 pt-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg max-w-lg w-full mt-20 p-6 relative"
        onClick={(e) => e.stopPropagation()}
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
