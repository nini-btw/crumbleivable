"use client";

import * as React from "react";
import { useState, useEffect } from "react";
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
} from "lucide-react";
import { Button } from "@/presentation/components/ui/Button";
import type { Product, CookiePiece } from "@/domain/entities/product";
import { isCookiePiece } from "@/domain/entities/product";

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6 border-b border-[#E8D5C0] flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#2C1810]">
            {product ? "Edit Product" : "Add Product"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F0E6D6] rounded-lg transition-colors"
          >
            <XIcon className="w-5 h-5 text-[#A07850]" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(formData);
          }}
          className="p-4 sm:p-6 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-[#A07850] block mb-2">
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full bg-white border-2 border-[#E8D5C0] rounded-2xl px-4 py-3 text-[#2C1810] focus:outline-none focus:border-[#F4538A] focus:ring-2 focus:ring-[#F4538A]/20"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-[#A07850] block mb-2">
                Price (DA) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
                className="w-full bg-white border-2 border-[#E8D5C0] rounded-2xl px-4 py-3 text-[#2C1810] focus:outline-none focus:border-[#F4538A] focus:ring-2 focus:ring-[#F4538A]/20"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-[#A07850] block mb-2">
              Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full bg-white border-2 border-[#E8D5C0] rounded-2xl px-4 py-3 text-[#2C1810] focus:outline-none focus:border-[#F4538A] focus:ring-2 focus:ring-[#F4538A]/20 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-[#A07850] block mb-2">
                Flavour
              </label>
              <input
                type="text"
                value={formData.flavour}
                onChange={(e) =>
                  setFormData({ ...formData, flavour: e.target.value })
                }
                className="w-full bg-white border-2 border-[#E8D5C0] rounded-2xl px-4 py-3 text-[#2C1810] focus:outline-none focus:border-[#F4538A] focus:ring-2 focus:ring-[#F4538A]/20"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-[#A07850] block mb-2">
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as "cookie" | "box",
                  })
                }
                className="w-full bg-white border-2 border-[#E8D5C0] rounded-2xl px-4 py-3 text-[#2C1810] focus:outline-none focus:border-[#F4538A] focus:ring-2 focus:ring-[#F4538A]/20"
              >
                <option value="cookie">Cookie</option>
                <option value="box">Box</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-[#A07850] block mb-2">
              Image URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.images[0] || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    images: e.target.value ? [e.target.value] : [],
                  })
                }
                placeholder="https://..."
                className="flex-1 bg-white border-2 border-[#E8D5C0] rounded-2xl px-4 py-3 text-[#2C1810] focus:outline-none focus:border-[#F4538A] focus:ring-2 focus:ring-[#F4538A]/20"
              />
              <div className="w-14 h-14 bg-[#F0E6D6] rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0">
                {formData.images[0] ? (
                  <img
                    src={formData.images[0]}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-6 h-6 text-[#A07850]" />
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 cursor-pointer p-3 border-2 border-[#E8D5C0] rounded-2xl hover:border-[#F4538A]/50 transition-colors">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-4 h-4 rounded border-2 border-[#E8D5C0] text-[#F4538A] focus:ring-[#F4538A]"
              />
              <span className="text-sm text-[#2C1810]">Active (visible in shop)</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer p-3 border-2 border-[#E8D5C0] rounded-2xl hover:border-[#F4538A]/50 transition-colors">
              <input
                type="checkbox"
                checked={formData.isNew}
                onChange={(e) =>
                  setFormData({ ...formData, isNew: e.target.checked })
                }
                className="w-4 h-4 rounded border-2 border-[#E8D5C0] text-[#F4538A] focus:ring-[#F4538A]"
              />
              <span className="text-sm text-[#2C1810]">Mark as New</span>
            </label>
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
              {product ? "Save Changes" : "Create Product"}
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
  onDelete 
}: { 
  product: Product; 
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white border border-[#E8D5C0] rounded-2xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-16 h-16 bg-[#F0E6D6] rounded-xl overflow-hidden flex-shrink-0">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PackageIcon className="w-6 h-6 text-[#A07850]" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#2C1810] truncate">{product.name}</h3>
          <p className="text-lg font-bold text-[#F4538A]">{product.price} DA</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#F0E6D6] text-[#5C3D2E]">
              {product.type}
            </span>
            {product.isActive ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                Inactive
              </span>
            )}
          </div>
        </div>
      </div>
      
      <p className="text-sm text-[#A07850] line-clamp-2">{product.description}</p>
      
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F0E6D6]">
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#F0E6D6] hover:bg-[#E8D5C0] rounded-lg transition-colors text-sm"
        >
          <PencilIcon className="w-4 h-4 text-[#5C3D2E]" />
          Edit
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-sm text-red-500"
        >
          <Trash2Icon className="w-4 h-4" />
          Delete
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

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
        alert(result.error || "Failed to save product");
      }
    } catch (error) {
      console.error("Failed to save product:", error);
      alert("Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (result.success) {
        setProducts(products.filter((p) => p.id !== id));
      } else {
        alert(result.error || "Failed to delete product");
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("Failed to delete product");
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
          <h1 className="font-display text-3xl text-[#2C1810]">Products</h1>
          <p className="text-[#A07850] mt-1">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-[#2C1810]">Products</h1>
          <p className="text-[#A07850] mt-1">Manage your products</p>
        </div>
        <Button
          onClick={handleCreate}
          className="cursor-pointer bg-[#F4538A] hover:bg-[#D63A72]"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A07850]" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border-2 border-[#E8D5C0] rounded-2xl pl-12 pr-4 py-3 text-[#2C1810] focus:outline-none focus:border-[#F4538A] focus:ring-2 focus:ring-[#F4538A]/20"
        />
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block bg-white rounded-3xl border border-[#E8D5C0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F0E6D6]/50">
              <tr>
                <SortHeader field="name">Product</SortHeader>
                <SortHeader field="price">Price</SortHeader>
                <SortHeader field="type">Type</SortHeader>
                <SortHeader field="status">Status</SortHeader>
                <th className="px-3 sm:px-6 py-3 text-right text-xs font-bold uppercase tracking-widest text-[#A07850]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8D5C0]">
              {filteredAndSortedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-[#FFF0F5]/50 transition-colors">
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#F0E6D6] rounded-xl overflow-hidden flex-shrink-0">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#A07850]" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-[#2C1810] text-sm sm:text-base truncate">{product.name}</p>
                        <p className="text-xs text-[#A07850] truncate max-w-[150px] sm:max-w-[200px]">{product.description.slice(0, 40)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 font-semibold text-[#2C1810] tabular-nums text-sm sm:text-base">
                    {product.price} DA
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium bg-[#F0E6D6] text-[#5C3D2E]">
                      {product.type}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    {product.isActive ? (
                      <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 hover:bg-[#F0E6D6] rounded-lg transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <PencilIcon className="w-4 h-4 text-[#A07850]" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2Icon className="w-4 h-4 text-red-400" />
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
            {searchQuery ? "No products match your search." : "No products yet. Add some!"}
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-3">
        {filteredAndSortedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onEdit={() => handleEdit(product)}
            onDelete={() => handleDelete(product.id)}
          />
        ))}
        {filteredAndSortedProducts.length === 0 && (
          <div className="p-8 text-center text-[#A07850] bg-white rounded-3xl border border-[#E8D5C0]">
            {searchQuery ? "No products match your search." : "No products yet. Add some!"}
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
