"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TimeRemaining } from "@/domain/entities/drop";
import { useTranslation } from "@/src/presentation/lib/i18n/useTranslation";

export interface CountdownTimerProps {
  timeRemaining: TimeRemaining;
  onComplete?: () => void;
}

const TimeUnit: React.FC<{ value: number; label: string; suppressHydration?: boolean }> = ({
  value,
  label,
  suppressHydration = true,
}) => (
  <div className="text-center">
    <div className="bg-[#2C1810] text-white font-display text-2xl sm:text-4xl lg:text-5xl w-14 sm:w-20 lg:w-24 h-14 sm:h-20 lg:h-24 rounded-2xl flex items-center justify-center tabular-nums shadow-lg">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.3 }}
          suppressHydrationWarning={suppressHydration}
        >
          {String(value).padStart(2, "0")}
        </motion.span>
      </AnimatePresence>
    </div>
    <span className="text-xs font-bold uppercase tracking-widest text-[#5C3D2E] mt-1.5 block">
      {label}
    </span>
  </div>
);

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  timeRemaining,
  onComplete,
}) => {
  const { t } = useTranslation();

  React.useEffect(() => {
    if (timeRemaining.total <= 0 && onComplete) {
      onComplete();
    }
  }, [timeRemaining.total, onComplete]);

  if (timeRemaining.total <= 0) {
    return (
      <div className="text-center py-4">
        <span className="text-[#F4538A] font-bold text-lg animate-pulse">
          {t("admin.drop.dropLive")}
        </span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 sm:gap-4">
      <TimeUnit value={timeRemaining.days} label={t("home.hero.days")} />
      <span className="text-[#2C1810] font-display text-xl sm:text-3xl lg:text-4xl -mt-4">
        :
      </span>
      <TimeUnit value={timeRemaining.hours} label={t("home.hero.hours")} />
      <span className="text-[#2C1810] font-display text-xl sm:text-3xl lg:text-4xl -mt-4">
        :
      </span>
      <TimeUnit value={timeRemaining.minutes} label={t("home.hero.mins")} />
      <span className="text-[#2C1810] font-display text-xl sm:text-3xl lg:text-4xl -mt-4">
        :
      </span>
      <TimeUnit value={timeRemaining.seconds} label={t("home.hero.secs")} />
    </div>
  );
};
