"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Trash2Icon,
  ShoppingBagIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
} from "lucide-react";
import { Button } from "@/presentation/components/ui/Button";
import { Input, Textarea } from "@/presentation/components/ui/Input";
import { QuantityStepper } from "@/presentation/components/ui/QuantityStepper";
import {
  selectCartItems,
  selectCartTotal,
  selectCanCheckout,
  selectCookiesNeeded,
  selectCartProgress,
  removeItem,
  updateQuantity,
  clearCart,
  setCookingNote,
  setGiftNote,
  selectCookingNote,
  selectGiftNote,
} from "@/presentation/store/cart/cart.slice";
import { addToast } from "@/presentation/store/ui/ui.slice";
import { formatPrice } from "@/presentation/lib/utils";
import { fadeInUp } from "@/presentation/lib/animations";

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  address: z.string().min(10, "Complete address required"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CartPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const canCheckout = useSelector(selectCanCheckout);
  const cookiesNeeded = useSelector(selectCookiesNeeded);
  const progress = useSelector(selectCartProgress);
  const cookingNote = useSelector(selectCookingNote);
  const giftNote = useSelector(selectGiftNote);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [orderComplete, setOrderComplete] = React.useState(false);
  const [orderId, setOrderId] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  const onSubmit = async (data: CheckoutFormData) => {
    if (!canCheckout) {
      dispatch(
        addToast({
          message: `Add ${cookiesNeeded} more cookies to checkout`,
          type: "error",
        })
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setOrderComplete(true);
      setOrderId("order-" + Date.now());
      dispatch(clearCart());
    } catch (error) {
      dispatch(
        addToast({
          message: "An error occurred. Please try again.",
          type: "error",
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="mx-auto w-full px-4 sm:px-8 lg:px-12 max-w-lg">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-[0_8px_32px_rgba(44,24,16,0.16)] p-8 text-center"
          >
            <div className="w-20 h-20 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircleIcon className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="font-display text-3xl text-brown-900 mb-4">
              Order Confirmed!
            </h1>
            <p className="text-brown-700 mb-2">
              Thank you for your order. We&apos;ll be in touch soon!
            </p>
            {orderId && (
              <p className="text-sm text-brown-400 mb-6">
                Order ID: {orderId.slice(0, 8)}
              </p>
            )}
            <Link href="/shop" className="cursor-pointer">
              <Button fullWidth className="cursor-pointer">Continue Shopping</Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="mx-auto w-full px-4 sm:px-8 lg:px-12 max-w-lg text-center">
          <ShoppingBagIcon className="w-20 h-20 text-brown-100 mx-auto mb-6" />
          <h1 className="font-display text-3xl text-brown-900 mb-4">
            Your Box is Empty
          </h1>
          <p className="text-brown-400 mb-8">
            Add some delicious cookies to get started!
          </p>
          <Link href="/shop" className="cursor-pointer">
            <Button className="cursor-pointer">Shop Cookies</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-sand/30 py-12">
        <div className="mx-auto w-full px-4 sm:px-8 lg:px-12 max-w-[1400px]">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-brown-400 hover:text-brown-700 transition-colors mb-4 cursor-pointer"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Continue Shopping
          </Link>
          <h1 className="font-display text-4xl sm:text-5xl text-brown-900">
            Your Box
          </h1>
        </div>
      </section>

      {/* Cart Content */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto w-full px-4 sm:px-8 lg:px-12 max-w-[1400px]">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left: Order Summary */}
            <motion.div variants={fadeInUp} initial="initial" animate="animate">
              <h2 className="font-display text-2xl text-brown-900 mb-6">
                Order Summary
              </h2>

              {!canCheckout && (
                <div className="bg-pink-50 border border-pink-100 rounded-2xl p-4 mb-6">
                  <p className="text-brown-700 text-sm font-medium text-center">
                    Add {cookiesNeeded} more cookie
                    {cookiesNeeded !== 1 ? "s" : ""} to unlock checkout 🍪
                  </p>
                  <div className="mt-2 h-2 bg-pink-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-pink-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-4 p-4 bg-white rounded-2xl border border-brown-100"
                  >
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-pink-50 flex items-center justify-center text-2xl">
                      🍪
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-brown-900 text-sm truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-brown-400 text-xs mt-0.5">
                        {formatPrice(item.product.price)}
                      </p>

                      <div className="flex items-center justify-between mt-3">
                        <QuantityStepper
                          value={item.quantity}
                          onChange={(qty) =>
                            dispatch(
                              updateQuantity({
                                productId: item.product.id,
                                quantity: qty,
                              })
                            )
                          }
                        />
                        <button
                          onClick={() => dispatch(removeItem(item.product.id))}
                          className="p-2 text-brown-400 hover:text-red-500 transition-colors cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2Icon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-4">
                <Textarea
                  label="Cooking Note (Optional)"
                  placeholder="Any special requests? (e.g., no sugar, extra crispy)"
                  value={cookingNote || ""}
                  onChange={(e) => dispatch(setCookingNote(e.target.value))}
                  helperText="We'll do our best to accommodate your request"
                />

                <Textarea
                  label="Gift Note (Optional)"
                  placeholder="Write a message for the gift card..."
                  value={giftNote || ""}
                  onChange={(e) => dispatch(setGiftNote(e.target.value))}
                  helperText="We'll write this on a beautiful card inside the box 💌"
                />
              </div>
            </motion.div>

            {/* Right: Checkout Form */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.1 }}
            >
              <h2 className="font-display text-2xl text-brown-900 mb-6">
                Checkout
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Full Name"
                  placeholder="Your full name"
                  error={errors.fullName?.message}
                  {...register("fullName")}
                />

                <Input
                  label="Phone Number"
                  placeholder="+213 555 123 456"
                  error={errors.phone?.message}
                  {...register("phone")}
                />

                <Textarea
                  label="Delivery Address"
                  placeholder="Your full address in Oran"
                  error={errors.address?.message}
                  {...register("address")}
                />

                <div className="bg-white rounded-2xl p-6 border border-brown-100 mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-brown-700">Subtotal</span>
                    <span className="text-brown-900">
                      {formatPrice(total)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-brown-700">Delivery</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="border-t border-brown-100 pt-4 flex justify-between items-center">
                    <span className="font-bold text-brown-900">Total</span>
                    <span className="text-2xl font-extrabold text-brown-900">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  fullWidth
                  isLoading={isSubmitting}
                  disabled={!canCheckout}
                  className="cursor-pointer"
                >
                  {canCheckout ? "Place Order" : `Add ${cookiesNeeded} more`}
                </Button>

                <p className="text-xs text-brown-400 text-center">
                  By placing an order, you agree to our terms. We&apos;ll confirm
                  your order via Telegram.
                </p>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
