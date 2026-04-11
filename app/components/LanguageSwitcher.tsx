"use client";

import * as React from "react";
import { GlobeIcon, ChevronDownIcon } from "lucide-react";

type Locale = "en" | "fr" | "ar";

const languages: { code: Locale; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
];

// Client Language Switcher for public pages
export function ClientLanguageSwitcher() {
  const [locale, setLocale] = React.useState<Locale>("en");
  const [isOpen, setIsOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem("locale") as Locale;
    if (savedLang && languages.some(l => l.code === savedLang)) {
      setLocale(savedLang);
    }
  }, []);

  const currentLanguage = languages.find((l) => l.code === locale) || languages[0];

  const handleLanguageChange = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem("locale", newLocale);
    window.dispatchEvent(new CustomEvent("locale-change", { detail: newLocale }));
    setIsOpen(false);
    window.location.reload();
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) {
    return (
      <button className="flex items-center gap-2 px-3 py-2 bg-[#F0E6D6] rounded-xl">
        <GlobeIcon className="w-4 h-4 text-[#5C3D2E]" />
        <span className="text-sm font-medium text-[#5C3D2E]">🇬🇧 English</span>
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-[#F0E6D6] hover:bg-[#E8D5C0] rounded-xl transition-colors cursor-pointer"
      >
        <GlobeIcon className="w-4 h-4 text-[#5C3D2E]" />
        <span className="text-sm font-medium text-[#5C3D2E]">
          {currentLanguage.flag} {currentLanguage.label}
        </span>
        <ChevronDownIcon 
          className={`w-4 h-4 text-[#5C3D2E] transition-transform ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-[#E8D5C0] overflow-hidden z-50">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#F0E6D6] transition-colors ${
                locale === language.code ? "bg-[#FFF0F5]" : ""
              }`}
            >
              <span className="text-lg">{language.flag}</span>
              <span className="text-sm font-medium text-[#2C1810]">{language.label}</span>
              {locale === language.code && (
                <span className="ml-auto text-[#F4538A]">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Admin Language Switcher with dropdown
export function AdminLanguageSwitcher() {
  const [locale, setLocale] = React.useState<Locale>("en");
  const [isOpen, setIsOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem("locale") as Locale;
    if (savedLang && languages.some(l => l.code === savedLang)) {
      setLocale(savedLang);
    }
  }, []);

  const currentLanguage = languages.find((l) => l.code === locale) || languages[0];

  const handleLanguageChange = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem("locale", newLocale);
    window.dispatchEvent(new CustomEvent("locale-change", { detail: newLocale }));
    setIsOpen(false);
    window.location.reload();
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) {
    return (
      <button className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-white/70 w-full">
        <GlobeIcon className="w-5 h-5" />
        <span className="flex-1 text-left">Language</span>
        <span className="text-xs font-bold uppercase bg-white/20 px-2 py-0.5 rounded">EN</span>
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all w-full cursor-pointer"
      >
        <GlobeIcon className="w-5 h-5" />
        <span className="flex-1 text-left">Language</span>
        <span className="text-xs font-bold uppercase bg-white/20 px-2 py-0.5 rounded">
          {locale}
        </span>
        <ChevronDownIcon 
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl shadow-lg border border-[#E8D5C0] overflow-hidden z-50">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#F0E6D6] transition-colors ${
                locale === language.code ? "bg-[#FFF0F5]" : ""
              }`}
            >
              <span className="text-lg">{language.flag}</span>
              <span className="text-sm font-medium text-[#2C1810]">{language.label}</span>
              {locale === language.code && (
                <span className="ml-auto text-[#F4538A]">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
