"use client";

import * as React from "react";
import { CalendarIcon, XIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/presentation/lib/utils";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "filled";
  clearable?: boolean;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = "Select date...",
  label,
  className,
  size = "md",
  variant = "default",
  clearable = true,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [currentMonth, setCurrentMonth] = React.useState(() => {
    // Initialize with value if provided, otherwise current date
    if (value) {
      return new Date(value);
    }
    return new Date();
  });
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Update current month when value changes
  React.useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setCurrentMonth(date);
      }
    }
  }, [value]);

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

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-3 text-base",
  };

  const variantClasses = {
    default: "bg-white border-[#E8D5C0] hover:border-[#F4538A]/50",
    outline: "bg-transparent border-[#E8D5C0] hover:border-[#F4538A]",
    filled: "bg-[#F0E6D6] border-transparent hover:bg-[#E8D5C0]",
  };

  // Format date for display
  const formatDisplayDate = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  // Generate calendar days
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days: (Date | null)[] = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === "prev") {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const isSelectedDate = (date: Date) => {
    if (!value) return false;
    const selected = new Date(value);
    return (
      date.getDate() === selected.getDate() &&
      date.getMonth() === selected.getMonth() &&
      date.getFullYear() === selected.getFullYear()
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const handleDateSelect = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    onChange(`${year}-${month}-${day}`);
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    handleDateSelect(today);
    setCurrentMonth(today);
  };

  const calendarDays = generateCalendarDays();

  if (!mounted) {
    return (
      <div className={cn("relative", className)}>
        {label && (
          <label className="block text-sm font-medium text-[#5C3D2E] mb-1.5">
            {label}
          </label>
        )}
        <div
          className={cn(
            "w-full rounded-full border-2 flex items-center justify-between transition-colors",
            sizeClasses[size],
            variantClasses[variant]
          )}
        >
          <span className="text-[#A07850]">{placeholder}</span>
          <CalendarIcon className="w-4 h-4 text-[#A07850]" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-[#5C3D2E] mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger - Using div to avoid nested button issues */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full rounded-full border-2 flex items-center justify-between transition-all duration-200 cursor-pointer select-none",
          sizeClasses[size],
          variantClasses[variant],
          isOpen && "border-[#F4538A] ring-2 ring-[#F4538A]/20"
        )}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setIsOpen(!isOpen);
          }
        }}
      >
        <span className={cn("font-medium truncate", value ? "text-[#2C1810]" : "text-[#A07850]")}>
          {value ? formatDisplayDate(value) : placeholder}
        </span>

        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          {/* Clear button - separate div to avoid nesting */}
          {clearable && value && (
            <div
              onClick={handleClear}
              className="p-0.5 rounded-full hover:bg-[#F0E6D6] transition-colors"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleClear(e as unknown as React.MouseEvent);
                }
              }}
            >
              <XIcon className="w-3.5 h-3.5 text-[#A07850]" />
            </div>
          )}
          <CalendarIcon className={cn("w-4 h-4 text-[#A07850]", isOpen && "text-[#F4538A]")} />
        </div>
      </div>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-[#E8D5C0] shadow-xl z-50 p-4 min-w-[280px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => navigateMonth("prev")}
              className="p-1.5 rounded-lg hover:bg-[#F0E6D6] transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5 text-[#5C3D2E]" />
            </button>
            <span className="font-bold text-[#2C1810]">
              {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button
              type="button"
              onClick={() => navigateMonth("next")}
              className="p-1.5 rounded-lg hover:bg-[#F0E6D6] transition-colors"
            >
              <ChevronRightIcon className="w-5 h-5 text-[#5C3D2E]" />
            </button>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-bold text-[#A07850] uppercase tracking-wider py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={index} className="h-9 w-9" />;
              }

              const selected = isSelectedDate(date);
              const today = isToday(date);

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateSelect(date)}
                  className={cn(
                    "h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200",
                    selected
                      ? "bg-[#F4538A] text-white shadow-md"
                      : today
                      ? "bg-[#FFF0F5] text-[#F4538A] border-2 border-[#F4538A]"
                      : "text-[#2C1810] hover:bg-[#F0E6D6]"
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Today Button */}
          <div className="mt-4 pt-3 border-t border-[#E8D5C0]">
            <button
              type="button"
              onClick={handleToday}
              className="w-full py-2 text-sm font-medium text-[#F4538A] hover:bg-[#FFF0F5] rounded-xl transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
