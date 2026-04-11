"use client";

import Link from "next/link";
import { CookieIcon, HomeIcon, SearchIcon } from "lucide-react";
import { Button } from "@/presentation/components/ui/Button";
import { useTranslations } from 'next-intl';

export default function NotFoundPage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-[#FDF6EE] flex flex-col items-center justify-center px-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#F4538A]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-[#F4538A]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-[#A07850]/5 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 text-center max-w-lg">
        {/* Cookie illustration */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto bg-[#F0E6D6] rounded-full flex items-center justify-center">
            <CookieIcon className="w-16 h-16 text-[#A07850]" />
          </div>
          {/* Crumbs */}
          <div className="absolute top-2 right-1/3 w-2 h-2 bg-[#A07850]/30 rounded-full" />
          <div className="absolute bottom-4 left-1/3 w-1.5 h-1.5 bg-[#A07850]/40 rounded-full" />
          <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-[#A07850]/50 rounded-full" />
        </div>

        {/* 404 Number */}
        <h1 className="font-display text-8xl sm:text-9xl text-[#F4538A] mb-2">
          404
        </h1>

        {/* Title */}
        <h2 className="font-display text-2xl sm:text-3xl text-[#2C1810] mb-4">
          Oops! Page Not Found
        </h2>

        {/* Message */}
        <p className="text-[#A07850] text-base sm:text-lg mb-8 leading-relaxed">
          Looks like this cookie crumbles! The page you&apos;re looking for 
          doesn&apos;t exist or has been moved to a new address.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button 
              variant="primary" 
              className="w-full sm:w-auto bg-[#F4538A] hover:bg-[#D63A72]"
            >
              <HomeIcon className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Link href="/shop">
            <Button 
              variant="outline" 
              className="w-full sm:w-auto border-2 border-[#E8D5C0] text-[#5C3D2E] hover:bg-[#F0E6D6]"
            >
              <SearchIcon className="w-4 h-4 mr-2" />
              Browse Shop
            </Button>
          </Link>
        </div>

        {/* Fun message */}
        <p className="mt-8 text-sm text-[#A07850]/70">
          Don&apos;t worry, we have plenty of fresh cookies waiting for you! 🍪
        </p>
      </div>
    </div>
  );
}
