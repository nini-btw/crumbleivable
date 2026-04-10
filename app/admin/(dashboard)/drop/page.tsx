"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { CalendarIcon, ClockIcon, Trash2Icon, SparklesIcon, PackageIcon, AlertCircleIcon } from "lucide-react";
import { Button } from "@/presentation/components/ui/Button";
import type { CookiePiece, Product } from "@/domain/entities/product";
import type { WeeklyDrop } from "@/domain/entities/drop";

// Countdown Timer Component
function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setIsExpired(false);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (isExpired) {
    return (
      <div className="text-center py-4">
        <span className="text-[#F4538A] font-bold text-lg">🎉 Drop is Live!</span>
      </div>
    );
  }

  const timeUnits = [
    { value: timeLeft.days, label: "Days" },
    { value: timeLeft.hours, label: "Hours" },
    { value: timeLeft.minutes, label: "Mins" },
    { value: timeLeft.seconds, label: "Secs" },
  ];

  return (
    <div className="inline-flex items-center gap-2 sm:gap-4">
      {timeUnits.map((unit) => (
        <div key={unit.label} className="text-center">
          <div className="bg-[#2C1810] font-display flex h-12 w-12 items-center justify-center rounded-2xl text-xl text-white tabular-nums sm:h-16 sm:w-16 sm:text-3xl">
            {String(unit.value).padStart(2, "0")}
          </div>
          <span className="text-[#5C3D2E] mt-1 block text-[10px] font-bold tracking-widest uppercase">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// Active Drop Card Component
function ActiveDropCard({ 
  drop, 
  product, 
  onCancel 
}: { 
  drop: WeeklyDrop; 
  product: Product | null; 
  onCancel: () => void;
}) {
  const scheduledDate = new Date(drop.scheduledAt);
  const isRevealed = !!drop.revealedAt || new Date() >= scheduledDate;

  return (
    <div className="bg-white rounded-3xl border border-[#E8D5C0] p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-[#F4538A]" />
          <h2 className="font-bold text-[#2C1810] text-lg">Active Scheduled Drop</h2>
        </div>
        {isRevealed ? (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Revealed
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Scheduled
          </span>
        )}
      </div>

      <div className="bg-[#F0E6D6]/30 rounded-2xl p-4 text-center sm:p-6 mb-4">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#FFF0F5] px-4 py-2 text-[#F4538A]">
          <ClockIcon className="w-4 h-4" />
          <span className="text-xs font-bold tracking-widest uppercase">
            {isRevealed ? "Drop Went Live" : "Next Drop In"}
          </span>
        </div>
        <CountdownTimer targetDate={scheduledDate} />
      </div>

      {product && (
        <div className="flex items-center gap-4 p-4 bg-white border border-[#E8D5C0] rounded-2xl">
          <div className="w-16 h-16 bg-[#F0E6D6] rounded-xl overflow-hidden flex-shrink-0">
            {product.images?.[0] ? (
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <PackageIcon className="w-6 h-6 text-[#A07850]" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[#2C1810] truncate">{product.name}</h3>
            <p className="text-sm text-[#A07850]">{product.price} DA</p>
            <p className="text-xs text-[#A07850] truncate">{scheduledDate.toLocaleString()}</p>
          </div>
        </div>
      )}

      {!isRevealed && (
        <Button
          variant="ghost"
          fullWidth
          onClick={onCancel}
          className="mt-4 text-red-500 hover:bg-red-50"
        >
          <Trash2Icon className="w-4 h-4 mr-2" />
          Cancel Drop
        </Button>
      )}
    </div>
  );
}

// Empty State Component
function EmptyDropState() {
  return (
    <div className="bg-white rounded-3xl border border-[#E8D5C0] p-8 text-center">
      <div className="w-16 h-16 bg-[#F0E6D6] rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircleIcon className="w-8 h-8 text-[#A07850]" />
      </div>
      <h3 className="font-semibold text-[#2C1810] text-lg mb-2">No Active Drop</h3>
      <p className="text-[#A07850] text-sm">Schedule a new drop to see it here</p>
    </div>
  );
}

export default function AdminDropPage() {
  const [cookies, setCookies] = useState<CookiePiece[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [drops, setDrops] = useState<WeeklyDrop[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [previewDate, setPreviewDate] = useState<Date | null>(null);

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        const [cookiesRes, productsRes, dropsRes] = await Promise.all([
          fetch("/api/products/cookies"),
          fetch("/api/products"),
          fetch("/api/drops?all=true"),
        ]);

        const [cookiesData, productsData, dropsData] = await Promise.all([
          cookiesRes.json(),
          productsRes.json(),
          dropsRes.json(),
        ]);

        if (cookiesData.success) setCookies(cookiesData.data);
        if (productsData.success) setProducts(productsData.data);
        if (dropsData.success && Array.isArray(dropsData.data)) {
          setDrops(dropsData.data);
        } else {
          setDrops([]);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setDrops([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Update preview when date/time changes
  useEffect(() => {
    if (scheduledDate && scheduledTime) {
      setPreviewDate(new Date(`${scheduledDate}T${scheduledTime}`));
    } else {
      setPreviewDate(null);
    }
  }, [scheduledDate, scheduledTime]);

  const handleSchedule = async () => {
    if (!selectedProduct || !scheduledDate || !scheduledTime) {
      alert("Please select a cookie and set date/time");
      return;
    }

    try {
      const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`);
      
      const response = await fetch("/api/drops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct,
          scheduledAt: scheduledAt.toISOString(),
          isActive: true,
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert("Drop scheduled successfully!");
        setSelectedProduct("");
        setScheduledDate("");
        setScheduledTime("");
        setPreviewDate(null);
        // Refresh drops
        const dropsRes = await fetch("/api/drops?all=true");
        const dropsData = await dropsRes.json();
        if (dropsData.success && Array.isArray(dropsData.data)) {
          setDrops(dropsData.data);
        }
      } else {
        alert(result.error || "Failed to schedule drop");
      }
    } catch (error) {
      console.error("Failed to schedule drop:", error);
      alert("Failed to schedule drop");
    }
  };

  const handleCancelDrop = async (dropId: string) => {
    if (!confirm("Are you sure you want to cancel this drop?")) return;

    try {
      const response = await fetch(`/api/drops/${dropId}/cancel`, {
        method: "POST",
      });

      const result = await response.json();
      if (result.success) {
        setDrops(drops.filter(d => d.id !== dropId));
      } else {
        alert(result.error || "Failed to cancel drop");
      }
    } catch (error) {
      console.error("Failed to cancel drop:", error);
      alert("Failed to cancel drop");
    }
  };

  // Get active drop (most recent non-cancelled, not revealed)
  const activeDrop = drops
    .filter(d => !d.revealedAt && new Date(d.scheduledAt) > new Date())
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];

  const activeDropProduct = activeDrop 
    ? products.find(p => p.id === activeDrop.productId) || null
    : null;

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-[#2C1810] text-2xl sm:text-3xl">Weekly Drop</h1>
          <p className="text-[#A07850] mt-1">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-[#2C1810] text-2xl sm:text-3xl">Weekly Drop</h1>
        <p className="text-[#A07850] mt-1">Schedule your next cookie reveal with countdown</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        {/* Schedule Form */}
        <div className="border-[#E8D5C0] space-y-6 rounded-3xl border bg-white p-4 sm:p-6">
          <h2 className="text-[#2C1810] text-lg font-bold">Schedule New Drop</h2>

          <div className="space-y-4">
            <div>
              <label className="text-[#A07850] mb-2 block text-xs font-bold tracking-widest uppercase">
                Select Cookie
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full cursor-pointer appearance-none rounded-2xl border-2 border-[#E8D5C0] bg-white px-4 py-3.5 text-[#2C1810] focus:border-[#F4538A] focus:ring-2 focus:ring-[#F4538A]/20 focus:outline-none text-sm sm:text-base"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235C3D2E' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 16px center",
                }}
              >
                <option value="">Choose a cookie...</option>
                {cookies.map((cookie) => (
                  <option key={cookie.id} value={cookie.id}>
                    {cookie.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-[#A07850] mb-2 block text-xs font-bold tracking-widest uppercase">
                  Date
                </label>
                <div className="relative">
                  <input
                    id="dateInput"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full cursor-pointer appearance-none rounded-2xl border-2 border-[#E8D5C0] bg-white py-3.5 pr-12 pl-4 text-[#2C1810] scheme-light focus:border-[#F4538A] focus:ring-2 focus:ring-[#F4538A]/20 focus:outline-none text-sm sm:text-base [&::-webkit-calendar-picker-indicator]:hidden"
                  />

                  <CalendarIcon
                    onClick={() =>
                      (document.getElementById("dateInput") as HTMLInputElement)?.showPicker()
                    }
                    className="absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 cursor-pointer text-[#A07850]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#A07850] mb-2 block text-xs font-bold tracking-widest uppercase">
                  Time
                </label>

                <div className="relative">
                  <input
                    id="timeInput"
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full cursor-pointer appearance-none rounded-2xl border-2 border-[#E8D5C0] bg-white py-3.5 pr-12 pl-4 text-[#2C1810] scheme-light focus:border-[#F4538A] focus:ring-2 focus:ring-[#F4538A]/20 focus:outline-none text-sm sm:text-base [&::-webkit-calendar-picker-indicator]:hidden"
                  />

                  <ClockIcon
                    onClick={() =>
                      (document.getElementById("timeInput") as HTMLInputElement)?.showPicker()
                    }
                    className="absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 cursor-pointer text-[#A07850]"
                  />
                </div>
              </div>
            </div>
          </div>

          <Button 
            fullWidth 
            onClick={handleSchedule} 
            className="cursor-pointer bg-[#F4538A] hover:bg-[#D63A72]"
            disabled={!selectedProduct || !scheduledDate || !scheduledTime}
          >
            Schedule Drop
          </Button>
        </div>

        {/* Preview */}
        <div className="border-[#E8D5C0] rounded-3xl border bg-white p-4 sm:p-6">
          <h2 className="text-[#2C1810] mb-6 text-lg font-bold">Preview</h2>

          {previewDate ? (
            <div className="bg-[#F0E6D6]/30 rounded-2xl p-4 text-center sm:p-6">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#FFF0F5] px-4 py-2 text-[#F4538A]">
                <ClockIcon className="w-4 h-4" />
                <span className="text-xs font-bold tracking-widest uppercase">Countdown Preview</span>
              </div>
              <CountdownTimer targetDate={previewDate} />
              <p className="text-xs text-[#A07850] mt-4">
                Scheduled for {previewDate.toLocaleString()}
              </p>
            </div>
          ) : (
            <div className="bg-[#F0E6D6]/30 rounded-2xl p-8 text-center">
              <ClockIcon className="w-12 h-12 text-[#A07850] mx-auto mb-3" />
              <p className="text-[#A07850]">Select a date and time to see the preview</p>
            </div>
          )}

          <div className="mt-6 rounded-xl bg-[#FFF0F5] p-4">
            <p className="text-[#5C3D2E] text-sm">
              The drop will be visible on the home page with a countdown timer. When the time
              arrives, the product will be automatically revealed.
            </p>
          </div>
        </div>
      </div>

      {/* Active Drop Section */}
      <div className="space-y-4">
        <h2 className="font-bold text-[#2C1810] text-lg">Current Active Drop</h2>
        {activeDrop ? (
          <ActiveDropCard 
            drop={activeDrop} 
            product={activeDropProduct}
            onCancel={() => handleCancelDrop(activeDrop.id)}
          />
        ) : (
          <EmptyDropState />
        )}
      </div>
    </div>
  );
}
