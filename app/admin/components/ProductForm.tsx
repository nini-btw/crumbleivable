"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/presentation/components/ui/Button";
import { Select } from "@/presentation/components/ui/Select";
import { UploadIcon, XIcon, PlusIcon, Trash2Icon } from "lucide-react";
import type { Product, CookiePiece, CookieBox } from "@/domain/entities/product";
import { useTranslations } from 'next-intl';

interface ProductFormProps {
  mode: "add" | "edit";
  initialData?: Product;
  onSubmit?: (data: Partial<Product>) => void;
}

// Type for included cookie entry
interface IncludedCookie {
  cookiePieceId: string;
  quantity: number;
}

export function ProductForm({ mode, initialData, onSubmit }: ProductFormProps) {
  const router = useRouter();
  const t = useTranslations();
  const isEdit = mode === "edit";
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [availableCookies, setAvailableCookies] = React.useState<CookiePiece[]>([]);

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
    includedCookies: ((initialData as CookieBox)?.includedCookies || []) as IncludedCookie[],
  });

  const [images, setImages] = React.useState<string[]>(initialData?.images || []);

  // Fetch available cookies when type is box
  React.useEffect(() => {
    if (formData.type === "box") {
      fetch("/api/products/cookies")
        .then((res) => res.json())
        .then((result) => {
          if (result.success) {
            setAvailableCookies(result.data);
          }
        })
        .catch((err) => console.error("Failed to fetch cookies:", err));
    }
  }, [formData.type]);

  // Prepare cookie options for Select
  const cookieOptions = availableCookies.map((cookie) => ({
    value: cookie.id,
    label: cookie.name,
  }));

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

  // Add a new cookie entry to the box
  const handleAddCookie = () => {
    if (availableCookies.length === 0) return;
    
    setFormData((prev) => ({
      ...prev,
      includedCookies: [
        ...prev.includedCookies,
        { cookiePieceId: availableCookies[0].id, quantity: 1 },
      ],
    }));
  };

  // Update a cookie entry
  const handleUpdateCookie = (index: number, field: keyof IncludedCookie, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      includedCookies: prev.includedCookies.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  // Remove a cookie entry
  const handleRemoveCookie = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      includedCookies: prev.includedCookies.filter((_, i) => i !== index),
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

      {/* Box-specific fields */}
      {formData.type === "box" && (
        <div className="space-y-6 rounded-3xl border border-[#E8D5C0] bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#2C1810]">
              {t('admin.products.form.includedCookies')}
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleAddCookie}
              disabled={availableCookies.length === 0}
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              {t('admin.products.form.addCookie')}
            </Button>
          </div>

          {formData.includedCookies.length === 0 ? (
            <p className="text-sm text-[#A07850]">
              {t('admin.products.form.selectCookies')}
            </p>
          ) : (
            <div className="space-y-4">
              {formData.includedCookies.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-[#FDF6EE] rounded-2xl">
                  <div className="flex-1">
                    <label className="mb-2 block text-xs font-bold tracking-widest text-[#A07850] uppercase">
                      {t('admin.products.form.selectCookies')}
                    </label>
                    <Select
                      value={item.cookiePieceId}
                      onChange={(value) => handleUpdateCookie(index, 'cookiePieceId', value)}
                      options={cookieOptions}
                      placeholder={t('admin.products.form.selectCookies')}
                      size="md"
                      variant="default"
                    />
                  </div>
                  <div className="w-24">
                    <label className="mb-2 block text-xs font-bold tracking-widest text-[#A07850] uppercase">
                      {t('admin.products.form.cookieQuantity')}
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => handleUpdateCookie(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full rounded-2xl border-2 border-[#E8D5C0] bg-white px-4 py-3 text-[#2C1810] focus:border-[#F4538A] focus:ring-2 focus:ring-[#F4538A]/20 focus:outline-none"
                    />
                  </div>
                  <div className="pt-6">
                    <button
                      type="button"
                      onClick={() => handleRemoveCookie(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2Icon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
