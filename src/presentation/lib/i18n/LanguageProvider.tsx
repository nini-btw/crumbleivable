"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

type Locale = "en" | "fr" | "ar";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = React.createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ 
  children, 
  initialLocale = "en",
  messages 
}: { 
  children: React.ReactNode; 
  initialLocale?: Locale;
  messages: Record<string, string>;
}) {
  const [locale, setLocaleState] = React.useState<Locale>(initialLocale);
  const router = useRouter();
  const pathname = usePathname();

  // Load locale from localStorage on client
  React.useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale;
    if (saved && ["en", "fr", "ar"].includes(saved)) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("locale", newLocale);
    
    // Update URL with new locale
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent("locale-change", { detail: newLocale }));
  };

  // Translation function - flatten nested keys
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === 'string' ? value : key;
  };

  const isRTL = locale === "ar";

  // Apply RTL to document
  React.useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dir = isRTL ? "rtl" : "ltr";
      document.documentElement.lang = locale;
    }
  }, [isRTL, locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = React.useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
