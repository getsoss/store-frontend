"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function parseJwt(token: string | null) {
  if (!token) return null;
  try {
    const base64Payload = token.split(".")[1];
    const payload = JSON.parse(atob(base64Payload));
    return payload;
  } catch (e) {
    return null;
  }
}

interface Category {
  categoryId: number;
  name: string;
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
}

export default function ProductUploadPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState<ProductForm>({
    name: "",
    description: "",
    price: 0,
    categoryId: 0,
  });
  const [images, setImages] = useState<ImagePreview[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const payload = parseJwt(token);
    if (!payload || payload.exp * 1000 <= Date.now()) {
      alert("접근 권한이 없습니다.");
      router.replace("/login");
      return;
    }
    try {
      const role = (payload as any)?.role as string | undefined;
      const isAdmin = role === "admin";
      if (!isAdmin) {
        alert("접근 권한이 없습니다.");
        router.replace("/");
        return;
      }
      setAllowed(true);
    } catch {
      router.replace("/");
    }
  }, [router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const remainingSlots = 5 - images.length;

    const filesToAdd = newFiles.slice(0, remainingSlots);
    const newImages: ImagePreview[] = filesToAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);

    // input 초기화
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

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/products/upload");
      if (!res.ok) {
        const text = await res.text();
        console.error(text || "서버 요청 실패");
        return;
      }
      const data = await res.json();
      setCategories(data);
    } catch (error: any) {
      console.error(error?.message || "서버 요청 실패");
    }
  };

  const handleClickUpload = async () => {
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category_id: formData.categoryId,
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (!res.ok) {
        throw new Error("업로드 실패");
      }
      const created = await res.json();
      const productId = created?.productId ?? created?.id;
      if (!productId) {
        throw new Error("상품 ID를 가져오지 못했습니다.");
      }

      if (images.length > 0) {
        const imgForm = new FormData();
        images.forEach((image) => imgForm.append("images", image.file));
        const imgRes = await fetch(`/api/products/${productId}/images`, {
          method: "POST",
          body: imgForm,
        });
        if (!imgRes.ok) {
          const errText = await imgRes.text();
          throw new Error(errText || "이미지 업로드 실패");
        }
      }

      alert("상품이 등록되었습니다.");
      router.replace("/");
    } catch (error) {
      console.error(error);
    }
  };

  console.log(categories);

  if (!allowed) return null;

  return (
    <main className="mx-auto max-w-2xl p-6 mt-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">상품 등록</h1>
        <Link href="/" className="text-sm hover:underline">
          돌아가기
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-1 gap-4">
          <input
            className="border p-2 rounded"
            placeholder="상품명"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
          />
          <textarea
            className="border p-2 rounded"
            placeholder="설명"
            rows={4}
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
          />
          <input
            className="border p-2 rounded"
            placeholder="가격"
            type="number"
            value={formData.price}
            onChange={(e) => handleInputChange("price", e.target.value)}
          />
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium block">
                카테고리 <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                className="w-full border p-2 rounded text-base"
                value={formData.categoryId}
                onChange={(e) =>
                  handleInputChange("categoryId", e.target.value)
                }
                required
              >
                <option value="">카테고리 선택</option>
                {categories.map((category: Category, id) => {
                  return (
                    <option key={id} value={category.categoryId}>
                      {category.name}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium block">
              이미지 <span className="text-gray-500 text-xs">(최대 5개)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                    <img
                      src={image.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
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
            className="px-3.5 py-2.5 rounded-md bg-gray-200 text-gray-800"
            onClick={handleClickUpload}
          >
            등록하기
          </button>
        </div>
      </div>
    </main>
  );
}
