"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TimeRemaining } from "@/domain/entities/drop";
import { useTranslations } from 'next-intl';

export interface CountdownTimerProps {
  timeRemaining?: TimeRemaining;
  targetDate?: Date;
  onComplete?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const TimeUnit: React.FC<{ value: number; label: string; size?: 'sm' | 'md' | 'lg' }> = ({
  value,
  label,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: {
      container: 'w-12 h-12 text-lg',
      label: 'text-[10px] mt-1',
    },
    md: {
      container: 'w-14 h-14 text-xl sm:w-20 sm:h-20 sm:text-3xl lg:w-24 lg:h-24 lg:text-5xl',
      label: 'text-xs mt-1.5',
    },
    lg: {
      container: 'w-16 h-16 text-2xl sm:w-24 sm:h-24 sm:text-4xl lg:w-32 lg:h-32 lg:text-6xl',
      label: 'text-sm mt-2',
    },
  };

  return (
    <div className="text-center">
      <div className={`bg-[#2C1810] text-white font-display rounded-2xl flex items-center justify-center tabular-nums shadow-lg ${sizeClasses[size].container}`}>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {String(value).padStart(2, "0")}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className={`font-bold uppercase tracking-widest text-[#5C3D2E] block ${sizeClasses[size].label}`}>
        {label}
      </span>
    </div>
  );
};

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  timeRemaining: propTimeRemaining,
  targetDate,
  onComplete,
  className = '',
  size = 'md',
}) => {
  const t = useTranslations();
  const [calculatedTimeRemaining, setCalculatedTimeRemaining] = React.useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  } | null>(null);

  // Calculate time remaining from targetDate
  React.useEffect(() => {
    if (!targetDate) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
      }

      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        total: diff,
      };
    };

    setCalculatedTimeRemaining(calculateTimeLeft());
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setCalculatedTimeRemaining(remaining);
      if (remaining.total <= 0 && onComplete) {
        onComplete();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  // Use prop timeRemaining if provided, otherwise use calculated
  const timeRemaining = propTimeRemaining || calculatedTimeRemaining;

  React.useEffect(() => {
    if (timeRemaining && timeRemaining.total <= 0 && onComplete) {
      onComplete();
    }
  }, [timeRemaining?.total, onComplete]);

  if (!timeRemaining || timeRemaining.total <= 0) {
    return (
      <div className={`text-center py-4 ${className}`}>
        <span className="text-[#F4538A] font-bold text-lg animate-pulse">
          {t("admin.drop.dropLive")}
        </span>
      </div>
    );
  }

  const separatorClasses = {
    sm: 'text-lg -mt-2',
    md: 'text-xl -mt-4 sm:text-3xl lg:text-4xl',
    lg: 'text-2xl -mt-4 sm:text-4xl lg:text-5xl',
  };

  return (
    <div className={`inline-flex items-center gap-1 sm:gap-2 lg:gap-4 ${className}`}>
      <TimeUnit value={timeRemaining.days} label={t("home.hero.days")} size={size} />
      <span className={`text-[#2C1810] font-display ${separatorClasses[size]}`}>:</span>
      <TimeUnit value={timeRemaining.hours} label={t("home.hero.hours")} size={size} />
      <span className={`text-[#2C1810] font-display ${separatorClasses[size]}`}>:</span>
      <TimeUnit value={timeRemaining.minutes} label={t("home.hero.mins")} size={size} />
      <span className={`text-[#2C1810] font-display ${separatorClasses[size]}`}>:</span>
      <TimeUnit value={timeRemaining.seconds} label={t("home.hero.secs")} size={size} />
    </div>
  );
};
