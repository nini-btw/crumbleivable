"use client";

import { usePathname } from "next/navigation";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/presentation/store";
import { Header } from "@/presentation/components/features/Header";
import { Footer } from "@/presentation/components/features/Footer";
import { CartDrawer } from "@/presentation/components/features/CartDrawer";
import { ToastContainer } from "@/presentation/components/features/ToastContainer";
import "@/presentation/i18n/config";

/**
 * App providers wrapper
 * Provides Redux store and common UI components
 * Excludes Header/Footer for admin routes
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  return (
    <ReduxProvider store={store}>
      {!isAdminRoute && <Header />}
      <main>{children}</main>
      {!isAdminRoute && <Footer />}
      <CartDrawer />
      <ToastContainer />
    </ReduxProvider>
  );
}
