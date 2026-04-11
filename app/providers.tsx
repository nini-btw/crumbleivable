"use client";

import { usePathname } from "next/navigation";
import { Provider as ReduxProvider } from "react-redux";
import { NextIntlClientProvider } from 'next-intl';
import { store } from "@/presentation/store";
import { Header } from "@/presentation/components/features/Header";
import { Footer } from "@/presentation/components/features/Footer";
import { CartDrawer } from "@/presentation/components/features/CartDrawer";
import { ToastContainer } from "@/presentation/components/features/ToastContainer";

interface ProvidersProps {
  children: React.ReactNode;
  locale: string;
  messages: Record<string, unknown>;
}

/**
 * App providers wrapper
 * Provides Redux store and common UI components
 * Excludes Header/Footer for admin routes
 */
export function Providers({ children, locale, messages }: ProvidersProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ReduxProvider store={store}>
        <ClientProviders>{children}</ClientProviders>
      </ReduxProvider>
    </NextIntlClientProvider>
  );
}

// Client-only wrapper for components that need usePathname
function ClientProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  return (
    <>
      {!isAdminRoute && <Header />}
      <main>{children}</main>
      {!isAdminRoute && <Footer />}
      <CartDrawer />
      <ToastContainer />
    </>
  );
}
