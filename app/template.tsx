"use client";

import { motion, AnimatePresence } from "framer-motion";
import { pageTransition } from "@/presentation/lib/animations";

/**
 * Page transition template
 * Wraps all pages with Framer Motion transitions
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
      {children}
    </motion.div>
  );
}
