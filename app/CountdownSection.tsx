"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlameIcon, LockIcon, SparklesIcon } from "lucide-react";
import { fadeInUp } from "@/presentation/lib/animations";
import { getTimeRemaining, type TimeRemaining, type WeeklyDrop } from "@/domain/entities/drop";
import { useTranslation } from "@/src/presentation/lib/i18n/useTranslation";

const defaultTimeRemaining: TimeRemaining = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  total: 1,
};

// Floating particle component
function Particle({ delay, x, size }: { delay: number; x: string; size: number }) {
  return (
    <motion.div
      className="pointer-events-none absolute bottom-0 rounded-full bg-[#F4538A] opacity-0"
      style={{ left: x, width: size, height: size }}
      animate={{
        y: [0, -120, -200],
        opacity: [0, 0.6, 0],
        scale: [0.5, 1, 0.3],
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        delay,
        repeat: Infinity,
        repeatDelay: 1 + Math.random() * 3,
        ease: "easeOut",
      }}
    />
  );
}

// Animated digit tile
function DigitTile({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-2 sm:gap-3">
      <div className="relative">
        {/* Glow behind tile */}
        <div className="absolute inset-0 scale-110 rounded-2xl bg-[#F4538A] opacity-20 blur-xl" />

        {/* Main tile */}
        <div className="relative flex h-16 w-16 flex-col overflow-hidden rounded-2xl border border-[#3D1F14] bg-[#1A0A06] shadow-2xl sm:h-20 sm:w-20 lg:h-24 lg:w-24">
          {/* Top half */}
          <div className="flex flex-1 items-end justify-center border-b border-[#2C1810] pb-px">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={display}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="font-display text-2xl leading-none text-white tabular-nums select-none sm:text-4xl lg:text-5xl"
              >
                {display}
              </motion.span>
            </AnimatePresence>
          </div>
          {/* Bottom half — static reflection */}
          <div className="flex flex-1 items-start justify-center overflow-hidden pt-px">
            <span className="font-display scale-y-[-1] text-2xl leading-none text-white/20 tabular-nums blur-[1px] select-none sm:text-4xl lg:text-5xl">
              {display}
            </span>
          </div>

          {/* Shine overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
        </div>
      </div>

      <span className="text-[9px] font-bold tracking-[0.2em] text-[#A07850] uppercase sm:text-[10px]">
        {label}
      </span>
    </div>
  );
}

// Separator dots
function Sep() {
  return (
    <div className="flex flex-col gap-1.5 pb-7 sm:pb-9">
      <motion.div
        className="h-1.5 w-1.5 rounded-full bg-[#F4538A] sm:h-2 sm:w-2"
        animate={{ opacity: [1, 0.2, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
      <motion.div
        className="h-1.5 w-1.5 rounded-full bg-[#F4538A] sm:h-2 sm:w-2"
        animate={{ opacity: [0.2, 1, 0.2] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
    </div>
  );
}

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  delay: i * 0.4,
  x: `${8 + (i / 11) * 84}%`,
  size: 3 + (i % 4),
}));

export default function CountdownSection() {
  const [mounted, setMounted] = React.useState(false);
  const [timeRemaining, setTimeRemaining] = React.useState<TimeRemaining>(defaultTimeRemaining);
  const [drop, setDrop] = React.useState<WeeklyDrop | null>(null);
  const [loading, setLoading] = React.useState(true);
  const { t, isRTL } = useTranslation();

  // Fetch current drop from API
  React.useEffect(() => {
    async function fetchDrop() {
      try {
        const response = await fetch("/api/drops");
        const result = await response.json();

        if (result.success && result.data) {
          setDrop(result.data);
          const remaining = getTimeRemaining(new Date(result.data.scheduledAt));
          setTimeRemaining(remaining);
        }
      } catch (error) {
        console.error("Failed to fetch drop:", error);
      } finally {
        setLoading(false);
        setMounted(true);
      }
    }

    fetchDrop();
  }, []);

  // Update countdown every second
  React.useEffect(() => {
    if (!drop) return;

    const interval = setInterval(() => {
      const remaining = getTimeRemaining(new Date(drop.scheduledAt));
      setTimeRemaining(remaining);
      if (remaining.total <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [drop]);

  const labels = [
    t("home.hero.days"),
    t("home.hero.hours"),
    t("home.hero.mins"),
    t("home.hero.secs"),
  ];

  const values = [
    timeRemaining.days,
    timeRemaining.hours,
    timeRemaining.minutes,
    timeRemaining.seconds,
  ];

  // Don't render if no drop or drop has ended
  if (!loading && (!drop || timeRemaining.total <= 0)) return null;

  const productName = drop?.product?.name || t("home.countdown.noDrop");

  return (
    <section
      className="relative overflow-hidden border-y border-[#2C1810] bg-[#0D0503] py-14 sm:py-20"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Background radial glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F4538A] opacity-[0.06] blur-[80px]" />
        <div className="absolute top-1/2 left-1/2 h-[200px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#A07850] opacity-[0.08] blur-[50px]" />
      </div>

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {PARTICLES.map((p) => (
          <Particle key={p.id} delay={p.delay} x={p.x} size={p.size} />
        ))}
      </div>

      {/* Decorative top/bottom lines */}
      <div className="absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent via-[#F4538A]/40 to-transparent" />
      <div className="absolute right-0 bottom-0 left-0 h-px bg-gradient-to-r from-transparent via-[#F4538A]/40 to-transparent" />

      <div className="relative mx-auto w-full max-w-[1400px] px-4 sm:px-8 lg:px-12">
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="flex flex-col items-center gap-8 text-center sm:gap-10"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full border border-[#F4538A]/30 bg-[#F4538A]/10 px-4 py-2 text-[#F4538A]"
          >
            <FlameIcon className="h-3.5 w-3.5" />
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase">
              {t("home.countdown.badge")}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-center gap-2 text-[#A07850]">
              <div className="h-px w-8 bg-[#3D1F14] sm:w-16" />
              <LockIcon className="h-3.5 w-3.5 opacity-60" />
              <div className="h-px w-8 bg-[#3D1F14] sm:w-16" />
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {t("home.countdown.title")}
              <span className="relative inline-block text-[#F4538A]">
                {t("home.countdown.highlight")}
                <motion.span
                  className="absolute -bottom-1 left-0 h-0.5 w-full origin-left bg-[#F4538A]"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
                />
              </span>
            </h2>
            <p className="mx-auto max-w-xs text-sm leading-relaxed text-[#A07850] sm:max-w-sm sm:text-base">
              {t("home.countdown.subtitle")}{" "}
              <span className="font-semibold text-[#F4538A]">{productName}</span>{" "}
              {t("home.countdown.productSuffix")}
            </p>
          </motion.div>

          {/* Countdown tiles */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex items-center gap-2 sm:gap-3 lg:gap-4"
          >
            {labels.map((label, i) => (
              <React.Fragment key={label}>
                <DigitTile value={mounted ? values[i] : 0} label={label} />
                {i < labels.length - 1 && <Sep />}
              </React.Fragment>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
