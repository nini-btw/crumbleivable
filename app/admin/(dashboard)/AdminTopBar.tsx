"use client";

import * as React from "react";
import { MenuIcon, GlobeIcon } from "lucide-react";

interface AdminTopBarProps {
  onMenuClick: () => void;
  userEmail: string;
}

export const AdminTopBar: React.FC<AdminTopBarProps> = ({ onMenuClick, userEmail }) => {
  const [currentDate, setCurrentDate] = React.useState("");
  const [language, setLanguage] = React.useState<"en" | "fr">("en");

  React.useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const formatted = now.toLocaleDateString(language === "en" ? "en-US" : "fr-FR", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      setCurrentDate(formatted);
    };
    updateDate();
    const timer = setInterval(updateDate, 60000);
    return () => clearInterval(timer);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === "en" ? "fr" : "en");
  };

  return (
    <header className="lg:hidden bg-white border-b border-[#E8D5C0] px-4 py-3 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        {/* Menu Button */}
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 hover:bg-[#F0E6D6] rounded-lg transition-colors cursor-pointer"
          aria-label="Open menu"
        >
          <MenuIcon className="w-5 h-5 text-[#2C1810]" />
        </button>

        {/* Date */}
        <span className="text-sm font-medium text-[#5C3D2E]">
          {currentDate}
        </span>

        {/* Language Switch */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F0E6D6] hover:bg-[#E8D5C0] rounded-full transition-colors cursor-pointer"
        >
          <GlobeIcon className="w-4 h-4 text-[#5C3D2E]" />
          <span className="text-xs font-bold text-[#5C3D2E] uppercase">
            {language}
          </span>
        </button>
      </div>
    </header>
  );
};
