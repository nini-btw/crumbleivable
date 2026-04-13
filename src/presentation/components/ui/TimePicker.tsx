"use client";

import * as React from "react";
import { ClockIcon, XIcon, ChevronUpIcon, ChevronDownIcon } from "lucide-react";
import { cn } from "@/presentation/lib/utils";

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "filled";
  clearable?: boolean;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  placeholder = "Select time...",
  label,
  className,
  size = "md",
  variant = "default",
  clearable = true,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  
  // Parse current value
  const [hours, setHours] = React.useState(() => {
    if (value) return parseInt(value.split(":")[0]) || 12;
    return 12;
  });
  const [minutes, setMinutes] = React.useState(() => {
    if (value) return parseInt(value.split(":")[1]) || 0;
    return 0;
  });
  const [period, setPeriod] = React.useState<"AM" | "PM">(() => {
    if (value) {
      const h = parseInt(value.split(":")[0]) || 0;
      return h >= 12 ? "PM" : "AM";
    }
    return "AM";
  });

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Update internal state when value changes externally
  React.useEffect(() => {
    if (value) {
      const [h, m] = value.split(":").map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        setHours(h === 0 ? 12 : h > 12 ? h - 12 : h);
        setMinutes(m);
        setPeriod(h >= 12 ? "PM" : "AM");
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

  const formatTime = (h: number, m: number, p: "AM" | "PM") => {
    let hour24 = h;
    if (p === "PM" && h !== 12) hour24 = h + 12;
    if (p === "AM" && h === 12) hour24 = 0;
    return `${String(hour24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const formatDisplayTime = (timeString: string): string => {
    if (!timeString) return "";
    const [h, m] = timeString.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return "";
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  const adjustHours = (delta: number) => {
    setHours(prev => {
      let newHours = prev + delta;
      if (newHours > 12) newHours = 1;
      if (newHours < 1) newHours = 12;
      return newHours;
    });
  };

  const adjustMinutes = (delta: number) => {
    setMinutes(prev => {
      let newMinutes = prev + delta;
      if (newMinutes > 59) newMinutes = 0;
      if (newMinutes < 0) newMinutes = 59;
      return newMinutes;
    });
  };

  const applyTime = () => {
    const timeString = formatTime(hours, minutes, period);
    onChange(timeString);
    setIsOpen(false);
  };

  // Quick time options
  const quickTimes = [
    { label: "12:00 AM", value: "00:00" },
    { label: "6:00 AM", value: "06:00" },
    { label: "9:00 AM", value: "09:00" },
    { label: "12:00 PM", value: "12:00" },
    { label: "3:00 PM", value: "15:00" },
    { label: "6:00 PM", value: "18:00" },
    { label: "9:00 PM", value: "21:00" },
    { label: "11:59 PM", value: "23:59" },
  ];

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
          <ClockIcon className="w-4 h-4 text-[#A07850]" />
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

      {/* Trigger */}
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
          {value ? formatDisplayTime(value) : placeholder}
        </span>

        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
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
          <ClockIcon className={cn("w-4 h-4 text-[#A07850]", isOpen && "text-[#F4538A]")} />
        </div>
      </div>

      {/* Time Picker Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-[#E8D5C0] shadow-xl z-50 p-4 min-w-[280px]">
          {/* Time Selector */}
          <div className="flex items-center justify-center gap-3 mb-4">
            {/* Hours */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => adjustHours(1)}
                className="p-1 rounded-lg hover:bg-[#F0E6D6] transition-colors"
              >
                <ChevronUpIcon className="w-5 h-5 text-[#5C3D2E]" />
              </button>
              <div className="w-14 h-12 flex items-center justify-center bg-[#F0E6D6] rounded-xl text-xl font-bold text-[#2C1810]">
                {String(hours).padStart(2, "0")}
              </div>
              <button
                type="button"
                onClick={() => adjustHours(-1)}
                className="p-1 rounded-lg hover:bg-[#F0E6D6] transition-colors"
              >
                <ChevronDownIcon className="w-5 h-5 text-[#5C3D2E]" />
              </button>
            </div>

            <span className="text-2xl font-bold text-[#A07850]">:</span>

            {/* Minutes */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => adjustMinutes(1)}
                className="p-1 rounded-lg hover:bg-[#F0E6D6] transition-colors"
              >
                <ChevronUpIcon className="w-5 h-5 text-[#5C3D2E]" />
              </button>
              <div className="w-14 h-12 flex items-center justify-center bg-[#F0E6D6] rounded-xl text-xl font-bold text-[#2C1810]">
                {String(minutes).padStart(2, "0")}
              </div>
              <button
                type="button"
                onClick={() => adjustMinutes(-1)}
                className="p-1 rounded-lg hover:bg-[#F0E6D6] transition-colors"
              >
                <ChevronDownIcon className="w-5 h-5 text-[#5C3D2E]" />
              </button>
            </div>

            {/* AM/PM */}
            <div className="flex flex-col gap-1 ml-2">
              <button
                type="button"
                onClick={() => setPeriod("AM")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  period === "AM"
                    ? "bg-[#F4538A] text-white"
                    : "bg-[#F0E6D6] text-[#5C3D2E] hover:bg-[#E8D5C0]"
                )}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => setPeriod("PM")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  period === "PM"
                    ? "bg-[#F4538A] text-white"
                    : "bg-[#F0E6D6] text-[#5C3D2E] hover:bg-[#E8D5C0]"
                )}
              >
                PM
              </button>
            </div>
          </div>

          {/* Quick Select */}
          <div className="border-t border-[#E8D5C0] pt-3 mb-3">
            <p className="text-xs text-[#A07850] mb-2 font-medium">Quick Select</p>
            <div className="grid grid-cols-4 gap-2">
              {quickTimes.map((time) => (
                <button
                  key={time.value}
                  type="button"
                  onClick={() => {
                    onChange(time.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "px-2 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    value === time.value
                      ? "bg-[#F4538A] text-white"
                      : "bg-[#F0E6D6] text-[#5C3D2E] hover:bg-[#E8D5C0]"
                  )}
                >
                  {time.label}
                </button>
              ))}
            </div>
          </div>

          {/* Apply Button */}
          <button
            type="button"
            onClick={applyTime}
            className="w-full py-2.5 text-sm font-bold text-white bg-[#F4538A] hover:bg-[#D63A72] rounded-xl transition-colors"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
};
