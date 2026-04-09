"use client";

import * as React from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, ShoppingBagIcon } from "lucide-react";
import { Button } from "@/presentation/components/ui/Button";
import { StepIndicator } from "@/presentation/components/features/StepIndicator";
import { QuantityStepper } from "@/presentation/components/ui/QuantityStepper";
import { addItem } from "@/presentation/store/cart/cart.slice";
import { openCart, addToast } from "@/presentation/store/ui/ui.slice";
import { formatPrice } from "@/presentation/lib/utils";
import { fadeInUp } from "@/presentation/lib/animations";
import { mockCookies } from "@/infrastructure/db/mock-data";
import type { Product } from "@/domain/entities/product";

const steps = ["Choose Cookies", "Review Box", "Add to Cart"];

const getCookieImage = (slug: string): string => {
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

export default function BuildPage() {
  const dispatch = useDispatch();

  const [currentStep, setCurrentStep] = React.useState(0);
  const [selectedCookies, setSelectedCookies] = React.useState<
    { cookie: Product; quantity: number }[]
  >([]);

  const toggleCookie = (cookie: Product) => {
    const existing = selectedCookies.find((c) => c.cookie.id === cookie.id);
    if (existing) {
      setSelectedCookies(selectedCookies.filter((c) => c.cookie.id !== cookie.id));
    } else {
      setSelectedCookies([...selectedCookies, { cookie, quantity: 1 }]);
    }
  };

  const updateQuantity = (cookieId: string, quantity: number) => {
    setSelectedCookies(
      selectedCookies.map((c) => (c.cookie.id === cookieId ? { ...c, quantity } : c))
    );
  };

  const totalPrice = selectedCookies.reduce((sum, c) => sum + c.cookie.price * c.quantity, 0);

  const totalCookies = selectedCookies.reduce((sum, c) => sum + c.quantity, 0);

  const handleAddToCart = () => {
    selectedCookies.forEach(({ cookie, quantity }) => {
      dispatch(addItem({ product: cookie, quantity }));
    });
    dispatch(openCart());
    dispatch(addToast({ message: "Box added to cart!", type: "success" }));
  };

  const canProceed = selectedCookies.length > 0 && totalCookies >= 3;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-sand/30 py-12">
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8 lg:px-12">
          <h1 className="font-display text-brown-900 mb-4 text-4xl sm:text-5xl">Build Your Box</h1>
          <p className="text-brown-400 max-w-xl">
            Create your perfect box by selecting 3 or more cookies. Mix and match to your
            heart&apos;s content!
          </p>
        </div>
      </section>

      {/* Step Indicator */}
      <div className="border-brown-100 border-b bg-white py-6">
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
                <div className="mb-8 rounded-2xl border border-pink-100 bg-pink-50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-brown-700 font-medium">
                      {totalCookies} / 3 cookies selected
                    </span>
                    <span className="font-bold text-pink-500">
                      {totalCookies >= 3 ? "✓ Ready!" : `${3 - totalCookies} more needed`}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-pink-100">
                    <motion.div
                      className="h-full rounded-full bg-pink-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((totalCookies / 3) * 100, 100)}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {mockCookies.map((cookie) => {
                    const selected = selectedCookies.some((c) => c.cookie.id === cookie.id);
                    return (
                      <button
                        key={cookie.id}
                        onClick={() => toggleCookie(cookie)}
                        className={`group relative flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 p-4 transition-all duration-200 ${
                          selected
                            ? "border-pink-500 bg-pink-50 shadow-[0_0_0_3px_rgba(244,83,138,0.15)]"
                            : "border-brown-100 bg-white hover:border-pink-200"
                        }`}
                      >
                        <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-pink-50 sm:h-24 sm:w-24">
                          <Image
                            src={getCookieImage(cookie.slug)}
                            alt={cookie.name}
                            fill
                            className="object-cover"
                          />
                          {selected && (
                            <div className="absolute inset-0 flex items-center justify-center bg-pink-500/40">
                              <CheckIcon className="h-8 w-8 text-white" />
                            </div>
                          )}
                        </div>
                        <span className="text-brown-900 line-clamp-2 text-center text-xs leading-tight font-bold sm:text-sm">
                          {cookie.name}
                        </span>
                        <span className="text-brown-400 text-xs tabular-nums">
                          {formatPrice(cookie.price)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8 flex justify-end">
                  <Button
                    onClick={() => setCurrentStep(1)}
                    disabled={!canProceed}
                    className="group cursor-pointer"
                  >
                    Review Box
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
                  <h2 className="font-display text-brown-900 mb-6 text-center text-2xl">
                    Your Custom Box
                  </h2>

                  <div className="space-y-4 rounded-3xl bg-white p-6 shadow-[0_2px_12px_rgba(44,24,16,0.08)]">
                    {selectedCookies.map(({ cookie, quantity }) => (
                      <div
                        key={cookie.id}
                        className="bg-sand/30 flex items-center gap-4 rounded-xl p-3"
                      >
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-pink-50">
                          <Image
                            src={getCookieImage(cookie.slug)}
                            alt={cookie.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-brown-900 truncate text-sm font-bold">
                            {cookie.name}
                          </h4>
                          <p className="text-brown-400 text-xs tabular-nums">
                            {formatPrice(cookie.price)}
                          </p>
                        </div>
                        <QuantityStepper
                          value={quantity}
                          onChange={(q) => updateQuantity(cookie.id, q)}
                        />
                      </div>
                    ))}

                    <div className="border-brown-100 border-t pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-brown-700">{totalCookies} cookies</span>
                        <span className="text-brown-900 text-2xl font-extrabold tabular-nums">
                          {formatPrice(totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(0)}
                      className="cursor-pointer"
                    >
                      <ChevronLeftIcon className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button onClick={() => setCurrentStep(2)} className="cursor-pointer">
                      Continue
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
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-pink-50">
                  <ShoppingBagIcon className="h-12 w-12 text-pink-500" />
                </div>

                <h2 className="font-display text-brown-900 mb-4 text-3xl">Ready to Order?</h2>

                <p className="text-brown-700 mb-2">Your custom box with {totalCookies} cookies</p>
                <p className="mb-8 text-2xl font-extrabold text-pink-500 tabular-nums">
                  {formatPrice(totalPrice)}
                </p>

                <div className="space-y-3">
                  <Button size="lg" fullWidth onClick={handleAddToCart} className="cursor-pointer">
                    Add to Cart
                  </Button>
                  <Button
                    variant="ghost"
                    fullWidth
                    onClick={() => setCurrentStep(1)}
                    className="cursor-pointer"
                  >
                    Go Back
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
