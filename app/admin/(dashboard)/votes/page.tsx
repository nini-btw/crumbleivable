"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { PlusIcon, Trash2Icon, RotateCcwIcon, ChevronUpIcon, ChevronDownIcon, XIcon, SparklesIcon, BarChart3Icon, TrophyIcon, CookieIcon } from "lucide-react";
import { Button } from "@/presentation/components/ui/Button";
import type { Product, CookiePiece } from "@/domain/entities/product";
import type { VoteCandidate } from "@/domain/entities/vote";

// Progress Bar Component for Charts
function VoteProgressBar({ candidate, totalVotes, maxVotes, rank }: { candidate: VoteCandidate; totalVotes: number; maxVotes: number; rank?: number }) {
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
        <span className="text-[#A07850]">{candidate.voteCount} votes ({percentage}%)</span>
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
  onDelete 
}: { 
  candidate: VoteCandidate; 
  rank?: number;
  totalVotes: number;
  onDelete: () => void;
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
          <span className="font-bold text-[#F4538A]">{candidate.voteCount} votes</span>
        </div>
        <span className="text-sm text-[#A07850]">{percentage}% of total</span>
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

// Quick Add Product Modal Component
function QuickAddProductModal({
  isOpen,
  onClose,
  onProductCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated: (product: Product) => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: 150,
    flavour: "",
    allergens: "",
    isNew: true,
    isSoldOut: false,
    isActive: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const productData = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
        description: formData.description,
        price: Number(formData.price),
        type: "cookie" as const,
        isActive: formData.isActive,
        images: [],
        flavour: formData.flavour,
        allergens: formData.allergens.split(",").map((s) => s.trim()).filter(Boolean),
        isNew: formData.isNew,
        isSoldOut: formData.isSoldOut,
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
        setFormData({
          name: "",
          slug: "",
          description: "",
          price: 150,
          flavour: "",
          allergens: "",
          isNew: true,
          isSoldOut: false,
          isActive: false,
        });
      } else {
        alert(result.error || "Failed to create product");
      }
    } catch (error) {
      console.error("Failed to create product:", error);
      alert("Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-[#E8D5C0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-[#F4538A]" />
            <h2 className="text-lg font-bold text-[#2C1810]">Quick Add Cookie for Vote</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F0E6D6] rounded-lg transition-colors">
            <XIcon className="w-5 h-5 text-[#A07850]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-[#A07850] block mb-2">
              Cookie Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-white border-2 border-[#E8D5C0] rounded-2xl px-4 py-3 text-[#2C1810] focus:outline-none focus:border-[#F4538A] focus:ring-2 focus:ring-[#F4538A]/20"
              placeholder="e.g., Lemon Lavender"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-[#A07850] block mb-2">
              Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full bg-white border-2 border-[#E8D5C0] rounded-2xl px-4 py-3 text-[#2C1810] focus:outline-none focus:border-[#F4538A] focus:ring-2 focus:ring-[#F4538A]/20 resize-none"
              placeholder="Describe this cookie flavor..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-[#A07850] block mb-2">
                Price (DA)
              </label>
              <input
                type="number"
                min={0}
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full bg-white border-2 border-[#E8D5C0] rounded-2xl px-4 py-3 text-[#2C1810] focus:outline-none focus:border-[#F4538A] focus:ring-2 focus:ring-[#F4538A]/20"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-[#A07850] block mb-2">
                Flavour
              </label>
              <input
                type="text"
                value={formData.flavour}
                onChange={(e) => setFormData({ ...formData, flavour: e.target.value })}
                className="w-full bg-white border-2 border-[#E8D5C0] rounded-2xl px-4 py-3 text-[#2C1810] focus:outline-none focus:border-[#F4538A] focus:ring-2 focus:ring-[#F4538A]/20"
                placeholder="e.g., Lemon"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-[#A07850] block mb-2">
              Allergens (comma-separated)
            </label>
            <input
              type="text"
              value={formData.allergens}
              onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
              className="w-full bg-white border-2 border-[#E8D5C0] rounded-2xl px-4 py-3 text-[#2C1810] focus:outline-none focus:border-[#F4538A] focus:ring-2 focus:ring-[#F4538A]/20"
              placeholder="e.g., gluten, dairy, eggs"
            />
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isNew}
                onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                className="w-4 h-4 rounded border-2 border-[#E8D5C0] text-[#F4538A] focus:ring-[#F4538A]"
              />
              <span className="text-sm text-[#2C1810]">Mark as New</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-2 border-[#E8D5C0] text-[#F4538A] focus:ring-[#F4538A]"
              />
              <span className="text-sm text-[#2C1810]">Active (visible in shop)</span>
            </label>
          </div>

          <div className="bg-[#FFF0F5] rounded-xl p-3 text-sm text-[#5C3D2E]">
            <p className="font-medium mb-1">What happens next:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Product created and added to Products list</li>
              <li>Automatically added to Vote list</li>
              <li>{formData.isActive ? "Will be visible in shop immediately" : "Will be hidden from shop until activated"}</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="flex-1 bg-[#F4538A] hover:bg-[#D63A72]"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Create & Add to Vote
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
        alert(result.error || "Failed to add candidate");
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
        
        const statusText = product.isActive ? "active" : "inactive";
        alert(`"${product.name}" has been:\n1. Created as a ${statusText} product\n2. Added to the vote list\n\n${product.isActive ? 'It will appear in the shop immediately.' : 'It will NOT appear in the shop until activated.'}`);
      }
    } catch (error) {
      console.error("Failed to add candidate:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this candidate?")) return;

    try {
      const response = await fetch(`/api/votes/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (result.success) {
        setCandidates(candidates.filter((c) => c.id !== id));
      } else {
        alert(result.error || "Failed to delete candidate");
      }
    } catch (error) {
      console.error("Failed to delete candidate:", error);
      alert("Failed to delete candidate");
    }
  };

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset all votes?")) return;

    try {
      const response = await fetch("/api/votes/reset", { method: "POST" });
      const result = await response.json();
      if (result.success) {
        setCandidates(candidates.map((c) => ({ ...c, voteCount: 0 })));
      } else {
        alert(result.error || "Failed to reset votes");
      }
    } catch (error) {
      console.error("Failed to reset votes:", error);
      alert("Failed to reset votes");
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
          <h1 className="font-display text-3xl text-[#2C1810]">Vote Management</h1>
          <p className="text-[#A07850] mt-1">Loading...</p>
        </div>
      </div>
    );
  }

  const availableProducts = products.filter(
    (p) => !candidates.some((c) => c.cookieName === p.name)
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-[#2C1810]">Vote Management</h1>
          <p className="text-[#A07850] mt-1">Manage community vote candidates</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => setShowChart(!showChart)}
            className="cursor-pointer"
          >
            <BarChart3Icon className="w-4 h-4 mr-2" />
            {showChart ? 'Hide Chart' : 'Show Chart'}
          </Button>
          <Button
            variant="ghost"
            onClick={handleReset}
            className="cursor-pointer text-red-500 hover:bg-red-50"
          >
            <RotateCcwIcon className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Vote Chart */}
      {showChart && candidates.length > 0 && (
        <div className="bg-white rounded-3xl border border-[#E8D5C0] p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrophyIcon className="w-5 h-5 text-[#F4538A]" />
            <h2 className="font-bold text-[#2C1810] text-lg">
              Vote Results ({totalVotes.toLocaleString()} total votes)
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
              />
            ))}
          </div>
        </div>
      )}

      {/* Add From Existing Products */}
      <div className="bg-white rounded-3xl border border-[#E8D5C0] p-4 sm:p-6">
        <h2 className="font-bold text-[#2C1810] text-lg mb-4">Add from Existing Products</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="flex-1 bg-white border-2 border-[#E8D5C0] rounded-2xl px-4 py-3 text-[#2C1810] focus:outline-none focus:border-[#F4538A] focus:ring-2 focus:ring-[#F4538A]/20 cursor-pointer appearance-none text-sm sm:text-base"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235C3D2E' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 16px center",
            }}
          >
            <option value="">Select a cookie...</option>
            {availableProducts.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
          <Button
            onClick={handleAddFromProduct}
            disabled={!selectedProduct}
            className="cursor-pointer bg-[#F4538A] hover:bg-[#D63A72] whitespace-nowrap"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add to Vote
          </Button>
        </div>
      </div>

      {/* Quick Add New Cookie */}
      <div className="bg-gradient-to-r from-[#F4538A]/10 to-[#F4538A]/5 rounded-3xl border border-[#F4538A]/20 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-[#2C1810] text-lg flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-[#F4538A]" />
              Quick Add New Cookie
            </h2>
            <p className="text-[#A07850] text-sm mt-1">
              Create a new cookie and add it to vote instantly
            </p>
          </div>
          <Button
            onClick={() => setIsQuickAddOpen(true)}
            className="cursor-pointer bg-[#F4538A] hover:bg-[#D63A72] whitespace-nowrap"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Quick Add Cookie
          </Button>
        </div>
      </div>

      {/* Candidates Section */}
      <div className="space-y-4">
        <h2 className="font-bold text-[#2C1810] text-lg">Vote Candidates</h2>
        
        {/* Desktop Table */}
        <div className="hidden sm:block bg-white rounded-3xl border border-[#E8D5C0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F0E6D6]/50">
                <tr>
                  <SortHeader field="name">Cookie</SortHeader>
                  <SortHeader field="votes">Votes</SortHeader>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-bold uppercase tracking-widest text-[#A07850]">
                    Actions
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
                            title="Delete"
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
              No vote candidates yet. Add some!
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
            />
          ))}
          {candidates.length === 0 && (
            <div className="p-8 text-center text-[#A07850] bg-white rounded-3xl border border-[#E8D5C0]">
              No vote candidates yet. Add some!
            </div>
          )}
        </div>
      </div>

      {/* Quick Add Modal */}
      <QuickAddProductModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onProductCreated={handleProductCreated}
      />
    </div>
  );
}
