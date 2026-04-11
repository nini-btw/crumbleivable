"use client";

import { useState, useEffect } from "react";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/presentation/components/ui/Button";
import { ProductCard } from "@/presentation/components/features/ProductCard";
import HeroSection from "./HeroSection";
import CountdownSection from "./CountdownSection";
import { useTranslations } from 'next-intl';
import type { Product } from "@/domain/entities/product";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/products");
        const result = await response.json();
        if (result.success) {
          // Get first 4 active products
          setProducts(result.data.filter((p: Product) => p.isActive).slice(0, 4));
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <>
      <HeroSection />

      <Suspense fallback={null}>
        <CountdownSection />
      </Suspense>

      <section className="py-16 lg:py-24 bg-[#F0E6D6]/30">
        <div className="mx-auto w-full px-4 sm:px-8 lg:px-12 max-w-[1400px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl text-[#2C1810]">
                {t("home.featured.title")}
              </h2>
              <p className="text-[#A07850] mt-2">
                {t("home.featured.subtitle")}
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-[#F4538A] hover:text-[#D63A72] font-semibold text-sm transition-colors cursor-pointer"
            >
              {t("common.viewAll")}
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-[#A07850]">{t("common.loading")}</div>
          ) : products.length > 0 ? (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-[#A07850]">
              {t("shop.noProducts")}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-[#F4538A] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3" />

        <div className="mx-auto w-full px-4 sm:px-8 lg:px-12 max-w-[1400px] relative">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-white mb-4">
              {t("build.title")}
            </h2>
            <p className="text-white/80 text-lg mb-8">
              {t("build.subtitle")}
            </p>
            <Link href="/build" className="cursor-pointer">
              <Button
                variant="ghost"
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-[#F4538A] cursor-pointer"
              >
                {t("home.hero.buildBox")}
                <ArrowRightIcon className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="mx-auto w-full px-4 sm:px-8 lg:px-12 max-w-[1400px]">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl sm:text-4xl text-[#2C1810] mb-4">
              {t("home.features.fresh.title")}
            </h2>
            <p className="text-[#A07850]">
              {t("home.features.fresh.desc")}
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                step: "01",
                title: t("home.features.fresh.title"),
                description: t("home.features.fresh.desc"),
              },
              {
                step: "02",
                title: t("home.features.delivery.title"),
                description: t("home.features.delivery.desc"),
              },
              {
                step: "03",
                title: t("home.features.custom.title"),
                description: t("home.features.custom.desc"),
              },
            ].map((item) => (
              <div
                key={item.step}
                className="text-center p-6 bg-white rounded-3xl shadow-[0_2px_12px_rgba(44,24,16,0.08)]"
              >
                <span className="inline-block text-4xl font-display text-[#FFD6E7] mb-4">
                  {item.step}
                </span>
                <h3 className="font-bold text-[#2C1810] text-lg mb-2">
                  {item.title}
                </h3>
                <p className="text-[#A07850] text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
