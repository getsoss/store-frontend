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
  hashtags: string[];
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
    hashtags: [],
  });
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [allHashtags, setAllHashtags] = useState<string[]>([]); // 서버에서 전체 해시태그
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]); // 사용자가 선택한 해시태그
  const [newHashtag, setNewHashtag] = useState(""); // 새 해시태그 입력용

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
    fetchHashtags();
  }, []);

  const handleAddHashtag = async () => {
    const tag = newHashtag.trim();
    if (!tag) return;

    const token = localStorage.getItem("accessToken");

    // 이미 존재하는 해시태그라면 바로 선택 상태로 만들기
    if (allHashtags.includes(tag)) {
      if (!formData.hashtags.includes(tag)) {
        setFormData((prev) => ({
          ...prev,
          hashtags: [...prev.hashtags, tag],
        }));
      }
      setNewHashtag("");
      return; // 더 이상 서버 요청 안 함
    }

    if (!token) {
      alert("로그인이 필요합니다");
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("/api/hashtags", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: tag }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || "해시태그 등록 실패");
        return;
      }

      alert(data?.message || "해시태그가 등록되었습니다.");

      // 성공 시 상태 업데이트
      setAllHashtags((prev) => [...prev, tag]);
      setFormData((prev) => ({
        ...prev,
        hashtags: [...prev.hashtags, tag],
      }));
      setNewHashtag("");
    } catch (error: any) {
      alert(error?.message || "해시태그 등록 중 오류");
    }
  };

  const handleHashtagToggle = (tag: string) => {
    setFormData((prev) => {
      const exists = prev.hashtags.includes(tag);
      return {
        ...prev,
        hashtags: exists
          ? prev.hashtags.filter((t) => t !== tag)
          : [...prev.hashtags, tag],
      };
    });
  };

  const fetchHashtags = async () => {
    try {
      const res = await fetch("/api/hashtags");
      if (!res.ok) throw new Error("해시태그 로드 실패");
      const data = await res.json();
      setAllHashtags(data); // name 기준으로 사용
    } catch (error) {
      console.error(error);
    }
  };

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

  const isFormValid = (): boolean => {
    // 이름, 가격, 카테고리, 사이즈가 모두 유효한지 체크
    const hasName = formData.name.trim() !== "";
    const hasPrice = formData.price > 0;
    const hasCategory = formData.categoryId !== 0;
    const hasSizes = formData.sizes.every((size) => size.trim() !== "");

    return hasName && hasPrice && hasCategory && hasSizes;
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
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("로그인이 필요합니다");
        router.push("/login");
        return;
      }

      const body = {
        product: {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          categoryId: Number(formData.categoryId),
        },
        productSizes: formData.sizes.map((size) => ({ size })),
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("상품 업로드 실패");

      const created = await res.json();
      const productId = created?.product?.productId;
      if (!productId) throw new Error("상품 ID를 가져오지 못했습니다.");

      // 이미지 업로드
      if (images.length > 0) {
        const imgForm = new FormData();
        images.forEach((img) => imgForm.append("images", img.file));
        const imgRes = await fetch(`/api/products/${productId}/images`, {
          method: "POST",
          body: imgForm,
        });
        if (!imgRes.ok) throw new Error("이미지 업로드 실패");
      }

      // 해시태그 연동
      if (formData.hashtags.length > 0) {
        const tagRes = await fetch(`/api/products/${productId}/hashtags`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ hashtags: formData.hashtags }),
        });
        if (!tagRes.ok) throw new Error("해시태그 연동 실패");
      }

      alert("상품이 등록되었습니다.");
      router.replace("/");
    } catch (error: any) {
      console.error(error);
      alert(error?.message || "상품 등록 중 오류가 발생했습니다.");
    }
  };

  if (!allowed) return null;

  console.log(allHashtags);

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
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault(); // 폼 제출 방지
                    handleAddButton();
                  }
                }}
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
          <label className="w-full block text-sm font-medium">해시태그</label>
          <div className="flex gap-2 flex-wrap">
            {allHashtags.map((tag, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleHashtagToggle(tag)}
                className={`px-3 py-1 rounded-full border ${
                  formData.hashtags.includes(tag)
                    ? "bg-black text-white"
                    : "border-gray-300 text-gray-700"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={newHashtag}
              onChange={(e) => setNewHashtag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault(); // 폼 제출 방지
                  handleAddHashtag();
                }
              }}
              placeholder="새 해시태그 입력"
              className="border p-2 rounded flex-1"
            />

            <button
              type="button"
              onClick={handleAddHashtag}
              className="border p-2 rounded"
            >
              추가
            </button>
          </div>
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
          className={`w-full mt-5 px-3.5 py-2.5 rounded-md ${
            isFormValid()
              ? "bg-black text-white"
              : "bg-gray-200 text-gray-800 cursor-not-allowed"
          }`}
          onClick={handleClickUpload}
          disabled={!isFormValid()}
        >
          등록하기
        </button>
      </div>
    </main>
  );
}
