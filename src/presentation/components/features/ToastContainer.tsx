"use client";

import * as React from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { XIcon, CheckCircleIcon, AlertCircleIcon, InfoIcon } from "lucide-react";
import { selectToasts, removeToast } from "@/presentation/store/ui/ui.slice";
import { toastSlide } from "@/presentation/lib/animations";

/**
 * Toast icon mapping
 */
const toastIcons = {
  success: <CheckCircleIcon className="w-5 h-5 text-green-500" />,
  error: <AlertCircleIcon className="w-5 h-5 text-red-500" />,
  info: <InfoIcon className="w-5 h-5 text-blue-500" />,
};

/**
 * Toast container component
 * Displays toast notifications
 */
export const ToastContainer: React.FC = () => {
  const toasts = useSelector(selectToasts);
  const dispatch = useDispatch();

  // Auto-dismiss toasts
  React.useEffect(() => {
    toasts.forEach((toast) => {
      const timer = setTimeout(() => {
        dispatch(removeToast(toast.id));
      }, 3000);
      return () => clearTimeout(timer);
    });
  }, [toasts, dispatch]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 md:top-6 md:bottom-auto z-[60] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            variants={toastSlide}
            initial="initial"
            animate="animate"
            exit="exit"
            className="bg-brown-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-medium min-w-[280px]"
          >
            {toast.type && toastIcons[toast.type]}
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => dispatch(removeToast(toast.id))}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
