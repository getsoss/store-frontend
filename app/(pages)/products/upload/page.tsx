"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Category } from "@/app/types/dto";

function parseJwt(token: string | null) {
  if (!token) return null;
  try {
    const base64Payload = token.split(".")[1];
    const payload = JSON.parse(atob(base64Payload));
    return payload;
  } catch {
    return null;
  }
}

interface ImagePreview {
  file: File;
  preview: string;
}

interface ProductForm {
  name: string;
  description: string;
  price: number;
  categoryId: number;
  sizes: string[];
}

export default function ProductUploadPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<ProductForm>({
    name: "",
    description: "",
    price: 0,
    categoryId: 0,
    sizes: [""],
  });
  const [images, setImages] = useState<ImagePreview[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const payload = parseJwt(token);
    if (!payload || payload.exp * 1000 <= Date.now()) {
      alert("접근 권한이 없습니다.");
      router.replace("/login");
      return;
    }
    const role = (payload as any)?.role;
    if (role !== "admin") {
      alert("접근 권한이 없습니다.");
      router.replace("/");
      return;
    }
    setAllowed(true);
  }, [router]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("카테고리 로드 실패");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error(error);
    }
  };

  // 입력 핸들러
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]:
        field === "price"
          ? Number(value)
          : field === "categoryId"
          ? value === ""
            ? 0
            : Number(value)
          : value,
    }));
  };

  const handleSizeChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newSizes = [...prev.sizes];
      newSizes[index] = value;
      return { ...prev, sizes: newSizes };
    });
  };

  const handleAddButton = () => {
    setFormData((prev) => ({ ...prev, sizes: [...prev.sizes, ""] }));
  };

  const handleDeleteButton = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index),
    }));
  };

  // 이미지 처리
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files).slice(0, 5 - images.length);
    const previews: ImagePreview[] = newFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...previews]);
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  // 상품 등록
  const handleClickUpload = async () => {
    try {
      const body = {
        product: {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          categoryId: Number(formData.categoryId),
        },
        productSizes: formData.sizes.map((size) => ({
          size,
        })),
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      console.log(body);
      if (!res.ok) throw new Error("상품 업로드 실패");

      const created = await res.json();
      const productId = created?.product?.productId;
      if (!productId) throw new Error("상품 ID를 가져오지 못했습니다.");

      if (images.length > 0) {
        const imgForm = new FormData();
        images.forEach((img) => imgForm.append("images", img.file));
        const imgRes = await fetch(`/api/products/${productId}/images`, {
          method: "POST",
          body: imgForm,
        });
        if (!imgRes.ok) throw new Error("이미지 업로드 실패");
      }

      alert("상품이 등록되었습니다.");
      router.replace("/");
    } catch (error: any) {
      console.error(error);
      alert(error?.message || "상품 등록 중 오류가 발생했습니다.");
    }
  };

  if (!allowed) return null;

  return (
    <main className="mx-auto max-w-2xl p-6 mt-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">상품 등록</h1>
        <Link href="/" className="text-sm hover:underline">
          돌아가기
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <input
          className="border p-2 rounded w-full"
          placeholder="상품명"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
        />
        <textarea
          className="border p-2 rounded w-full"
          placeholder="설명"
          rows={4}
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
        />
        <input
          className="border p-2 rounded w-full"
          placeholder="가격"
          type="number"
          value={formData.price}
          onChange={(e) => handleInputChange("price", e.target.value)}
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium">
            카테고리 <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full border p-2 rounded"
            value={formData.categoryId}
            onChange={(e) => handleInputChange("categoryId", e.target.value)}
          >
            <option value="">카테고리 선택</option>
            {categories.map((cat) => (
              <option key={cat.categoryId} value={cat.categoryId}>
                {cat.name}
              </option>
            ))}
          </select>

          <label className="block text-sm font-medium mt-4">
            사이즈 <span className="text-red-500">*</span>
          </label>
          {formData.sizes.map((size, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <input
                className="border p-2 rounded flex-1"
                placeholder="ex) Free, S, M, L"
                value={size}
                onChange={(e) => handleSizeChange(index, e.target.value)}
              />
              {index === 0 ? (
                <button
                  type="button"
                  onClick={handleAddButton}
                  className="border rounded p-2"
                >
                  추가
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleDeleteButton(index)}
                  className="border rounded p-2 text-red-500"
                >
                  삭제
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-2 mt-4">
          <label className="block text-sm font-medium">
            이미지 <span className="text-gray-500 text-xs">(최대 5개)</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {images.map((img, idx) => (
              <div key={idx} className="relative group">
                <div className="aspect-square border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  <img
                    src={img.preview}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400">
                <div className="text-center">
                  <div className="text-2xl mb-1">+</div>
                  <div className="text-xs text-gray-500">이미지 추가</div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>
        </div>

        <button
          className="w-full mt-5 px-3.5 py-2.5 rounded-md bg-gray-200 text-gray-800"
          onClick={handleClickUpload}
        >
          등록하기
        </button>
      </div>
    </main>
  );
}
