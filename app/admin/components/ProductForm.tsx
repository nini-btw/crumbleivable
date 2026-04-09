"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/presentation/components/ui/Button";
import type { Product, CookiePiece, CookieBox } from "@/domain/entities/product";

interface ProductFormProps {
  mode: "add" | "edit";
  initialData?: Product;
  onSubmit?: (data: Partial<Product>) => void;
}

export function ProductForm({ mode, initialData, onSubmit }: ProductFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";
  
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData: Partial<Product> = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      price: Number(formData.price),
      type: formData.type,
      isActive: formData.isActive,
      images: [],
    };

    if (formData.type === "cookie") {
      (productData as Partial<CookiePiece>).flavour = formData.flavour;
      (productData as Partial<CookiePiece>).allergens = formData.allergens.split(",").map(s => s.trim()).filter(Boolean) as any;
      (productData as Partial<CookiePiece>).isNew = formData.isNew;
      (productData as Partial<CookiePiece>).isSoldOut = formData.isSoldOut;
    } else {
      (productData as Partial<CookieBox>).includedCookies = formData.includedCookies;
    }

    onSubmit?.(productData);
    
    if (!onSubmit) {
      // Default behavior: navigate back
      router.push("/admin/products");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="bg-white rounded-3xl border border-brown-100 p-6 space-y-6">
        <h2 className="font-bold text-brown-900 text-lg">Basic Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-brown-400 block mb-2">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full bg-white border-2 border-[#E8D5C0] rounded-2xl px-4 py-3 text-[#2C1810] focus:outline-none focus:border-[#F4538A] focus:ring-2 focus:ring-[#F4538A]/20"
              placeholder="e.g., Classic Chocolate Chip"
            />
          </div>
          
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-brown-400 block mb-2">
              Slug
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              className="w-full bg-white border-2 border-[#E8D5C0] rounded-2xl px-4 py-3 text-[#2C1810] focus:outline-none focus:border-[#F4538A] focus:ring-2 focus:ring-[#F4538A]/20"
              placeholder="e.g., classic-chocolate-chip"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-brown-400 block mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={3}
            className="w-full bg-white border-2 border-[#E8D5C0] rounded-2xl px-4 py-3 text-[#2C1810] focus:outline-none focus:border-[#F4538A] focus:ring-2 focus:ring-[#F4538A]/20 resize-none"
            placeholder="Describe your product..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-brown-400 block mb-2">
              Price (DA)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min={0}
              className="w-full bg-white border-2 border-[#E8D5C0] rounded-2xl px-4 py-3 text-[#2C1810] focus:outline-none focus:border-[#F4538A] focus:ring-2 focus:ring-[#F4538A]/20"
              placeholder="0"
            />
          </div>
          
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-brown-400 block mb-2">
              Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              disabled={isEdit}
              className="w-full bg-white border-2 border-[#E8D5C0] rounded-2xl px-4 py-3 text-[#2C1810] focus:outline-none focus:border-[#F4538A] focus:ring-2 focus:ring-[#F4538A]/20 cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235C3D2E' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 16px center',
              }}
            >
              <option value="cookie">Cookie</option>
              <option value="box">Box</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-5 h-5 rounded border-2 border-[#E8D5C0] text-[#F4538A] focus:ring-[#F4538A] cursor-pointer"
              />
              <span className="text-[#2C1810] font-medium">Active</span>
            </label>
          </div>
        </div>
      </div>

      {/* Cookie-specific fields */}
      {formData.type === "cookie" && (
        <div className="bg-white rounded-3xl border border-brown-100 p-6 space-y-6">
          <h2 className="font-bold text-brown-900 text-lg">Cookie Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-brown-400 block mb-2">
                Flavour
              </label>
              <input
                type="text"
                name="flavour"
                value={formData.flavour}
                onChange={handleChange}
                className="w-full bg-white border-2 border-[#E8D5C0] rounded-2xl px-4 py-3 text-[#2C1810] focus:outline-none focus:border-[#F4538A] focus:ring-2 focus:ring-[#F4538A]/20"
                placeholder="e.g., Chocolate Chip"
              />
            </div>
            
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-brown-400 block mb-2">
                Allergens (comma-separated)
              </label>
              <input
                type="text"
                name="allergens"
                value={formData.allergens}
                onChange={handleChange}
                className="w-full bg-white border-2 border-[#E8D5C0] rounded-2xl px-4 py-3 text-[#2C1810] focus:outline-none focus:border-[#F4538A] focus:ring-2 focus:ring-[#F4538A]/20"
                placeholder="e.g., gluten, dairy, eggs"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isNew"
                checked={formData.isNew}
                onChange={(e) => setFormData(prev => ({ ...prev, isNew: e.target.checked }))}
                className="w-5 h-5 rounded border-2 border-[#E8D5C0] text-[#F4538A] focus:ring-[#F4538A] cursor-pointer"
              />
              <span className="text-[#2C1810] font-medium">Mark as New</span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isSoldOut"
                checked={formData.isSoldOut}
                onChange={(e) => setFormData(prev => ({ ...prev, isSoldOut: e.target.checked }))}
                className="w-5 h-5 rounded border-2 border-[#E8D5C0] text-[#F4538A] focus:ring-[#F4538A] cursor-pointer"
              />
              <span className="text-[#2C1810] font-medium">Sold Out</span>
            </label>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/products")}
        >
          Cancel
        </Button>
        <Button type="submit">
          {isEdit ? "Save Changes" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
