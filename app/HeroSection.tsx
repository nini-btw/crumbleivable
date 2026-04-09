"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/presentation/components/ui/Button";

const PANELS = [
  {
    src: "/images/chocoShips.png",
    headline: "Classic.",
    sub: "Chocolate Chip",
    bg: "#1a0a00",
    text: "#f7e4c0",
    accent: "#c9a84c",
  },
  {
    src: "/images/viola.png",
    headline: "Dreamy.",
    sub: "Red Velvet",
    bg: "#3b1a2c",
    text: "#fde8f0",
    accent: "#F4538A",
  },
  {
    src: "/images/pistash.png",
    headline: "Nutty.",
    sub: "White Chocolate Macadamia",
    bg: "#0f1f0e",
    text: "#e8f5e0",
    accent: "#7ab648",
  },
  {
    src: "/images/peanut.png",
    headline: "Irresistible.",
    sub: "Peanut Butter",
    bg: "#1e1000",
    text: "#faf0dc",
    accent: "#e0872a",
  },
];

const N = PANELS.length;

export default function HeroSection() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  // Use Framer Motion's useScroll for reliable scroll tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  // Smooth the progress
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Calculate which panel should be active based on scroll
  // 0-0.25 = panel 0, 0.25-0.5 = panel 1, etc.
  const currentPanel = useTransform(smoothProgress, [0, 1], [0, N - 1]);

  return (
    <div 
      ref={containerRef} 
      className="relative bg-[#1a0a00]"
      style={{ height: `${N * 100}vh` }}
    >
      {/* Sticky container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {PANELS.map((panel, index) => (
          <Panel 
            key={panel.src} 
            panel={panel} 
            index={index} 
            progress={smoothProgress}
            totalPanels={N}
          />
        ))}
        
        {/* CTA Overlay */}
        <CTAOverlay progress={smoothProgress} />
        
        {/* Scroll Hint */}
        <ScrollHint progress={smoothProgress} />
      </div>
    </div>
  );
}

function Panel({ 
  panel, 
  index, 
  progress,
  totalPanels 
}: { 
  panel: typeof PANELS[0]; 
  index: number; 
  progress: any;
  totalPanels: number;
}) {
  // Each panel takes 1/totalPanels of the scroll
  const start = index / totalPanels;
  const end = (index + 1) / totalPanels;
  
  // Panel 0 is always visible at start, others wipe in
  const clipPath = useTransform(
    progress,
    [start, end],
    index === 0 
      ? ["inset(0% 0% 0% 0%)", "inset(0% 0% 0% 0%)"]
      : ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"]
  );
  
  // For panel 0, fade out as we scroll to next
  const opacity = useTransform(
    progress,
    [start, start + 0.2, end - 0.1, end],
    index === 0 ? [1, 1, 1, 0] : [0, 1, 1, 1]
  );
  
  // Parallax effect for image
  const imgY = useTransform(
    progress,
    [start, end],
    ["0%", "-10%"]
  );
  
  const imgScale = useTransform(
    progress,
    [start, end],
    [1, 1.1]
  );

  return (
    <motion.div 
      className="absolute inset-0"
      style={{ 
        clipPath: index === 0 ? undefined : clipPath,
        opacity: index === 0 ? opacity : undefined,
        zIndex: index 
      }}
    >
      <div
        className="relative flex h-full w-full items-center justify-center overflow-hidden"
        style={{ background: panel.bg }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/50" />
        
        {/* Glow effect */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at center, ${panel.accent} 0%, transparent 60%)`,
          }}
        />
        
        {/* Cookie image with parallax */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ y: imgY, scale: imgScale }}
        >
          <div className="relative w-[50vw] h-[50vh] max-w-[500px] max-h-[500px]">
            <Image 
              src={panel.src} 
              alt={panel.sub} 
              fill 
              className="object-contain drop-shadow-2xl"
              priority={index < 2}
            />
          </div>
        </motion.div>

        {/* Text content */}
        <div className="pointer-events-none relative z-10 px-8 text-center select-none">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-4 text-sm font-light tracking-[0.4em] uppercase"
            style={{ color: panel.accent }}
          >
            {panel.sub}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="leading-none font-black tracking-tighter"
            style={{ 
              color: panel.text, 
              fontSize: "clamp(2.5rem,10vw,8rem)",
              textShadow: "0 4px 30px rgba(0,0,0,0.5)"
            }}
          >
            {panel.headline}
          </motion.h2>
        </div>

        {/* Panel number */}
        <span
          className="absolute right-6 bottom-6 text-xs font-light tracking-[0.3em] opacity-50 sm:right-10 sm:bottom-10"
          style={{ color: panel.text }}
        >
          0{index + 1} / 0{totalPanels}
        </span>
        
        {/* Vignette */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.6)_100%)]" />
      </div>
    </motion.div>
  );
}

function CTAOverlay({ progress }: { progress: any }) {
  // Show CTA in the last 15% of scroll
  const opacity = useTransform(progress, [0.82, 0.92], [0, 1]);
  const y = useTransform(progress, [0.82, 0.92], [50, 0]);
  const pointerEvents = useTransform(opacity, (v: number) => v > 0.5 ? "auto" : "none");

  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ opacity, pointerEvents }}
    >
      <motion.div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        style={{ opacity }}
      />
      <motion.div
        style={{ y }}
        className="relative z-10 flex flex-col items-center gap-6 px-8 text-center max-w-2xl"
      >
        <p className="text-xs font-light tracking-[0.4em] text-white/50 uppercase">
          Now baking in Wahran
        </p>
        <h1 className="text-4xl leading-[0.95] font-black tracking-tighter text-white sm:text-5xl lg:text-6xl">
          Every bite,<br />
          <span className="text-[#F4538A] italic">a story.</span>
        </h1>
        <p className="max-w-md text-base leading-relaxed text-white/60">
          Chewy, gooey American-style cookies delivered fresh to your door. 
          No account needed — just pick your favorites.
        </p>
        <div className="flex flex-col gap-4 pt-4 sm:flex-row">
          <Link href="/shop">
            <Button
              size="lg"
              className="group cursor-pointer rounded-full bg-white px-8 font-semibold text-[#1a0a00] shadow-xl transition-all duration-300 hover:bg-[#F4538A] hover:text-white hover:shadow-2xl hover:scale-105"
            >
              Shop Now <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/build">
            <Button
              variant="ghost"
              size="lg"
              className="cursor-pointer rounded-full border-2 border-white/30 px-8 text-white backdrop-blur-sm transition-all duration-300 hover:border-white hover:bg-white/10"
            >
              Build Your Box
            </Button>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ScrollHint({ progress }: { progress: any }) {
  const opacity = useTransform(progress, [0, 0.1], [1, 0]);
  
  return (
    <motion.div
      style={{ opacity }}
      className="pointer-events-none absolute bottom-10 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-3"
    >
      <span className="text-xs font-light tracking-[0.35em] text-white/50 uppercase">
        Scroll to explore
      </span>
      <motion.div
        animate={{ y: [0, 8, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="h-10 w-px bg-gradient-to-b from-white/60 to-transparent"
      />
    </motion.div>
  );
}
