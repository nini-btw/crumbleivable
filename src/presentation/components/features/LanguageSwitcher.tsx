"use client";

import * as React from "react";
import { GlobeIcon, CheckIcon } from "lucide-react";
import { useTranslation } from "@/src/presentation/lib/i18n/useTranslation";

const languages = [
  { code: "en", label: "English", flag: "🇬🇧", dir: "ltr" },
  { code: "fr", label: "Français", flag: "🇫🇷", dir: "ltr" },
  { code: "ar", label: "العربية", flag: "🇸🇦", dir: "rtl" },
];

export function LanguageSwitcher() {
  const { locale } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentLocale, setCurrentLocale] = React.useState(locale || "en");
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Sync with localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem("locale") || "en";
    setCurrentLocale(saved);
  }, [locale]);

  const currentLang = languages.find((l) => l.code === currentLocale) || languages[0];

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode: string, dir: string) => {
    localStorage.setItem("locale", langCode);
    setCurrentLocale(langCode);
    document.documentElement.dir = dir;
    document.documentElement.lang = langCode;
    window.dispatchEvent(new CustomEvent("locale-change", { detail: langCode }));
    setIsOpen(false);
    window.location.reload();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#F0E6D6] hover:bg-[#FFF0F5] transition-colors cursor-pointer"
        aria-label="Change language"
      >
        <GlobeIcon className="w-4 h-4 text-[#5C3D2E]" />
        <span className="text-sm font-medium text-[#5C3D2E]">
          {currentLang.flag}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-[#E8D5C0] py-2 z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code, lang.dir)}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                currentLang.code === lang.code
                  ? "bg-[#FFF0F5] text-[#F4538A]"
                  : "text-[#5C3D2E] hover:bg-[#FDF6EE]"
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span className={lang.code === "ar" ? "font-arabic" : ""}>
                  {lang.label}
                </span>
              </span>
              {currentLang.code === lang.code && (
                <CheckIcon className="w-4 h-4" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
