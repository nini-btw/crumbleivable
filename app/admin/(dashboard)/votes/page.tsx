"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { PlusIcon, Trash2Icon, RotateCcwIcon, ChevronUpIcon, ChevronDownIcon, XIcon, SparklesIcon, BarChart3Icon, TrophyIcon, CookieIcon, UploadIcon } from "lucide-react";
import { Button } from "@/presentation/components/ui/Button";
import { Select } from "@/presentation/components/ui/Select";
import type { Product, CookiePiece } from "@/domain/entities/product";
import type { VoteCandidate } from "@/domain/entities/vote";
import { useTranslation } from "@/src/presentation/lib/i18n/useTranslation";

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

// Progress Bar Component for Charts
function VoteProgressBar({ candidate, totalVotes, maxVotes, rank, t }: { candidate: VoteCandidate; totalVotes: number; maxVotes: number; rank?: number; t: (key: string) => string }) {
  const percentage = totalVotes > 0 ? Math.round((candidate.voteCount / totalVotes) * 100) : 0;
  const barWidth = maxVotes > 0 ? (candidate.voteCount / maxVotes) * 100 : 0;
  
  const rankColors = ["bg-yellow-400", "bg-gray-400", "bg-amber-600"];
  
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <div className="flex items-center gap-2">
          {rank && rank <= 3 && (
            <span className={`w-5 h-5 rounded-full ${rankColors[rank-1]} text-white text-xs flex items-center justify-center font-bold`}>
              {rank}
            </span>
          )}
          <span className="font-medium text-[#2C1810]">{candidate.cookieName}</span>
        </div>
        <span className="text-[#A07850]">{candidate.voteCount} {t('vote.votes')} ({percentage}%)</span>
      </div>
      <div className="h-3 bg-[#F0E6D6] rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#F4538A] to-[#F4538A]/70 rounded-full transition-all duration-500"
          style={{ width: `${barWidth}%` }}
        />
      </div>
    </div>
  );
}

