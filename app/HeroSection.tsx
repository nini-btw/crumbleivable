"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/presentation/components/ui/Button";

const PANELS = [
  {
    src: "/images/chocoShips.png",
    headline: "Classic.",
    sub: "Chocolate Chip",
    bg: "#0d0500",
    text: "#f7e4c0",
    accent: "#c9a84c",
  },
  {
    src: "/images/viola.png",
    headline: "Dreamy.",
    sub: "Red Velvet",
    bg: "#1a0612",
    text: "#fde8f0",
    accent: "#F4538A",
  },
  {
    src: "/images/pistash.png",
    headline: "Nutty.",
    sub: "White Choc Macadamia",
    bg: "#060f05",
    text: "#e8f5e0",
    accent: "#7ab648",
  },
  {
    src: "/images/peanut.png",
    headline: "Irresistible.",
    sub: "Peanut Butter",
    bg: "#0d0700",
    text: "#faf0dc",
    accent: "#e0872a",
  },
];

const N = PANELS.length;
const CTA_EXTRA = 1.5;
const TOTAL = N + CTA_EXTRA;
const CTA_START = N / TOTAL;
const CTA_FULL = (N + 0.4) / TOTAL;

const MOBILE_CTA_EXTRA = 0.6;
const MOBILE_TOTAL = N + MOBILE_CTA_EXTRA;
const MOBILE_CTA_START = N / MOBILE_TOTAL;
const MOBILE_CTA_FULL = (N + 0.4) / MOBILE_TOTAL;

export default function HeroSection() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const total = isMobile ? MOBILE_TOTAL : TOTAL;
  const ctaStart = isMobile ? MOBILE_CTA_START : CTA_START;
  const ctaFull = isMobile ? MOBILE_CTA_FULL : CTA_FULL;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
    restDelta: 0.001,
  });

  return (
    <div
      ref={containerRef}
      id="hero-section"
      className="relative"
      style={{ height: `${total * 100}svh` }}
    >
      <div className="sticky top-0 w-full overflow-hidden" style={{ height: "100svh" }}>
        {PANELS.map((panel, index) => (
          <Panel
            key={panel.src}
            panel={panel}
            index={index}
            progress={smoothProgress}
            total={total}
            ctaStart={ctaStart}
          />
        ))}
        <CTAOverlay progress={smoothProgress} ctaStart={ctaStart} ctaFull={ctaFull} />
        <ScrollHint progress={smoothProgress} />
        <PanelCounter progress={smoothProgress} total={total} ctaStart={ctaStart} />
      </div>
    </div>
  );
}

/* ─────────────────────────── COOKIE PANEL ─────────────────────────── */
function Panel({
  panel,
  index,
  progress,
  total,
  ctaStart,
}: {
  panel: (typeof PANELS)[0];
  index: number;
  progress: any;
  total: number;
  ctaStart: number;
}) {
  const start = index / total;
  const end = (index + 1) / total;

  const clipPath = useTransform(
    progress,
    [start, Math.min(start + 0.06, end)],
    index === 0
      ? ["inset(0% 0% 0% 0%)", "inset(0% 0% 0% 0%)"]
      : ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"]
  );

  const imgY = useTransform(progress, [start, end], ["0%", "-18%"]);
  const imgScale = useTransform(progress, [start, end], [1.08, 1.22]);

  const textY = useTransform(
    progress,
    [start, start + 0.06, end - 0.05, end],
    ["60px", "0px", "-20px", "-60px"]
  );
  const textOpacity = useTransform(progress, [start, start + 0.06, end - 0.06, end], [0, 1, 1, 0]);

  const panelOpacity = index === 0 ? useTransform(progress, [end - 0.04, end], [1, 0]) : undefined;

  return (
    <motion.div
      className="absolute inset-0"
      style={{ clipPath: index === 0 ? undefined : clipPath, opacity: panelOpacity, zIndex: index }}
    >
      <div
        className="relative flex h-full w-full items-end overflow-hidden"
        style={{ background: panel.bg }}
      >
        <motion.div className="absolute inset-0" style={{ y: imgY, scale: imgScale }}>
          <Image
            src={panel.src}
            alt={panel.sub}
            fill
            className="object-cover object-center"
            priority={index < 2}
            sizes="100vw"
          />
        </motion.div>
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, ${panel.bg}f0 0%, ${panel.bg}b0 28%, ${panel.bg}40 55%, transparent 100%)`,
          }}
        />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(ellipse at 50% 110%, ${panel.accent}88 0%, transparent 65%)`,
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.75)_100%)]" />

        <motion.div
          className="relative z-10 w-full px-8 pb-20 sm:px-14 sm:pb-24 lg:px-20 lg:pb-28"
          style={{ y: textY, opacity: textOpacity }}
        >
          <p
            className="mb-3 text-[10px] font-semibold tracking-[0.45em] uppercase sm:text-xs"
            style={{ color: panel.accent }}
          >
            {panel.sub}
          </p>
          <h2
            className="leading-[0.88] font-black tracking-tighter"
            style={{
              color: panel.text,
              fontSize: "clamp(4.5rem, 16vw, 14rem)",
              textShadow: `0 8px 60px ${panel.bg}cc, 0 2px 8px rgba(0,0,0,0.8)`,
            }}
          >
            {panel.headline}
          </h2>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────── CTA OVERLAY ─────────────────────────── */
