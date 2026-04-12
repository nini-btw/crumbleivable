"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import {
  PlusIcon,
  PencilIcon,
  Trash2Icon,
  ImageIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  XIcon,
  SearchIcon,
  PackageIcon,
  UploadIcon,
} from "lucide-react";
import { Button } from "@/presentation/components/ui/Button";
import { Select } from "@/presentation/components/ui/Select";
import type { Product, CookiePiece } from "@/domain/entities/product";
import { isCookiePiece } from "@/domain/entities/product";
import { useTranslations, useLocale } from 'next-intl';

type SortField = "name" | "price" | "type" | "status";
type SortDirection = "asc" | "desc";

// Product Form Modal Component
function ProductModal({
  isOpen,
  onClose,
  product,
  onSave,
  isSubmitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (formData: ProductFormData) => void;
  isSubmitting: boolean;
}) {
  const t = useTranslations();
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    slug: "",
    description: "",
    price: 150,
    type: "cookie",
    isActive: true,
    images: [],
    flavour: "",
    allergens: [],
    pieces: [],
    isNew: true,
    isSoldOut: false,
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      const cookieData = isCookiePiece(product)
        ? {
            flavour: product.flavour || "",
            allergens: product.allergens || [],
            isNew: product.isNew ?? true,
            isSoldOut: product.isSoldOut ?? false,
          }
        : {
            flavour: "",
            allergens: [],
            isNew: true,
            isSoldOut: false,
          };

      setFormData({
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        type: product.type,
        isActive: product.isActive,
        images: product.images,
        pieces: [],
        ...cookieData,
      });
    } else {
      setFormData({
        name: "",
        slug: "",
        description: "",
        price: 150,
        type: "cookie",
        isActive: true,
        images: [],
        flavour: "",
        allergens: [],
        pieces: [],
        isNew: true,
        isSoldOut: false,
      });
    }
  }, [product, isOpen]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
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
        setFormData((prev) => ({ ...prev, images: [result.url] }));
      } else {
        alert(result.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E8D5C0] p-4 sm:p-6">
          <h2 className="text-lg font-bold text-[#2C1810]">
            {product ? t("admin.products.form.editTitle") : t("admin.products.form.addTitle")}
          </h2>
          <button onClick={onClose} className="rounded-lg p-2 transition-colors hover:bg-[#F0E6D6]">
            <XIcon className="h-5 w-5 text-[#A07850]" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(formData);
          }}
          className="space-y-4 p-4 sm:p-6"
        >
          {/* Image Upload */}
          <div>
            <label className="mb-2 block text-xs font-bold tracking-widest text-[#A07850] uppercase">
              {t("admin.products.form.productImage")}
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />

            <div className="flex gap-3">
              {/* Image preview tile */}
              {formData.images[0] && (
                <div className="group relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-[#F4538A]">
                  <img
                    src={formData.images[0]}
                    alt="Preview"
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-black/0 transition-colors duration-200 group-hover:bg-black/25" />
                  <span className="absolute bottom-1.5 left-1.5 rounded-full bg-[#F4538A] px-1.5 py-0.5 text-[10px] font-semibold text-white shadow">
                    Main
                  </span>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, images: [] }))}
                    className="absolute top-1.5 right-1.5 rounded-full bg-white/90 p-1 text-red-500 opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100"
                  >
                    <XIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Upload / Replace tile */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex h-32 flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#E8D5C0] transition-colors hover:border-[#F4538A] hover:bg-[#FFF0F5] disabled:opacity-50"
              >
                {isUploading ? (
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#F4538A] border-t-transparent" />
                ) : (
                  <>
                    <UploadIcon className="h-8 w-8 text-[#A07850]" />
                    <span className="text-sm text-[#A07850]">
                      {formData.images[0] ? "Replace image" : t("admin.products.form.uploadImage")}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold tracking-widest text-[#A07850] uppercase">
              {t("admin.products.form.nameLabel")} *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-2xl border-2 border-[#E8D5C0] bg-white px-4 py-3 text-[#2C1810] focus:border-[#F4538A] focus:ring-2 focus:ring-[#F4538A]/20 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-bold tracking-widest text-[#A07850] uppercase">
                Slug *
              </label>
              <input
                type="text"
                name="slug"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="product-slug"
                className="w-full rounded-2xl border-2 border-[#E8D5C0] bg-white px-4 py-3 text-[#2C1810] focus:border-[#F4538A] focus:ring-2 focus:ring-[#F4538A]/20 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold tracking-widest text-[#A07850] uppercase">
                {t("admin.products.form.priceLabel")} *
              </label>
              <input
                type="number"
                name="price"
                required
                min={0}
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full rounded-2xl border-2 border-[#E8D5C0] bg-white px-4 py-3 text-[#2C1810] focus:border-[#F4538A] focus:ring-2 focus:ring-[#F4538A]/20 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold tracking-widest text-[#A07850] uppercase">
              {t("admin.products.form.description")} *
            </label>
            <textarea
              name="description"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full resize-none rounded-2xl border-2 border-[#E8D5C0] bg-white px-4 py-3 text-[#2C1810] focus:border-[#F4538A] focus:ring-2 focus:ring-[#F4538A]/20 focus:outline-none"
 />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-bold tracking-widest text-[#A07850] uppercase">
                {t("admin.products.form.flavour")}
              </label>
              <input
                type="text"
                value={formData.flavour}
                onChange={(e) => setFormData({ ...formData, flavour: e.target.value })}
                className="w-full rounded-2xl border-2 border-[#E8D5C0] bg-white px-4 py-3 text-[#2C1810] focus:border-[#F4538A] focus:ring-2 focus:ring-[#F4538A]/20 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold tracking-widest text-[#A07850] uppercase">
                {t("admin.products.form.allergens")}
              </label>
              <input
                type="text"
                defaultValue={formData.allergens?.join(", ") || ""}
                onBlur={(e) => setFormData({ ...formData, allergens: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                placeholder={t("admin.products.form.allergensPlaceholder")}
                className="w-full rounded-2xl border-2 border-[#E8D5C0] bg-white px-4 py-3 text-[#2C1810] focus:border-[#F4538A] focus:ring-2 focus:ring-[#F4538A]/20 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-bold tracking-widest text-[#A07850] uppercase">
                {t("admin.products.form.typeLabel")} *
              </label>
              <Select
                value={formData.type}
                onChange={(value) => setFormData({ ...formData, type: value as "cookie" | "box" })}
                options={[
                  { value: "cookie", label: t("admin.products.form.cookie") },
                  { value: "box", label: t("admin.products.form.box") },
                ]}
                placeholder={t("admin.products.form.typeLabel")}
                size="md"
                variant="default"
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-[#E8D5C0] p-3 transition-colors hover:border-[#F4538A]/50">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-2 border-[#E8D5C0] text-[#F4538A] focus:ring-[#F4538A]"
                data-testid="product-toggle"
              />
              <span className="text-sm text-[#2C1810]">{t("admin.products.form.activeLabel")}</span>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-[#E8D5C0] p-3 transition-colors hover:border-[#F4538A]/50">
              <input
                type="checkbox"
                checked={formData.isNew}
                onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                className="h-4 w-4 rounded border-2 border-[#E8D5C0] text-[#F4538A] focus:ring-[#F4538A]"
              />
              <span className="text-sm text-[#2C1810]">{t("admin.products.form.markAsNew")}</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting || isUploading}
              className="flex-1 bg-[#F4538A] hover:bg-[#D63A72]"
              data-testid="save-product-button"
            >
              {product ? t("admin.products.form.save") : t("admin.products.form.create")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

type ProductFormData = {
  name: string;
  slug: string;
  description: string;
  price: number;
  type: "cookie" | "box";
  isActive: boolean;
  images: string[];
  flavour?: string;
  allergens?: string[];
  pieces?: any[];
  isNew?: boolean;
  isSoldOut?: boolean;
};

// Product Card Component for Mobile
function ProductCard({
  product,
  onEdit,
  onDelete,
  t,
}: {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
  t: (key: string) => string;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-[#E8D5C0] bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-[#F0E6D6]">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <PackageIcon className="h-6 w-6 text-[#A07850]" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-[#2C1810]">{product.name}</h3>
          <p className="text-lg font-bold text-[#F4538A]">
            {product.price} {t("common.currency")}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-[#F0E6D6] px-2 py-0.5 text-xs font-medium text-[#5C3D2E]">
              {product.type}
            </span>
            {product.isActive ? (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                {t("admin.products.active")}
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                {t("admin.products.inactive")}
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="line-clamp-2 text-sm text-[#A07850]">{product.description}</p>

      <div className="flex items-center justify-end gap-2 border-t border-[#F0E6D6] pt-2">
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 rounded-lg bg-[#F0E6D6] px-3 py-2 text-sm transition-colors hover:bg-[#E8D5C0]"
        >
          <PencilIcon className="h-4 w-4 text-[#5C3D2E]" />
          {t("common.edit")}
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-100"
        >
          <Trash2Icon className="h-4 w-4" />
          {t("common.delete")}
        </button>
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const t = useTranslations();
  const locale = useLocale();
  const isRTL = locale === 'ar';

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/admin/products");
        const result = await response.json();
        if (result.success) {
          setProducts(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedProducts = React.useMemo(() => {
    let filtered = products;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          (isCookiePiece(p) && p.flavour?.toLowerCase().includes(query))
      );
    }
    return [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "price":
          comparison = a.price - b.price;
          break;
        case "type":
          comparison = a.type.localeCompare(b.type);
          break;
        case "status":
          const statusA = a.isActive ? 1 : 0;
          const statusB = b.isActive ? 1 : 0;
          comparison = statusA - statusB;
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [products, sortField, sortDirection, searchQuery]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleSave = async (formData: ProductFormData) => {
    setIsSubmitting(true);
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      // Auto-generate slug if empty
      const dataToSend = {
        ...formData,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();
      if (result.success) {
        if (editingProduct) {
          setProducts(products.map((p) => (p.id === editingProduct.id ? result.data : p)));
        } else {
          setProducts([...products, result.data]);
        }
        setIsModalOpen(false);
        setEditingProduct(null);
      } else {
        alert(result.error || t("common.error"));
      }
    } catch (error) {
      console.error("Failed to save product:", error);
      alert(t("common.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("common.confirm"))) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (result.success) {
        setProducts(products.filter((p) => p.id !== id));
      } else {
        alert(result.error || t("common.error"));
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert(t("common.error"));
    }
  };

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      className="cursor-pointer px-3 py-3 text-left text-xs font-bold tracking-widest text-[#A07850] uppercase transition-colors hover:text-[#5C3D2E] sm:px-6"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field &&
          (sortDirection === "asc" ? (
            <ChevronUpIcon className="h-4 w-4" />
          ) : (
            <ChevronDownIcon className="h-4 w-4" />
          ))}
      </div>
    </th>
  );

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl text-[#2C1810]">{t("admin.products.title")}</h1>
          <p className="mt-1 text-[#A07850]">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="products-page" className="space-y-6 sm:space-y-8" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl text-[#2C1810] sm:text-3xl">
            {t("admin.products.title")}
          </h1>
          <p className="mt-1 text-[#A07850]">{t("admin.products.subtitle")}</p>
        </div>
        <Button onClick={handleCreate} className="cursor-pointer bg-[#F4538A] hover:bg-[#D63A72]" data-testid="add-product-button">
          <PlusIcon className="mr-2 h-4 w-4" />
          {t("admin.products.addProduct")}
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <SearchIcon className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[#A07850]" />
        <input
          type="text"
          placeholder={t("admin.products.search")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-2xl border-2 border-[#E8D5C0] bg-white py-3 pr-4 pl-12 text-[#2C1810] focus:border-[#F4538A] focus:ring-2 focus:ring-[#F4538A]/20 focus:outline-none"
        />
      </div>

      {/* Desktop Table */}
      <div className="hidden overflow-hidden rounded-3xl border border-[#E8D5C0] bg-white sm:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F0E6D6]/50">
              <tr>
                <SortHeader field="name">{t("admin.products.name")}</SortHeader>
                <SortHeader field="price">{t("admin.products.price")}</SortHeader>
                <SortHeader field="type">{t("admin.products.type")}</SortHeader>
                <SortHeader field="status">{t("admin.products.status")}</SortHeader>
                <th className="px-3 py-3 text-right text-xs font-bold tracking-widest text-[#A07850] uppercase sm:px-6">
                  {t("admin.products.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8D5C0]">
              {filteredAndSortedProducts.map((product) => (
                <tr key={product.id} className="transition-colors hover:bg-[#FFF0F5]/50">
                  <td className="px-3 py-3 sm:px-6 sm:py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-[#F0E6D6] sm:h-14 sm:w-14">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-[#A07850] sm:h-6 sm:w-6" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p data-testid="product-name" className="truncate text-sm font-medium text-[#2C1810] sm:text-base">
                          {product.name}
                        </p>
                        <p className="max-w-[150px] truncate text-xs text-[#A07850] sm:max-w-[200px]">
                          {product.description.slice(0, 40)}...
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-sm font-semibold text-[#2C1810] tabular-nums sm:px-6 sm:py-4 sm:text-base">
                    {product.price} {t("common.currency")}
                  </td>
                  <td className="px-3 py-3 sm:px-6 sm:py-4">
                    <span className="inline-flex items-center rounded-full bg-[#F0E6D6] px-2 py-0.5 text-xs font-medium text-[#5C3D2E] sm:px-2.5 sm:py-1">
                      {product.type}
                    </span>
                  </td>
                  <td className="px-3 py-3 sm:px-6 sm:py-4">
                    <button
                      onClick={() => handleEdit({ ...product, isActive: !product.isActive })}
                      className="cursor-pointer"
                      data-testid="product-toggle"
                      title={product.isActive ? t("admin.products.active") : t("admin.products.inactive")}
                    >
                      {product.isActive ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 sm:px-2.5 sm:py-1">
                          {t("admin.products.active")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 sm:px-2.5 sm:py-1">
                          {t("admin.products.inactive")}
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="px-3 py-3 sm:px-6 sm:py-4">
                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-[#F0E6D6]"
                        title={t("common.edit")}
                      >
                        <PencilIcon className="h-4 w-4 text-[#A07850]" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-red-50"
                        title={t("common.delete")}
                      >
                        <Trash2Icon className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredAndSortedProducts.length === 0 && (
          <div className="p-8 text-center text-[#A07850]">
            {searchQuery ? t("shop.noProducts") : t("admin.products.noProducts")}
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="space-y-3 sm:hidden">
        {filteredAndSortedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onEdit={() => handleEdit(product)}
            onDelete={() => handleDelete(product.id)}
            t={t}
          />
        ))}
        {filteredAndSortedProducts.length === 0 && (
          <div className="rounded-3xl border border-[#E8D5C0] bg-white p-8 text-center text-[#A07850]">
            {searchQuery ? t("shop.noProducts") : t("admin.products.noProducts")}
          </div>
        )}
      </div>

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        onSave={handleSave}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
