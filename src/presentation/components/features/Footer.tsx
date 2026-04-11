"use client";

import * as React from "react";
import Link from "next/link";
import { CookieIcon } from "lucide-react";
import { useTranslations } from 'next-intl';

export const Footer: React.FC = () => {
  const t = useTranslations();

  const footerLinks = [
    { href: "/shop", label: t("nav.shop") },
    { href: "/build", label: t("nav.build") },
    { href: "/vote", label: t("nav.vote") },
    { href: "/cart", label: t("nav.cart") },
  ];

  return (
    <footer className="bg-[#2C1810] text-white">
      <div className="mx-auto w-full px-4 sm:px-8 lg:px-12 max-w-[1400px] py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 cursor-pointer">
              <CookieIcon className="w-8 h-8 text-[#F4538A]" />
              <span className="font-display text-2xl text-white leading-none">
                crumbleivable!
              </span>
            </Link>
            <p className="text-white/70 text-sm max-w-sm">
              {t("footer.tagline")}
            </p>
            <p className="text-[#F4538A] font-semibold mt-4">Bake it happen 🍪</p>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest text-white/50 mb-4">
              {t("footer.quickLinks")}
            </h4>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-white text-sm transition-colors cursor-pointer"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest text-white/50 mb-4">
              {t("footer.contact")}
            </h4>
            <p className="text-white/70 text-sm">
              Wahran (Oran), Algeria
            </p>
            <p className="text-white/70 text-sm mt-2">
              Orders confirmed via Telegram
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/50 text-sm">
            © {new Date().getFullYear()} Crumbleivable! {t("footer.rights")}.
          </p>
          <p className="text-white/50 text-xs">
            Made with 💗 in Wahran
          </p>
        </div>
      </div>
    </footer>
  );
};
