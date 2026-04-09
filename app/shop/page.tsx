"use client";

import { useState, useMemo, use } from "react";
import Link from "next/link";
import { ProductCard } from "@/presentation/components/features/ProductCard";
import { Button } from "@/presentation/components/ui/Button";
import { mockProducts } from "@/infrastructure/db/mock-data";

export default function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Unwrap the Promise with React.use()
  const searchParamsData = use(searchParams);
  const filter = typeof searchParamsData.filter === "string" ? searchParamsData.filter : "all";
  const initialSort = typeof searchParamsData.sort === "string" ? searchParamsData.sort : "popular";
  
  const [sort, setSort] = useState(initialSort);

  const filteredProducts = useMemo(() => {
    let result = [...mockProducts];
    
    if (filter === "cookies") {
      result = result.filter((p) => p.type === "cookie");
    } else if (filter === "boxes") {
      result = result.filter((p) => p.type === "box");
    }
    
    if (sort === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sort === "newest") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    return result;
  }, [filter, sort]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    setSort(newSort);
    const url = new URL(window.location.href);
    url.searchParams.set("sort", newSort);
    window.history.pushState({}, "", url);
  };

  return (
    <div className="min-h-screen">
      <section className="bg-[#F0E6D6]/30 py-16">
        <div className="mx-auto w-full px-4 sm:px-8 lg:px-12 max-w-[1400px]">
          <h1 className="font-display text-4xl sm:text-5xl text-[#2C1810] mb-4">
            Cookie Shop
          </h1>
          <p className="text-[#A07850] max-w-xl">
            Browse our selection of freshly baked American-style cookies and
            pre-made boxes. All cookies are made to order with premium
            ingredients.
          </p>
        </div>
      </section>

      <div className="sticky top-16 z-30 bg-[#FDF6EE]/95 backdrop-blur-md border-b border-[#E8D5C0]">
        <div className="mx-auto w-full px-4 sm:px-8 lg:px-12 max-w-[1400px] py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              {[
                { value: "all", label: "All" },
                { value: "cookies", label: "Cookies" },
                { value: "boxes", label: "Boxes" },
              ].map((tab) => (
                <Link
                  key={tab.value}
                  href={`/shop?filter=${tab.value}&sort=${sort}`}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer ${
                    filter === tab.value
                      ? "bg-[#F4538A] text-white"
                      : "bg-[#F0E6D6] text-[#5C3D2E] hover:bg-[#FFF0F5]"
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>

            <div className="ml-auto">
              <select
                value={sort}
                onChange={handleSortChange}
                className="bg-white border border-[#E8D5C0] rounded-full px-4 py-2 text-sm text-[#5C3D2E] focus:outline-none focus:border-[#F4538A] focus:ring-2 focus:ring-[#F4538A]/20 cursor-pointer appearance-none pr-10 relative"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235C3D2E' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                }}
              >
                <option value="popular">Popular</option>
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <section className="py-16 lg:py-24">
        <div className="mx-auto w-full px-4 sm:px-8 lg:px-12 max-w-[1400px]">
          {filteredProducts.length > 0 ? (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-[#A07850] text-lg">
                No products found. Check back soon!
              </p>
              <Link href="/shop" className="mt-4 inline-block">
                <Button variant="ghost">View All Products</Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
