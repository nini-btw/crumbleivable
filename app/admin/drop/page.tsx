"use client";

import * as React from "react";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { Button } from "@/presentation/components/ui/Button";
import { mockCookies } from "@/infrastructure/db/mock-data";

export default function AdminDropPage() {
  const [scheduledDate, setScheduledDate] = React.useState("");
  const [scheduledTime, setScheduledTime] = React.useState("");
  const [selectedProduct, setSelectedProduct] = React.useState("");

  const handleSchedule = () => {
    console.log("Scheduling drop:", { scheduledDate, scheduledTime, selectedProduct });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl text-brown-900">Weekly Drop</h1>
        <p className="text-brown-400 mt-1">
          Schedule your next cookie reveal with countdown
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Schedule Form */}
        <div className="bg-white rounded-3xl border border-brown-100 p-4 sm:p-6 space-y-6">
          <h2 className="font-bold text-brown-900 text-lg">Schedule New Drop</h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-brown-400 block mb-2">
                Select Cookie
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full bg-white border-2 border-[#E8D5C0] rounded-2xl px-4 py-3.5 text-[#2C1810] focus:outline-none focus:border-[#F4538A] focus:ring-2 focus:ring-[#F4538A]/20 cursor-pointer appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235C3D2E' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 16px center',
                }}
              >
                <option value="">Choose a cookie...</option>
                {mockCookies.map((cookie) => (
                  <option key={cookie.id} value={cookie.id}>
                    {cookie.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-brown-400 block mb-2">
                  Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-white border-2 border-[#E8D5C0] rounded-2xl pl-4 pr-12 py-3.5 text-[#2C1810] focus:outline-none focus:border-[#F4538A] focus:ring-2 focus:ring-[#F4538A]/20 cursor-pointer"
                  />
                  <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A07850] pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-brown-400 block mb-2">
                  Time
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full bg-white border-2 border-[#E8D5C0] rounded-2xl pl-4 pr-12 py-3.5 text-[#2C1810] focus:outline-none focus:border-[#F4538A] focus:ring-2 focus:ring-[#F4538A]/20 cursor-pointer"
                  />
                  <ClockIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A07850] pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          <Button fullWidth onClick={handleSchedule} className="cursor-pointer">
            Schedule Drop
          </Button>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-3xl border border-brown-100 p-4 sm:p-6">
          <h2 className="font-bold text-brown-900 text-lg mb-6">Preview</h2>

          <div className="bg-sand/30 rounded-2xl p-4 sm:p-6 text-center">
            <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-600 px-4 py-2 rounded-full mb-4">
              <span className="text-xs font-bold uppercase tracking-widest">
                Next Drop In
              </span>
            </div>

            <div className="inline-flex items-center gap-2 sm:gap-4">
              {["Days", "Hours", "Mins", "Secs"].map((label) => (
                <div key={label} className="text-center">
                  <div className="bg-brown-900 text-white font-display text-xl sm:text-3xl w-12 sm:w-16 h-12 sm:h-16 rounded-2xl flex items-center justify-center tabular-nums">
                    00
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brown-700 mt-1 block">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-4 bg-pink-50 rounded-xl">
            <p className="text-sm text-brown-700">
              The drop will be visible on the home page with a countdown timer.
              When the time arrives, the product will be automatically revealed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
