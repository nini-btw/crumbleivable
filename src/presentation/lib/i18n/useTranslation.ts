"use client";

import { useState, useEffect, useCallback } from "react";

export type Translations = Record<string, string | Record<string, unknown>>;

export function useTranslation() {
  const [translations, setTranslations] = useState<Translations>({});
  const [locale, setLocale] = useState<string>("en");
  const [isLoading, setIsLoading] = useState(true);

  const fetchTranslations = useCallback(async (lang: string) => {
    try {
      const response = await fetch(`/api/messages?locale=${lang}`);
      if (!response.ok) throw new Error("Failed to fetch translations");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching translations:", error);
      return {};
    }
  }, []);

  useEffect(() => {
    const savedLocale = localStorage.getItem("locale") || "en";
    setLocale(savedLocale);
    document.documentElement.dir = savedLocale === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = savedLocale;

    fetchTranslations(savedLocale).then((data) => {
      setTranslations(data);
      setIsLoading(false);
    });
  }, [fetchTranslations]);

  // Listen for locale changes
  useEffect(() => {
    const handleLocaleChange = (e: CustomEvent<string>) => {
      const newLocale = e.detail;
      setLocale(newLocale);
      document.documentElement.dir = newLocale === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = newLocale;

      fetchTranslations(newLocale).then((data) => {
        setTranslations(data);
      });
    };

    window.addEventListener("locale-change" as any, handleLocaleChange);
    return () => {
      window.removeEventListener("locale-change" as any, handleLocaleChange);
    };
  }, [fetchTranslations]);

  const t = useCallback(
    (key: string, params?: Record<string, string>) => {
      const keys = key.split(".");
      let value: unknown = translations;
      for (const k of keys) {
        value = (value as Record<string, unknown>)?.[k];
      }
      if (typeof value !== "string") return key;
      if (params) {
        return value.replace(/\{\{(\w+)\}\}/g, (_, k) => params[k] || `{{${k}}}`);
      }
      return value;
    },
    [translations]
  );

  const isRTL = locale === "ar";

  return { t, locale, isLoading, isRTL };
}
