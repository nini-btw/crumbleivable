"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  PlusIcon,
  Trash2Icon,
  RotateCcwIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  XIcon,
  SparklesIcon,
  BarChart3Icon,
  TrophyIcon,
  CookieIcon,
} from "lucide-react";
import { Button } from "@/presentation/components/ui/Button";
import { Select } from "@/presentation/components/ui/Select";
import { ProductForm, type ProductFormData } from "@/presentation/components/features/ProductForm";
import type { Product } from "@/domain/entities/product";
import type { VoteCandidate } from "@/domain/entities/vote";
import { useTranslations, useLocale } from "next-intl";

// Progress Bar Component for Charts
function VoteProgressBar({
  candidate,
  totalVotes,
  maxVotes,
  rank,
  t,
}: {
  candidate: VoteCandidate;
  totalVotes: number;
  maxVotes: number;
  rank?: number;
  t: (key: string) => string;
}) {
  const percentage = totalVotes > 0 ? Math.round((candidate.voteCount / totalVotes) * 100) : 0;
  const barWidth = maxVotes > 0 ? (candidate.voteCount / maxVotes) * 100 : 0;

  const rankColors = ["bg-yellow-400", "bg-gray-400", "bg-amber-600"];

  return (
    <div className="mb-4">
      <div className="mb-1 flex justify-between text-sm">
        <div className="flex items-center gap-2">
          {rank && rank <= 3 && (
            <span
              className={`h-5 w-5 rounded-full ${rankColors[rank - 1]} flex items-center justify-center text-xs font-bold text-white`}
            >
              {rank}
            </span>
          )}
          <span className="font-medium text-[#2C1810]">{candidate.cookieName}</span>
        </div>
        <span className="text-[#A07850]">
          {candidate.voteCount} {t("vote.votes")} ({percentage}%)
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-[#F0E6D6]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#F4538A] to-[#F4538A]/70 transition-all duration-500"
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
  t,
}: {
  candidate: VoteCandidate;
  rank?: number;
  totalVotes: number;
  onDelete: () => void;
  t: (key: string) => string;
}) {
  const percentage = totalVotes > 0 ? Math.round((candidate.voteCount / totalVotes) * 100) : 0;
  const rankColors = [
    "bg-yellow-100 text-yellow-800 border-yellow-300",
    "bg-gray-100 text-gray-800 border-gray-300",
    "bg-amber-100 text-amber-800 border-amber-300",
  ];

  return (
    <div className="space-y-3 rounded-2xl border border-[#E8D5C0] bg-white p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {rank && rank <= 3 ? (
            <span
              className={`rounded-full border px-2 py-0.5 text-xs font-bold ${rankColors[rank - 1]}`}
            >
              #{rank}
            </span>
          ) : (
            <span className="rounded-full bg-[#F0E6D6] px-2 py-0.5 text-xs font-medium text-[#5C3D2E]">
              #{rank || "-"}
            </span>
          )}
          <h3 className="font-semibold text-[#2C1810]">{candidate.cookieName}</h3>
        </div>
        <button onClick={onDelete} className="rounded-lg p-2 transition-colors hover:bg-red-50">
          <Trash2Icon className="h-4 w-4 text-red-400" />
        </button>
      </div>

      <p className="line-clamp-2 text-sm text-[#A07850]">{candidate.description}</p>

      <div className="flex items-center justify-between border-t border-[#F0E6D6] pt-2">
        <div className="flex items-center gap-2">
          <CookieIcon className="h-4 w-4 text-[#F4538A]" />
          <span className="font-bold text-[#F4538A]">
            {candidate.voteCount} {t("vote.votes")}
          </span>
        </div>
        <span className="text-sm text-[#A07850]">
          {percentage}% {t("admin.votes.totalVotes")}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-[#F0E6D6]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#F4538A] to-[#F4538A]/70"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Quick Add Product Modal - Uses shared ProductForm
type QuickAddModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated: (product: Product) => void;
  t: (key: string) => string;
};

function QuickAddProductModal({ isOpen, onClose, onProductCreated, t }: QuickAddModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (formData: ProductFormData) => {
    setIsSubmitting(true);
    try {
      const productData = {
        ...formData,
        slug: formData.name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
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
          <h2 className="text-lg font-bold text-[#2C1810]">{t("admin.products.form.addTitle")}</h2>
          <button onClick={onClose} className="rounded-lg p-2 transition-colors hover:bg-[#F0E6D6]">
            <XIcon className="h-5 w-5 text-[#A07850]" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <ProductForm
            onSubmit={handleSubmit}
            onCancel={onClose}
            isSubmitting={isSubmitting}
            mode="vote"
            t={t}
          />
        </div>
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
  const t = useTranslations();
  const locale = useLocale();
  const isRTL = locale === "ar";

  useEffect(() => {
    async function fetchData() {
      try {
        const [candidatesRes, productsRes] = await Promise.all([
          fetch("/api/votes"),
          fetch("/api/admin/products"),
        ]);

        const candidatesData = await candidatesRes.json();
        const productsData = await productsRes.json();

        if (candidatesData.success) setCandidates(candidatesData.data);
        // Filter to only cookies for the dropdown
        if (productsData.success) setProducts(productsData.data.filter((p: Product) => p.type === "cookie"));
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
  const maxVotes = Math.max(...candidates.map((c) => c.voteCount), 0);

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
        alert(result.error || t("admin.common.error"));
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

        const productsRes = await fetch("/api/admin/products");
        const productsData = await productsRes.json();
        if (productsData.success) {
          // Filter to only cookies for the dropdown
          setProducts(productsData.data.filter((p: Product) => p.type === "cookie"));
        }

        const statusText = product.isActive
          ? t("admin.products.active")
          : t("admin.products.inactive");
        alert(`"${product.name}" ${t("admin.votes.quickAdd.step1")}\n${statusText}`);
      }
    } catch (error) {
      console.error("Failed to add candidate:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("admin.votes.deleteConfirm"))) return;

    try {
      const response = await fetch(`/api/votes/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (result.success) {
        setCandidates(candidates.filter((c) => c.id !== id));
      } else {
        alert(result.error || t("admin.common.error"));
      }
    } catch (error) {
      console.error("Failed to delete candidate:", error);
      alert(t("admin.common.error"));
    }
  };

  const handleReset = async () => {
    if (!confirm(t("admin.votes.resetConfirm"))) return;

    try {
      const response = await fetch("/api/votes/reset", { method: "POST" });
      const result = await response.json();
      if (result.success) {
        setCandidates(candidates.map((c) => ({ ...c, voteCount: 0 })));
      } else {
        alert(result.error || t("admin.common.error"));
      }
    } catch (error) {
      console.error("Failed to reset votes:", error);
      alert(t("admin.common.error"));
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
          <h1 className="font-display text-3xl text-[#2C1810]">{t("admin.votes.title")}</h1>
          <p className="mt-1 text-[#A07850]">{t("common.loading")}</p>
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
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl text-[#2C1810] sm:text-3xl">
            {t("admin.votes.title")}
          </h1>
          <p className="mt-1 text-[#A07850]">{t("admin.votes.subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => setShowChart(!showChart)}
            className="cursor-pointer"
          >
            <BarChart3Icon className="mr-2 h-4 w-4" />
            {showChart ? t("admin.votes.hideChart") : t("admin.votes.showChart")}
          </Button>
          <Button
            variant="ghost"
            onClick={handleReset}
            className="cursor-pointer text-red-500 hover:bg-red-50"
          >
            <RotateCcwIcon className="mr-2 h-4 w-4" />
            {t("admin.votes.reset")}
          </Button>
        </div>
      </div>

      {/* Vote Chart */}
      {showChart && candidates.length > 0 && (
        <div className="rounded-3xl border border-[#E8D5C0] bg-white p-4 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <TrophyIcon className="h-5 w-5 text-[#F4538A]" />
            <h2 className="text-lg font-bold text-[#2C1810]">
              {t("admin.votes.voteResults")} ({totalVotes.toLocaleString()}{" "}
              {t("admin.votes.totalVotes")})
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
      <div className="rounded-3xl border border-[#E8D5C0] bg-white p-4 sm:p-6">
        <h2 className="mb-4 text-lg font-bold text-[#2C1810]">{t("admin.votes.addFromProduct")}</h2>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Select
            value={selectedProduct}
            onChange={setSelectedProduct}
            options={availableProducts.map((product) => ({
              value: product.id,
              label: product.name,
            }))}
            placeholder={t("admin.votes.selectCookie")}
            size="md"
            variant="default"
            className="flex-1"
          />
          <Button
            onClick={handleAddFromProduct}
            disabled={!selectedProduct}
            className="cursor-pointer bg-[#F4538A] whitespace-nowrap hover:bg-[#D63A72]"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            {t("admin.votes.addToVote")}
          </Button>
        </div>
      </div>

      {/* Quick Add New Cookie */}
      <div className="rounded-3xl border border-[#F4538A]/20 bg-gradient-to-r from-[#F4538A]/10 to-[#F4538A]/5 p-4 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#2C1810]">
              <SparklesIcon className="h-5 w-5 text-[#F4538A]" />
              {t("admin.votes.quickAdd.title")}
            </h2>
            <p className="mt-1 text-sm text-[#A07850]">{t("admin.votes.quickAdd.subtitle")}</p>
          </div>
          <Button
            onClick={() => setIsQuickAddOpen(true)}
            className="cursor-pointer bg-[#F4538A] whitespace-nowrap hover:bg-[#D63A72]"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            {t("admin.votes.quickAdd.button")}
          </Button>
        </div>
      </div>

      {/* Candidates Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#2C1810]">{t("admin.votes.candidates")}</h2>

        {/* Desktop Table */}
        <div className="hidden overflow-hidden rounded-3xl border border-[#E8D5C0] bg-white sm:block">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F0E6D6]/50">
                <tr>
                  <SortHeader field="name">{t("admin.votes.cookie")}</SortHeader>
                  <SortHeader field="votes">{t("admin.votes.votes")}</SortHeader>
                  <th className="px-3 py-3 text-right text-xs font-bold tracking-widest text-[#A07850] uppercase sm:px-6">
                    {t("admin.products.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8D5C0]">
                {sortedCandidates.map((candidate) => {
                  const percentage =
                    totalVotes > 0 ? Math.round((candidate.voteCount / totalVotes) * 100) : 0;
                  return (
                    <tr key={candidate.id} className="transition-colors hover:bg-[#FFF0F5]/50">
                      <td className="px-3 py-3 sm:px-6 sm:py-4">
                        <div>
                          <p className="text-sm font-medium text-[#2C1810] sm:text-base">
                            {candidate.cookieName}
                          </p>
                          <p className="hidden text-xs text-[#A07850] sm:block">
                            {candidate.description.slice(0, 50)}...
                          </p>
                        </div>
                      </td>
                      <td className="px-3 py-3 sm:px-6 sm:py-4">
                        <div>
                          <span className="inline-flex items-center rounded-full bg-[#F4538A]/10 px-2 py-0.5 text-xs font-medium text-[#F4538A] tabular-nums sm:px-2.5 sm:py-1">
                            {candidate.voteCount}
                          </span>
                          <span className="ml-2 text-xs text-[#A07850]">({percentage}%)</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 sm:px-6 sm:py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDelete(candidate.id)}
                            className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-red-50"
                            title={t("common.delete")}
                          >
                            <Trash2Icon className="h-4 w-4 text-red-400" />
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
            <div className="p-8 text-center text-[#A07850]">{t("admin.votes.noCandidates")}</div>
          )}
        </div>

        {/* Mobile Cards */}
        <div className="space-y-3 sm:hidden">
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
            <div className="rounded-3xl border border-[#E8D5C0] bg-white p-8 text-center text-[#A07850]">
              {t("admin.votes.noCandidates")}
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
