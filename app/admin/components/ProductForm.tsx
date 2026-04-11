"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/presentation/components/ui/Button";
import { UploadIcon, XIcon } from "lucide-react";
import type { Product, CookiePiece, CookieBox } from "@/domain/entities/product";

interface ProductFormProps {
  mode: "add" | "edit";
  initialData?: Product;
  onSubmit?: (data: Partial<Product>) => void;
}

export function ProductForm({ mode, initialData, onSubmit }: ProductFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const [formData, setFormData] = React.useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    type: (initialData?.type as "cookie" | "box") || "cookie",
    isActive: initialData?.isActive ?? true,
    // Cookie-specific
    flavour: (initialData as CookiePiece)?.flavour || "",
    allergens: (initialData as CookiePiece)?.allergens?.join(", ") || "",
    isNew: (initialData as CookiePiece)?.isNew || false,
    isSoldOut: (initialData as CookiePiece)?.isSoldOut || false,
    // Box-specific
    includedCookies: (initialData as CookieBox)?.includedCookies || [],
  });

  const [images, setImages] = React.useState<string[]>(initialData?.images || []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const result = await response.json();

      if (result.success) {
        setImages((prev) => [...prev, result.url]);
      } else {
        alert(result.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const productData: Partial<Product> = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      price: Number(formData.price),
      type: formData.type,
      isActive: formData.isActive,
      images: images,
    };

    if (formData.type === "cookie") {
      (productData as Partial<CookiePiece>).flavour = formData.flavour;
      (productData as Partial<CookiePiece>).allergens = formData.allergens
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean) as any;
      (productData as Partial<CookiePiece>).isNew = formData.isNew;
      (productData as Partial<CookiePiece>).isSoldOut = formData.isSoldOut;
    } else {
      (productData as Partial<CookieBox>).includedCookies = formData.includedCookies;
    }

    if (onSubmit) {
      onSubmit(productData);
      return;
    }

    // Default behavior: call API
    try {
      const url = isEdit && initialData ? `/api/products/${initialData.id}` : "/api/products";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      const result = await response.json();

      if (result.success) {
        router.push("/admin/products");
      } else {
        alert(result.error || "Failed to save product");
      }
    } catch (error) {
      console.error("Failed to save product:", error);
      alert("Failed to save product");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* <div className="space-y-4 rounded-3xl border border-[#E8D5C0] bg-white p-6">
        <h2 className="text-lg font-bold text-[#2C1810]">Product Images</h2>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />

        <div className="flex flex-wrap gap-3">
          {images.map((imageUrl, index) => (
            <div
              key={index}
              className="group relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border-2 border-[#E8D5C0] bg-[#FDF6EE]"
            >
               <img src={imageUrl} alt={`Product ${index + 1}`} className="h-20 w-20 p-1" />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 z-10 cursor-pointer rounded-full bg-red-500 p-1 text-white opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100"
              >
                <XIcon className="h-3 w-3" />
              </button>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 rounded bg-[#F4538A] px-1.5 py-0.5 text-[9px] font-semibold text-white">
                  Main
                </span>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex h-24 w-24 flex-shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[#E8D5C0] transition-colors hover:border-[#F4538A] hover:bg-[#FFF0F5] disabled:opacity-50"
          >
            {isUploading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#F4538A] border-t-transparent" />
            ) : (
              <>
                <UploadIcon className="h-5 w-5 text-[#A07850]" />
                <span className="px-1 text-center text-[10px] leading-tight font-medium text-[#A07850]">
                  Add photo
                </span>
              </>
            )}
          </button>
        </div>
      </div>
 */}
      {/* Basic Info */}
      <div className="space-y-6 rounded-3xl border border-[#E8D5C0] bg-white p-6">
        <h2 className="text-lg font-bold text-[#2C1810]">Basic Information</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-bold tracking-widest text-[#A07850] uppercase">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border-2 border-[#E8D5C0] bg-white px-4 py-3 text-[#2C1810] focus:border-[#F4538A] focus:ring-2 focus:ring-[#F4538A]/20 focus:outline-none"
              placeholder="e.g., Classic Chocolate Chip"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold tracking-widest text-[#A07850] uppercase">
              Slug
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border-2 border-[#E8D5C0] bg-white px-4 py-3 text-[#2C1810] focus:border-[#F4538A] focus:ring-2 focus:ring-[#F4538A]/20 focus:outline-none"
              placeholder="e.g., classic-chocolate-chip"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold tracking-widest text-[#A07850] uppercase">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={3}
            className="w-full resize-none rounded-2xl border-2 border-[#E8D5C0] bg-white px-4 py-3 text-[#2C1810] focus:border-[#F4538A] focus:ring-2 focus:ring-[#F4538A]/20 focus:outline-none"
            placeholder="Describe your product..."
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-xs font-bold tracking-widest text-[#A07850] uppercase">
              Price (DA)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min={0}
              className="w-full rounded-2xl border-2 border-[#E8D5C0] bg-white px-4 py-3 text-[#2C1810] focus:border-[#F4538A] focus:ring-2 focus:ring-[#F4538A]/20 focus:outline-none"
              placeholder="0"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold tracking-widest text-[#A07850] uppercase">
              Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              disabled={isEdit}
              className="w-full cursor-pointer appearance-none rounded-2xl border-2 border-[#E8D5C0] bg-white px-4 py-3 text-[#2C1810] focus:border-[#F4538A] focus:ring-2 focus:ring-[#F4538A]/20 focus:outline-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235C3D2E' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 16px center",
              }}
            >
              <option value="cookie">Cookie</option>
              <option value="box">Box</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                className="h-5 w-5 cursor-pointer rounded border-2 border-[#E8D5C0] text-[#F4538A] focus:ring-[#F4538A]"
              />
              <span className="font-medium text-[#2C1810]">Active</span>
            </label>
          </div>
        </div>
      </div>

      {/* Cookie-specific fields */}
      {formData.type === "cookie" && (
        <div className="space-y-6 rounded-3xl border border-[#E8D5C0] bg-white p-6">
          <h2 className="text-lg font-bold text-[#2C1810]">Cookie Details</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-bold tracking-widest text-[#A07850] uppercase">
                Flavour
              </label>
              <input
                type="text"
                name="flavour"
                value={formData.flavour}
                onChange={handleChange}
                className="w-full rounded-2xl border-2 border-[#E8D5C0] bg-white px-4 py-3 text-[#2C1810] focus:border-[#F4538A] focus:ring-2 focus:ring-[#F4538A]/20 focus:outline-none"
                placeholder="e.g., Chocolate Chip"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold tracking-widest text-[#A07850] uppercase">
                Allergens (comma-separated)
              </label>
              <input
                type="text"
                name="allergens"
                value={formData.allergens}
                onChange={handleChange}
                className="w-full rounded-2xl border-2 border-[#E8D5C0] bg-white px-4 py-3 text-[#2C1810] focus:border-[#F4538A] focus:ring-2 focus:ring-[#F4538A]/20 focus:outline-none"
                placeholder="e.g., gluten, dairy, eggs"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="isNew"
                checked={formData.isNew}
                onChange={(e) => setFormData((prev) => ({ ...prev, isNew: e.target.checked }))}
                className="h-5 w-5 cursor-pointer rounded border-2 border-[#E8D5C0] text-[#F4538A] focus:ring-[#F4538A]"
              />
              <span className="font-medium text-[#2C1810]">Mark as New</span>
            </label>

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="isSoldOut"
                checked={formData.isSoldOut}
                onChange={(e) => setFormData((prev) => ({ ...prev, isSoldOut: e.target.checked }))}
                className="h-5 w-5 cursor-pointer rounded border-2 border-[#E8D5C0] text-[#F4538A] focus:ring-[#F4538A]"
              />
              <span className="font-medium text-[#2C1810]">Sold Out</span>
            </label>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col justify-end gap-4 sm:flex-row">
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/products")}>
          Cancel
        </Button>
        <Button type="submit">{isEdit ? "Save Changes" : "Create Product"}</Button>
      </div>
    </form>
  );
}
