"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  PlusIcon,
  PencilIcon,
  Trash2Icon,
  EyeIcon,
  EyeOffIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "lucide-react";
import { Button } from "@/presentation/components/ui/Button";
import { mockProducts } from "@/infrastructure/db/mock-data";
import { isCookiePiece } from "@/domain/entities/product";

type SortField = "name" | "type" | "price" | "status";
type SortDirection = "asc" | "desc";

export default function AdminProductsPage() {
  const [products, setProducts] = React.useState(mockProducts);
  const [sortField, setSortField] = React.useState<SortField>("name");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedProducts = React.useMemo(() => {
    return [...products].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "type":
          comparison = a.type.localeCompare(b.type);
          break;
        case "price":
          comparison = a.price - b.price;
          break;
        case "status":
          comparison = Number(b.isActive) - Number(a.isActive);
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [products, sortField, sortDirection]);

  const toggleActive = (id: string) => {
    setProducts(products.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p)));
  };

  const getProductImage = (slug: string) => {
    const imageMap: Record<string, string> = {
      chocoShips: "/images/chocoShips.png",
      mm: "/images/mm.png",
      pistash: "/images/pistash.png",
      viola: "/images/viola.png",
      peanut: "/images/peanut.png",
      ben10: "/images/ben10.png",
      lotus: "/images/lotus.png",
      strawbery: "/images/strawbery.png",

      // boxes
      bueno: "/images/bueno.png",
      kinder: "/images/kinder.png",
      tiramisu: "/images/tiramisu.png",
    };
    return imageMap[slug] || "/images/bueno.png";
  };

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      className="text-brown-400 hover:text-brown-600 cursor-pointer px-4 py-3 text-left text-xs font-bold tracking-widest uppercase transition-colors sm:px-6"
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-brown-900 text-3xl">Products</h1>
          <p className="text-brown-400 mt-1">Manage your cookies and boxes</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="cursor-pointer">
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Products Table */}
      <div className="border-brown-100 overflow-hidden rounded-3xl border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead className="bg-sand/50">
              <tr>
                <SortHeader field="name">Product</SortHeader>
                <SortHeader field="type">Type</SortHeader>
                <SortHeader field="price">Price</SortHeader>
                <SortHeader field="status">Status</SortHeader>
                <th className="text-brown-400 px-4 py-3 text-right text-xs font-bold tracking-widest uppercase sm:px-6">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-brown-100 divide-y">
              {sortedProducts.map((product) => (
                <tr key={product.id} className="transition-colors hover:bg-pink-50/50">
                  <td className="px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-pink-50">
                        <Image
                          src={getProductImage(product.slug)}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-brown-900 truncate font-medium">{product.name}</p>
                        {isCookiePiece(product) && product.isNew && (
                          <span className="mt-1 inline-block rounded-full bg-pink-500 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        product.type === "box"
                          ? "bg-pink-100 text-pink-700"
                          : "bg-sand text-brown-700"
                      }`}
                    >
                      {product.type === "box" ? "Box" : "Cookie"}
                    </span>
                  </td>
                  <td className="text-brown-900 px-4 py-4 font-semibold tabular-nums sm:px-6">
                    {product.price} DA
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <button
                      onClick={() => toggleActive(product.id)}
                      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                        product.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {product.isActive ? (
                        <>
                          <EyeIcon className="h-3 w-3" />
                          Active
                        </>
                      ) : (
                        <>
                          <EyeOffIcon className="h-3 w-3" />
                          Hidden
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/products/${product.id}`}>
                        <button className="hover:bg-sand cursor-pointer rounded-lg p-2 transition-colors">
                          <PencilIcon className="text-brown-400 h-4 w-4" />
                        </button>
                      </Link>
                      <button className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-red-50">
                        <Trash2Icon className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
