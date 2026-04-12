"use client";

import * as React from "react";
import { useState } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon, ShoppingBagIcon } from "lucide-react";
import { Button } from "@/presentation/components/ui/Button";
import { StepIndicator } from "@/presentation/components/features/StepIndicator";
import { BoxBuilder, type BoxItem } from "@/presentation/components/features/BoxBuilder";
import { addItem } from "@/presentation/store/cart/cart.slice";
import { openCart, addToast } from "@/presentation/store/ui/ui.slice";
import { formatPrice } from "@/presentation/lib/utils";
import { fadeInUp } from "@/presentation/lib/animations";
import { useTranslations } from 'next-intl';
import type { Product } from "@/domain/entities/product";

// Extended BoxItem with full product data for cart
interface CartBoxItem extends BoxItem {
  product: Product;
}

export default function BuildPage() {
  const dispatch = useDispatch();
  const t = useTranslations();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedItems, setSelectedItems] = useState<CartBoxItem[]>([]);

  const steps = [
    t("build.selectSize"),
    t("build.yourBox"),
    t("cart.checkout")
  ];

  // Handle items change from BoxBuilder
  const handleItemsChange = (items: BoxItem[], products?: Product[]) => {
    if (!products) return;
    
    const itemsWithProducts: CartBoxItem[] = items.map((item) => ({
      ...item,
      product: products.find((p) => p.id === item.productId)!,
    })).filter((item) => item.product); // Filter out any missing products
    
    setSelectedItems(itemsWithProducts);
  };

  const totalPrice = selectedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalCookies = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = () => {
    selectedItems.forEach(({ product, quantity }) => {
      dispatch(addItem({ product, quantity }));
    });
    dispatch(openCart());
    dispatch(addToast({ message: t("product.added"), type: "success" }));
  };

  const canProceed = selectedItems.length > 0 && totalCookies >= 3;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-[#F0E6D6]/30 py-12">
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8 lg:px-12">
          <h1 className="font-display text-[#2C1810] mb-4 text-4xl sm:text-5xl">{t("build.title")}</h1>
          <p className="text-[#A07850] max-w-xl">
            {t("build.subtitle")}
          </p>
        </div>
      </section>

      {/* Step Indicator */}
      <div className="border-[#E8D5C0] border-b bg-white py-6">
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8 lg:px-12">
          <StepIndicator steps={steps} currentStep={currentStep} />
        </div>
      </div>

      {/* Step Content */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8 lg:px-12">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="step1"
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Use BoxBuilder for cookie selection */}
                <BoxBuilder
                  selectedItems={selectedItems}
                  onItemsChange={handleItemsChange}
                  t={t}
                  mode="customer"
                />

                <div className="mt-8 flex justify-end">
                  <Button
                    onClick={() => setCurrentStep(1)}
                    disabled={!canProceed}
                    className="group cursor-pointer bg-[#F4538A] hover:bg-[#D63A72]"
                  >
                    {t("common.continue")}
                    <ChevronRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div
                key="step2"
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="mx-auto max-w-2xl">
                  <h2 className="font-display text-[#2C1810] mb-6 text-center text-2xl">
                    {t("build.yourBox")}
                  </h2>

                  <div className="space-y-4 rounded-3xl bg-white p-6 shadow-[0_2px_12px_rgba(44,24,16,0.08)]">
                    {selectedItems.map(({ product, quantity }) => (
                      <div
                        key={product.id}
                        className="bg-[#F0E6D6]/30 flex items-center gap-4 rounded-xl p-3"
                      >
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-[#FFF0F5]">
                          <Image
                            src={product.images[0] || "/images/box1.png"}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-[#2C1810] truncate text-sm font-bold">
                            {product.name}
                          </h4>
                          <p className="text-[#A07850] text-xs tabular-nums">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                      </div>
                    ))}

                    <div className="border-[#E8D5C0] border-t pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[#5C3D2E]">{totalCookies} {t("common.quantity").toLowerCase()}</span>
                        <span className="text-[#2C1810] text-2xl font-extrabold tabular-nums">
                          {formatPrice(totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-between">
                    <Button
                      variant="ghost"
                      onClick={() => setCurrentStep(0)}
                      className="cursor-pointer"
                    >
                      <ChevronLeftIcon className="mr-2 h-4 w-4" />
                      {t("common.back")}
                    </Button>
                    <Button 
                      onClick={() => setCurrentStep(2)} 
                      className="cursor-pointer bg-[#F4538A] hover:bg-[#D63A72]"
                    >
                      {t("common.continue")}
                      <ChevronRightIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step3"
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                exit={{ opacity: 0, x: -20 }}
                className="mx-auto max-w-lg text-center"
              >
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#FFF0F5]">
                  <ShoppingBagIcon className="h-12 w-12 text-[#F4538A]" />
                </div>

                <h2 className="font-display text-[#2C1810] mb-4 text-3xl">{t("checkout.title")}</h2>

                <p className="text-[#5C3D2E] mb-2">{t("build.yourBox")}: {totalCookies} {t("common.quantity").toLowerCase()}</p>
                <p className="mb-8 text-2xl font-extrabold text-[#F4538A] tabular-nums">
                  {formatPrice(totalPrice)}
                </p>

                <div className="space-y-3">
                  <Button 
                    size="lg" 
                    fullWidth 
                    onClick={handleAddToCart} 
                    className="cursor-pointer bg-[#F4538A] hover:bg-[#D63A72]"
                  >
                    {t("shop.addToCart")}
                  </Button>
                  <Button
                    variant="ghost"
                    fullWidth
                    onClick={() => setCurrentStep(1)}
                    className="cursor-pointer"
                  >
                    {t("common.back")}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
