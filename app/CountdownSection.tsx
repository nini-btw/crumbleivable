"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { FlameIcon } from "lucide-react";
import { CountdownTimer } from "@/presentation/components/features/CountdownTimer";
import { fadeInUp } from "@/presentation/lib/animations";
import { getTimeRemaining, type TimeRemaining } from "@/domain/entities/drop";

const mockDrop = {
  product: { name: "Funfetti Birthday Cake" },
  scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
};

// Default/empty state for SSR to avoid hydration mismatch
const defaultTimeRemaining: TimeRemaining = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  total: 1, // > 0 so it renders initially
};

export default function CountdownSection() {
  const [mounted, setMounted] = React.useState(false);
  const [timeRemaining, setTimeRemaining] = React.useState<TimeRemaining>(defaultTimeRemaining);

  React.useEffect(() => {
    setMounted(true);
    // Calculate initial time on client only
    setTimeRemaining(getTimeRemaining(new Date(mockDrop.scheduledAt)));

    const interval = setInterval(() => {
      const remaining = getTimeRemaining(new Date(mockDrop.scheduledAt));
      setTimeRemaining(remaining);

      if (remaining.total <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Don't render timer until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <section className="py-16 bg-white border-y border-[#E8D5C0]">
        <div className="mx-auto w-full px-4 sm:px-8 lg:px-12 max-w-[1400px]">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-[#FFF0F5] text-[#F4538A] px-4 py-2 rounded-full mb-6">
              <FlameIcon className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">
                Next Drop In
              </span>
            </div>
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 sm:gap-4">
                {["Days", "Hours", "Mins", "Secs"].map((label) => (
                  <div key={label} className="text-center">
                    <div className="bg-[#2C1810] font-display flex h-14 w-14 items-center justify-center rounded-2xl text-xl text-white tabular-nums sm:h-20 sm:w-20 sm:text-4xl lg:h-24 lg:w-24 lg:text-5xl">
                      00
                    </div>
                    <span className="text-[#5C3D2E] mt-1.5 block text-xs font-bold uppercase tracking-widest">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (timeRemaining.total <= 0) return null;

  return (
    <section className="py-16 bg-white border-y border-[#E8D5C0]">
      <div className="mx-auto w-full px-4 sm:px-8 lg:px-12 max-w-[1400px]">
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 bg-[#FFF0F5] text-[#F4538A] px-4 py-2 rounded-full mb-6">
            <FlameIcon className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">
              Next Drop In
            </span>
          </div>

          <div className="flex justify-center">
            <CountdownTimer timeRemaining={timeRemaining} />
          </div>

          {mockDrop.product && (
            <p className="mt-6 text-[#5C3D2E] text-sm sm:text-base">
              Coming soon:{" "}
              <span className="text-[#2C1810] font-bold">
                {mockDrop.product.name}
              </span>
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
