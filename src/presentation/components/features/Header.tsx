"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { ShoppingBagIcon, MenuIcon, XIcon, CookieIcon } from "lucide-react";
import { toggleCart } from "@/presentation/store/ui/ui.slice";
import { selectTotalItemCount } from "@/presentation/store/cart/cart.slice";
import { cn } from "@/presentation/lib/utils";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";

export const Header: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const cartCount = useSelector(selectTotalItemCount);
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { href: "/shop", label: mounted ? t("nav.shop") : "Shop" },
    { href: "/build", label: mounted ? t("nav.build") : "Build" },
    { href: "/vote", label: mounted ? t("nav.vote") : "Vote" },
  ];

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 bg-[#FDF6EE]/90 backdrop-blur-md border-b border-[#E8D5C0] transition-shadow duration-300",
          scrolled && "shadow-[0_2px_20px_rgba(44,24,16,0.08)]"
        )}
      >
        <nav className="mx-auto w-full px-4 sm:px-8 lg:px-12 max-w-[1400px] flex items-center justify-between h-16 sm:h-[72px]">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <CookieIcon className="w-8 h-8 text-[#F4538A] group-hover:rotate-12 transition-transform duration-300" />
            <span className="font-display text-2xl text-[#2C1810] leading-none">
              crumbleivable!
            </span>
          </Link>

          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[#5C3D2E] hover:text-[#F4538A] font-semibold text-sm transition-colors duration-150 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#F4538A] hover:after:w-full after:transition-all after:duration-300 cursor-pointer"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            
            <button
              onClick={() => dispatch(toggleCart())}
              className="relative p-2.5 rounded-full hover:bg-[#FFF0F5] transition-colors cursor-pointer"
              aria-label="Open cart"
            >
              <ShoppingBagIcon className="w-5 h-5 text-[#2C1810]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#F4538A] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center tabular-nums">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-full hover:bg-[#FFF0F5] transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <XIcon className="w-5 h-5 text-[#2C1810]" />
              ) : (
                <MenuIcon className="w-5 h-5 text-[#2C1810]" />
              )}
            </button>
          </div>
        </nav>
      </header>

      <div className="h-16 sm:h-[72px]" />

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 md:hidden"
          >
            <div
              className="absolute inset-0 bg-[#2C1810]/40 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.nav
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-[72px] left-0 right-0 bg-[#FDF6EE] border-b border-[#E8D5C0] p-6"
            >
              <ul className="space-y-4">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-[#2C1810] font-bold text-lg py-2 cursor-pointer"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
