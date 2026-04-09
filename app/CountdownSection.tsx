"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { FlameIcon } from "lucide-react";
import { CountdownTimer } from "@/presentation/components/features/CountdownTimer";
import { fadeInUp } from "@/presentation/lib/animations";
import { getTimeRemaining } from "@/domain/entities/drop";

const mockDrop = {
  product: { name: "Funfetti Birthday Cake" },
  scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
};

export default function CountdownSection() {
  const [timeRemaining, setTimeRemaining] = React.useState(() =>
    getTimeRemaining(new Date(mockDrop.scheduledAt))
  );

  React.useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getTimeRemaining(new Date(mockDrop.scheduledAt));
      setTimeRemaining(remaining);

      if (remaining.total <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