// Vote Card Component for Mobile
function VoteCard({ 
  candidate, 
  rank, 
  totalVotes, 
  onDelete,
  t
}: { 
  candidate: VoteCandidate; 
  rank?: number;
  totalVotes: number;
  onDelete: () => void;
  t: (key: string) => string;
}) {
  const percentage = totalVotes > 0 ? Math.round((candidate.voteCount / totalVotes) * 100) : 0;
  const rankColors = ["bg-yellow-100 text-yellow-800 border-yellow-300", "bg-gray-100 text-gray-800 border-gray-300", "bg-amber-100 text-amber-800 border-amber-300"];
  
  return (
    <div className="bg-white border border-[#E8D5C0] rounded-2xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {rank && rank <= 3 ? (
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${rankColors[rank-1]}`}>
              #{rank}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#F0E6D6] text-[#5C3D2E]">
              #{rank || "-"}
            </span>
          )}
          <h3 className="font-semibold text-[#2C1810]">{candidate.cookieName}</h3>
        </div>
        <button
          onClick={onDelete}
          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2Icon className="w-4 h-4 text-red-400" />
        </button>
      </div>
      
      <p className="text-sm text-[#A07850] line-clamp-2">{candidate.description}</p>
      
      <div className="flex items-center justify-between pt-2 border-t border-[#F0E6D6]">
        <div className="flex items-center gap-2">
          <CookieIcon className="w-4 h-4 text-[#F4538A]" />
          <span className="font-bold text-[#F4538A]">{candidate.voteCount} {t('vote.votes')}</span>
        </div>
        <span className="text-sm text-[#A07850]">{percentage}% {t('admin.votes.totalVotes')}</span>
      </div>
      
      <div className="h-2 bg-[#F0E6D6] rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#F4538A] to-[#F4538A]/70 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Quick Add Product Modal Component - Uses same form as products page
function QuickAddProductModal({
  isOpen,
  onClose,
  onProductCreated,
  t,
}: {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated: (product: Product) => void;
  t: (key: string) => string;
}) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    slug: "",
    description: "",
    price: 150,
    type: "cookie",
    isActive: false, // Inactive by default for vote candidates
    images: [],
    flavour: "",
    allergens: [],
    pieces: [],
    isNew: true,
    isSoldOut: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        slug: "",
        description: "",
        price: 150,
        type: "cookie",
        isActive: false, // Inactive by default
        images: [],
        flavour: "",
        allergens: [],
        pieces: [],
        isNew: true,
        isSoldOut: false,
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const productData = {
        ...formData,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      };

      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      const result = await response.json();
      if (result.success) {
        onProductCreated(result.data);
        onClose();
      } else {
        alert(result.error || t("common.error"));
      }
    } catch (error) {
      console.error("Failed to create product:", error);
      alert(t("common.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E8D5C0] p-4 sm:p-6">
          <h2 className="text-lg font-bold text-[#2C1810]">
            {t("admin.products.form.addTitle")}
          </h2>
          <button onClick={onClose} className="rounded-lg p-2 transition-colors hover:bg-[#F0E6D6]">
            <XIcon className="h-5 w-5 text-[#A07850]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-4 sm:p-6">
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-bold tracking-widest text-[#A07850] uppercase">
                {t("admin.products.form.nameLabel")} *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-2xl border-2 border-[#E8D5C0] bg-white px-4 py-3 text-[#2C1810] focus:border-[#F4538A] focus:ring-2 focus:ring-[#F4538A]/20 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold tracking-widest text-[#A07850] uppercase">
                {t("admin.products.form.priceLabel")} *
              </label>
              <input
                type="number"
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

          <div className="bg-[#FFF0F5] rounded-xl p-3 text-sm text-[#5C3D2E]">
            <p className="font-medium mb-1">{t("admin.votes.quickAdd.whatHappens")}</p>
            <ul className="list-disc list-inside space-y-1">
              <li>{t("admin.votes.quickAdd.step1")}</li>
              <li>{t("admin.votes.quickAdd.step2")}</li>
              <li>{formData.isActive ? t("admin.votes.quickAdd.step3Active") : t("admin.votes.quickAdd.step3Inactive")}</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting || isUploading}
              className="flex-1 bg-[#F4538A] hover:bg-[#D63A72]"
            >
              {t("admin.products.form.create")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

type SortField = "name" | "votes";
type SortDirection = "asc" | "desc";

export default function AdminVotesPage() {
  const [candidates, setCandidates] = useState<VoteCandidate[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [sortField, setSortField] = useState<SortField>("votes");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [showChart, setShowChart] = useState(true);
  const { t, isRTL } = useTranslation();

  useEffect(() => {
    async function fetchData() {
      try {
        const [candidatesRes, productsRes] = await Promise.all([
          fetch("/api/votes"),
          fetch("/api/products/cookies"),
        ]);

        const candidatesData = await candidatesRes.json();
        const productsData = await productsRes.json();

        if (candidatesData.success) setCandidates(candidatesData.data);
        if (productsData.success) setProducts(productsData.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedCandidates = React.useMemo(() => {
    return [...candidates].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "name":
          comparison = a.cookieName.localeCompare(b.cookieName);
          break;
        case "votes":
          comparison = a.voteCount - b.voteCount;
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [candidates, sortField, sortDirection]);

  const totalVotes = candidates.reduce((sum, c) => sum + c.voteCount, 0);
  const maxVotes = Math.max(...candidates.map(c => c.voteCount), 0);

  const handleAddFromProduct = async () => {
    if (!selectedProduct) return;

    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    try {
      const response = await fetch("/api/votes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cookieName: product.name,
          description: product.description,
          imageUrl: product.images[0] || "/images/box1.png",
          isActive: true,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setCandidates([...candidates, result.data]);
        setSelectedProduct("");
      } else {
        alert(result.error || t('admin.common.error'));
      }
    } catch (error) {
      console.error("Failed to add candidate:", error);
    }
  };

  const handleProductCreated = async (product: Product) => {
    try {
      const response = await fetch("/api/votes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cookieName: product.name,
          description: product.description,
          imageUrl: product.images[0] || "/images/box1.png",
          isActive: true,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setCandidates([...candidates, result.data]);
        
        const productsRes = await fetch("/api/products/cookies");
        const productsData = await productsRes.json();
        if (productsData.success) {
          setProducts(productsData.data);
        }
        
        const statusText = product.isActive ? t('admin.products.active') : t('admin.products.inactive');
        alert(`"${product.name}" ${t('admin.votes.quickAdd.step1')}\n${statusText}`);
      }
    } catch (error) {
      console.error("Failed to add candidate:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.votes.deleteConfirm'))) return;

    try {
      const response = await fetch(`/api/votes/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (result.success) {
        setCandidates(candidates.filter((c) => c.id !== id));
      } else {
        alert(result.error || t('admin.common.error'));
      }
    } catch (error) {
      console.error("Failed to delete candidate:", error);
      alert(t('admin.common.error'));
    }
  };

  const handleReset = async () => {
    if (!confirm(t('admin.votes.resetConfirm'))) return;

    try {
      const response = await fetch("/api/votes/reset", { method: "POST" });
      const result = await response.json();
      if (result.success) {
        setCandidates(candidates.map((c) => ({ ...c, voteCount: 0 })));
      } else {
        alert(result.error || t('admin.common.error'));
      }
    } catch (error) {
      console.error("Failed to reset votes:", error);
      alert(t('admin.common.error'));
    }
  };

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      className="px-3 sm:px-6 py-3 text-left text-xs font-bold uppercase tracking-widest text-[#A07850] cursor-pointer hover:text-[#5C3D2E] transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field &&
          (sortDirection === "asc" ? (
            <ChevronUpIcon className="w-4 h-4" />
          ) : (
            <ChevronDownIcon className="w-4 h-4" />
          ))}
      </div>
    </th>
  );

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl text-[#2C1810]">{t('admin.votes.title')}</h1>
          <p className="text-[#A07850] mt-1">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  const availableProducts = products.filter(
    (p) => !candidates.some((c) => c.cookieName === p.name)
  );

  return (
    <div className="space-y-6 sm:space-y-8" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-[#2C1810]">{t('admin.votes.title')}</h1>
          <p className="text-[#A07850] mt-1">{t('admin.votes.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => setShowChart(!showChart)}
            className="cursor-pointer"
          >
            <BarChart3Icon className="w-4 h-4 mr-2" />
            {showChart ? t('admin.votes.hideChart') : t('admin.votes.showChart')}
          </Button>
          <Button
            variant="ghost"
            onClick={handleReset}
            className="cursor-pointer text-red-500 hover:bg-red-50"
          >
            <RotateCcwIcon className="w-4 h-4 mr-2" />
            {t('admin.votes.reset')}
          </Button>
        </div>
      </div>

      {/* Vote Chart */}
      {showChart && candidates.length > 0 && (
        <div className="bg-white rounded-3xl border border-[#E8D5C0] p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrophyIcon className="w-5 h-5 text-[#F4538A]" />
            <h2 className="font-bold text-[#2C1810] text-lg">
              {t('admin.votes.voteResults')} ({totalVotes.toLocaleString()} {t('admin.votes.totalVotes')})
            </h2>
          </div>
          <div className="space-y-2">
            {sortedCandidates.slice(0, 5).map((candidate, index) => (
              <VoteProgressBar 
                key={candidate.id} 
                candidate={candidate} 
                totalVotes={totalVotes}
                maxVotes={maxVotes}
                rank={index + 1}
                t={t}
              />
            ))}
          </div>
        </div>
      )}

      {/* Add From Existing Products */}
      <div className="bg-white rounded-3xl border border-[#E8D5C0] p-4 sm:p-6">
        <h2 className="font-bold text-[#2C1810] text-lg mb-4">{t('admin.votes.addFromProduct')}</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <Select
            value={selectedProduct}
            onChange={setSelectedProduct}
            options={availableProducts.map((product) => ({
              value: product.id,
              label: product.name,
            }))}
            placeholder={t('admin.votes.selectCookie')}
            size="md"
            variant="default"
            className="flex-1"
          />
          <Button
            onClick={handleAddFromProduct}
            disabled={!selectedProduct}
            className="cursor-pointer bg-[#F4538A] hover:bg-[#D63A72] whitespace-nowrap"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            {t('admin.votes.addToVote')}
          </Button>
        </div>
      </div>

      {/* Quick Add New Cookie */}
      <div className="bg-gradient-to-r from-[#F4538A]/10 to-[#F4538A]/5 rounded-3xl border border-[#F4538A]/20 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-[#2C1810] text-lg flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-[#F4538A]" />
              {t('admin.votes.quickAdd.title')}
            </h2>
            <p className="text-[#A07850] text-sm mt-1">
              {t('admin.votes.quickAdd.subtitle')}
            </p>
          </div>
          <Button
            onClick={() => setIsQuickAddOpen(true)}
            className="cursor-pointer bg-[#F4538A] hover:bg-[#D63A72] whitespace-nowrap"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            {t('admin.votes.quickAdd.button')}
          </Button>
        </div>
      </div>

      {/* Candidates Section */}
      <div className="space-y-4">
        <h2 className="font-bold text-[#2C1810] text-lg">{t('admin.votes.candidates')}</h2>
        
        {/* Desktop Table */}
        <div className="hidden sm:block bg-white rounded-3xl border border-[#E8D5C0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F0E6D6]/50">
                <tr>
                  <SortHeader field="name">{t('admin.votes.cookie')}</SortHeader>
                  <SortHeader field="votes">{t('admin.votes.votes')}</SortHeader>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-bold uppercase tracking-widest text-[#A07850]">
                    {t('admin.products.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8D5C0]">
                {sortedCandidates.map((candidate) => {
                  const percentage = totalVotes > 0 ? Math.round((candidate.voteCount / totalVotes) * 100) : 0;
                  return (
                    <tr key={candidate.id} className="hover:bg-[#FFF0F5]/50 transition-colors">
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div>
                          <p className="font-medium text-[#2C1810] text-sm sm:text-base">{candidate.cookieName}</p>
                          <p className="text-xs text-[#A07850] hidden sm:block">{candidate.description.slice(0, 50)}...</p>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div>
                          <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium bg-[#F4538A]/10 text-[#F4538A] tabular-nums">
                            {candidate.voteCount}
                          </span>
                          <span className="text-xs text-[#A07850] ml-2">({percentage}%)</span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDelete(candidate.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title={t('common.delete')}
                          >
                            <Trash2Icon className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {candidates.length === 0 && (
            <div className="p-8 text-center text-[#A07850]">
              {t('admin.votes.noCandidates')}
            </div>
          )}
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden space-y-3">
          {sortedCandidates.map((candidate, index) => (
            <VoteCard
              key={candidate.id}
              candidate={candidate}
              rank={index + 1}
              totalVotes={totalVotes}
              onDelete={() => handleDelete(candidate.id)}
              t={t}
            />
          ))}
          {candidates.length === 0 && (
            <div className="p-8 text-center text-[#A07850] bg-white rounded-3xl border border-[#E8D5C0]">
              {t('admin.votes.noCandidates')}
            </div>
          )}
        </div>
      </div>

      {/* Quick Add Modal */}
      <QuickAddProductModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onProductCreated={handleProductCreated}
        t={t}
      />
    </div>
  );
}
