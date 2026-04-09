"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRightIcon } from "lucide-react";
import { staggerContainer, fadeInUp } from "@/presentation/lib/animations";

interface FeaturedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
}
const featuredProducts: FeaturedProduct[] = [
  {
    id: "1",
    name: "Classic Chocolate Chip",
    slug: "chocoShips",
    price: 150,
    image: "/images/chocoShips.png",
  },
  {
    id: "2",
    name: "Double Chocolate Fudge",
    slug: "mm",
    price: 170,
    image: "/images/mm.png",
  },
  {
    id: "3",
    name: "White Chocolate Macadamia",
    slug: "pistash",
    price: 180,
    image: "/images/pistash.png",
  },
  {
    id: "4",
    name: "Red Velvet Cheesecake",
    slug: "viola",
    price: 170,
    image: "/images/viola.png",
  },
  {
    id: "5",
    name: "Peanut Butter Chocolate",
    slug: "peanut",
    price: 160,
    image: "/images/peanut.png",
  },
  {
    id: "6",
    name: "Oatmeal Raisin Spice",
    slug: "ben10",
    price: 150,
    image: "/images/ben10.png",
  },
  {
    id: "7",
    name: "Salted Caramel",
    slug: "lotus",
    price: 170,
    image: "/images/lotus.png",
  },
  {
    id: "8",
    name: "Funfetti Birthday Cake",
    slug: "strawbery",
    price: 160,
    image: "/images/strawbery.png",
  },
];
function formatPrice(price: number) {
  return `${price} DZD`;
}

export default function FeaturedSection() {
  return (
    <section className="relative py-20 lg:py-28">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8 lg:px-12">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-14 text-center"
        >
          <motion.span
            variants={fadeInUp}
            className="text-sm font-bold tracking-widest text-[#F4538A] uppercase"
          >
            Fan Favorites
          </motion.span>
          <motion.h2
            variants={fadeInUp}
            className="font-display mt-3 text-3xl text-[#2C1810] sm:text-4xl lg:text-5xl"
          >
            Most Crumbled
          </motion.h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 lg:gap-8"
        >
          {featuredProducts.map((product) => (
            <motion.div key={product.id} variants={fadeInUp}>
              <Link href={`/shop/${product.slug}`} className="group block">
                <div className="rounded-2xl bg-white p-3 shadow-[0_2px_8px_rgba(44,24,16,0.08)] transition-shadow duration-300 hover:shadow-[0_8px_24px_rgba(44,24,16,0.12)] sm:rounded-3xl sm:p-4">
                  <div className="relative mb-3 aspect-square overflow-hidden rounded-xl bg-[#FFF0F5] sm:mb-4 sm:rounded-2xl">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="truncate text-xs font-bold text-[#2C1810] sm:text-sm">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-sm font-bold text-[#F4538A] sm:text-base">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Link
            href="/shop"
            className="inline-flex cursor-pointer items-center gap-2 font-bold text-[#F4538A] transition-colors hover:text-[#D63A72]"
          >
            View All Cookies
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