function CTAOverlay({
  progress,
  ctaStart,
  ctaFull,
}: {
  progress: any;
  ctaStart: number;
  ctaFull: number;
}) {
  const opacity = useTransform(progress, [ctaStart, ctaFull], [0, 1]);
  const pointerEvents = useTransform(opacity, (v: number) => (v > 0.4 ? "auto" : "none"));

  const leftY = useTransform(progress, [ctaStart, ctaFull], [70, 0]);
  const rightScale = useTransform(progress, [ctaStart, ctaFull], [0.88, 1]);
  const rightOpacity = useTransform(progress, [ctaStart + 0.04, ctaFull], [0, 1]);
  const rightY = useTransform(progress, [ctaStart, ctaFull], [40, 0]);

  return (
    <motion.div className="absolute inset-0 z-50" style={{ opacity, pointerEvents }}>
      {/* ── BACKGROUND ── */}
      <div className="absolute inset-0 bg-[#FDF6EE]" />
      <div
        className="absolute -top-40 -right-40 h-175 w-175 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #F4538A 0%, #FFD6E7 45%, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-24 -left-24 h-112.5 w-112.5 rounded-full opacity-35"
        style={{ background: "radial-gradient(circle, #F0E6D6 0%, transparent 70%)" }}
      />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: "radial-gradient(circle, #2C1810 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* ── SPLIT LAYOUT ── */}
      <div className="relative z-10 flex h-full w-full flex-col lg:flex-row">
        {/* LEFT: Copy + CTA — full width on mobile, half on desktop */}
        <motion.div
          style={{ y: leftY }}
          className="flex flex-1 flex-col justify-center px-6 pt-16 pb-12 sm:px-14 lg:px-20 lg:pt-0 lg:pb-0"
        >
          <p
            className="mb-5 text-[10px] font-bold tracking-[0.5em] uppercase"
            style={{ color: "#F4538A" }}
          >
            Now baking in Wahran
          </p>

          <h1
            className="mb-6 leading-[0.9] font-black tracking-tighter"
            style={{ fontSize: "clamp(2.8rem, 8vw, 7rem)", color: "#2C1810" }}
          >
            Every bite, <span style={{ color: "#F4538A", fontStyle: "italic" }}>a story.</span>
          </h1>

          <p
            className="mb-10 max-w-sm text-base leading-relaxed font-light"
            style={{ color: "#5C3D2E" }}
          >
            Chewy, gooey American-style cookies delivered fresh to your door. No account needed —
            just pick your favorites,{" "}
            <span className="font-semibold italic" style={{ color: "#F4538A" }}>
              and we will bake it happen.
            </span>
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row md:mt-0 lg:justify-start">
            <Link href="/shop" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="group w-full cursor-pointer rounded-full px-8 font-bold text-white transition-all duration-200 hover:scale-105"
                style={{ background: "#F4538A", boxShadow: "0 8px 24px rgba(244,83,138,0.4)" }}
              >
                Shop Now{" "}
                <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/build" className="w-full sm:w-auto">
              <Button
                variant="ghost"
                size="lg"
                className="w-full cursor-pointer rounded-full border-2 px-8 font-bold transition-all duration-200 hover:scale-105"
                style={{ borderColor: "#F4538A", color: "#F4538A", background: "transparent" }}
              >
                Build Your Box
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Divider — desktop only */}
        <div className="my-16 hidden w-px shrink-0 lg:block" style={{ background: "#E8D5C0" }} />

        {/* RIGHT: Glamour box shot — desktop only */}
        <motion.div
          style={{ scale: rightScale, opacity: rightOpacity, y: rightY }}
          className="hidden w-[48%] shrink-0 flex-col items-center justify-center px-10 py-8 lg:flex"
          aria-hidden="true"
        >
          <div className="relative w-full">
            <div
              className="absolute inset-0 -z-10 scale-90 rounded-full opacity-40 blur-3xl"
              style={{
                background: "radial-gradient(ellipse, #F4538A 0%, #FFD6E7 50%, transparent 75%)",
              }}
            />

            <motion.div
              animate={{ rotate: [-1.5, 1.5, -1.5], y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative mx-auto w-full max-w-130"
              style={{
                filter:
                  "drop-shadow(0 32px 48px rgba(244,83,138,0.25)) drop-shadow(0 8px 16px rgba(44,24,16,0.15))",
              }}
            >
              <Image
                src="/images/box1.png"
                alt="Crumbleivable! pink cookie box — Bake it happen"
                width={520}
                height={360}
                className="w-full object-contain"
                sizes="(max-width: 1024px) 0vw, 48vw"
                priority
              />
            </motion.div>

            <motion.div
              animate={{ rotate: [0, 12, 0], y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-10 -right-6 h-20 w-20 overflow-hidden rounded-full shadow-xl"
              style={{ border: "3px solid #FFD6E7", background: "#FFF0F5" }}
            >
              <Image
                src="/images/chocoShips.png"
                alt=""
                fill
                className="scale-125 object-cover"
                sizes="80px"
              />
            </motion.div>

            <motion.div
              animate={{ rotate: [0, -10, 0], y: [0, 8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.8 }}
              className="absolute bottom-6 -left-4 h-16 w-16 overflow-hidden rounded-full shadow-lg"
              style={{ border: "3px solid #FFD6E7", background: "#FFF0F5" }}
            >
              <Image
                src="/images/viola.png"
                alt=""
                fill
                className="scale-125 object-cover"
                sizes="64px"
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────── PANEL COUNTER ─────────────────────────── */
function PanelCounter({
  progress,
  total,
  ctaStart,
}: {
  progress: any;
  total: number;
  ctaStart: number;
}) {
  const opacity = useTransform(progress, [ctaStart - 0.04, ctaStart], [1, 0]);
  return (
    <motion.div
      style={{ opacity }}
      className="pointer-events-none absolute right-8 bottom-8 z-50 flex flex-col items-end gap-1.5 sm:right-12 sm:bottom-12"
    >
      {PANELS.map((_, i) => {
        const start = i / total;
        const end = (i + 1) / total;
        const w = useTransform(
          progress,
          [start, start + 0.05, end - 0.05, end],
          ["12px", "32px", "32px", "12px"]
        );
        const o = useTransform(progress, [start, start + 0.05, end - 0.05, end], [0.2, 1, 1, 0.2]);
        return <motion.div key={i} style={{ width: w, opacity: o }} className="h-px bg-white" />;
      })}
    </motion.div>
  );
}

/* ─────────────────────────── SCROLL HINT ─────────────────────────── */
function ScrollHint({ progress }: { progress: any }) {
  const opacity = useTransform(progress, [0, 0.06], [1, 0]);
  return (
    <motion.div
      style={{ opacity }}
      className="pointer-events-none absolute bottom-10 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-3"
    >
      <span className="text-[9px] font-bold tracking-[0.5em] text-white/40 uppercase">Scroll</span>
      <motion.div
        animate={{ y: [0, 10, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className="h-12 w-px bg-linear-to-b from-white/70 to-transparent"
      />
    </motion.div>
  );
}
