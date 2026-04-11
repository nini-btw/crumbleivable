"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { CalendarIcon, ClockIcon, Trash2Icon, SparklesIcon, PackageIcon, AlertCircleIcon } from "lucide-react";
import { Button } from "@/presentation/components/ui/Button";
import { Select } from "@/presentation/components/ui/Select";
import type { CookiePiece, Product } from "@/domain/entities/product";
import type { WeeklyDrop } from "@/domain/entities/drop";
import { useTranslations, useLocale } from 'next-intl';
import { CountdownTimer } from "@/presentation/components/features/CountdownTimer";

// Active Drop Card Component
function ActiveDropCard({ 
  drop, 
  product, 
  onCancel,
  t 
}: { 
  drop: WeeklyDrop; 
  product: Product | null; 
  onCancel: () => void;
  t: (key: string) => string;
}) {
  const scheduledDate = new Date(drop.scheduledAt);
  const isRevealed = drop.revealedAt || new Date() >= scheduledDate;

  return (
    <div className="bg-white rounded-3xl border border-[#E8D5C0] p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-[#F4538A]" />
          <h2 className="font-bold text-[#2C1810] text-lg">{t('admin.drop.activeDrop')}</h2>
        </div>
        {isRevealed ? (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {t('admin.drop.revealed')}
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {t('admin.drop.scheduled')}
          </span>
        )}
      </div>

      <div className="bg-[#F0E6D6]/30 rounded-2xl p-4 text-center sm:p-6 mb-4">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#FFF0F5] px-4 py-2 text-[#F4538A]">
          <ClockIcon className="w-4 h-4" />
          <span className="text-xs font-bold tracking-widest uppercase">
            {isRevealed ? t('admin.drop.revealed') : t('admin.drop.countdownPreview')}
          </span>
        </div>
        <CountdownTimer targetDate={scheduledDate} size="sm" />
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
            <p className="text-sm text-[#A07850]">{product.price} {t('common.currency')}</p>
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
          {t('admin.drop.cancelDrop')}
        </Button>
      )}
    </div>
  );
}

// Empty State Component
function EmptyDropState({ t }: { t: (key: string) => string }) {
  return (
    <div className="bg-white rounded-3xl border border-[#E8D5C0] p-8 text-center">
      <div className="w-16 h-16 bg-[#F0E6D6] rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircleIcon className="w-8 h-8 text-[#A07850]" />
      </div>
      <h3 className="font-semibold text-[#2C1810] text-lg mb-2">{t('admin.drop.noActiveDrop')}</h3>
      <p className="text-[#A07850] text-sm">{t('admin.drop.noActiveDesc')}</p>
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
  const t = useTranslations();
  const locale = useLocale();
  const isRTL = locale === 'ar';

  // Prepare cookie options for Select
  const cookieOptions = cookies.map((cookie) => ({
    value: cookie.id,
    label: cookie.name,
  }));

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
      alert(t('admin.common.error'));
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
        alert(t('admin.common.success'));
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
        alert(result.error || t('admin.common.error'));
      }
    } catch (error) {
      console.error("Failed to schedule drop:", error);
      alert(t('admin.common.error'));
    }
  };

  const handleCancelDrop = async (dropId: string) => {
    if (!confirm(t('admin.common.confirm'))) return;

    try {
      const response = await fetch(`/api/drops/${dropId}/cancel`, {
        method: "POST",
      });

      const result = await response.json();
      if (result.success) {
        setDrops(drops.filter(d => d.id !== dropId));
      } else {
        alert(result.error || t('admin.common.error'));
      }
    } catch (error) {
      console.error("Failed to cancel drop:", error);
      alert(t('admin.common.error'));
    }
  };

  // Get active drop (most recent non-cancelled)
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
          <h1 className="font-display text-[#2C1810] text-2xl sm:text-3xl">{t('admin.drop.title')}</h1>
          <p className="text-[#A07850] mt-1">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div>
        <h1 className="font-display text-[#2C1810] text-2xl sm:text-3xl">{t('admin.drop.title')}</h1>
        <p className="text-[#A07850] mt-1">{t('admin.drop.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        {/* Schedule Form */}
        <div className="border-[#E8D5C0] space-y-6 rounded-3xl border bg-white p-4 sm:p-6">
          <h2 className="text-[#2C1810] text-lg font-bold">{t('admin.drop.scheduleNew')}</h2>

          <div className="space-y-4">
            <Select
              value={selectedProduct}
              onChange={setSelectedProduct}
              options={cookieOptions}
              label={t('admin.drop.selectCookie')}
              placeholder={t('admin.drop.chooseCookie')}
              size="md"
              variant="default"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-[#A07850] mb-2 block text-xs font-bold tracking-widest uppercase">
                  {t('admin.drop.date')}
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
                  {t('admin.drop.time')}
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
            {t('admin.drop.schedule')}
          </Button>
        </div>

        {/* Preview */}
        <div className="border-[#E8D5C0] rounded-3xl border bg-white p-4 sm:p-6">
          <h2 className="text-[#2C1810] mb-6 text-lg font-bold">{t('admin.drop.preview')}</h2>

          {previewDate ? (
            <div className="bg-[#F0E6D6]/30 rounded-2xl p-4 text-center sm:p-6">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#FFF0F5] px-4 py-2 text-[#F4538A]">
                <ClockIcon className="w-4 h-4" />
                <span className="text-xs font-bold tracking-widest uppercase">{t('admin.drop.countdownPreview')}</span>
              </div>
              <CountdownTimer targetDate={previewDate} size="sm" />
              <p className="text-xs text-[#A07850] mt-4">
                {t('admin.drop.scheduledFor')} {previewDate.toLocaleString()}
              </p>
            </div>
          ) : (
            <div className="bg-[#F0E6D6]/30 rounded-2xl p-8 text-center">
              <ClockIcon className="w-12 h-12 text-[#A07850] mx-auto mb-3" />
              <p className="text-[#A07850]">{t('admin.drop.selectDateTime')}</p>
            </div>
          )}

          <div className="mt-6 rounded-xl bg-[#FFF0F5] p-4">
            <p className="text-[#5C3D2E] text-sm">
              {t('admin.drop.dropInfo')}
            </p>
          </div>
        </div>
      </div>

      {/* Active Drop Section */}
      <div className="space-y-4">
        <h2 className="font-bold text-[#2C1810] text-lg">{t('admin.drop.activeDrop')}</h2>
        {activeDrop ? (
          <ActiveDropCard 
            drop={activeDrop} 
            product={activeDropProduct}
            onCancel={() => handleCancelDrop(activeDrop.id)}
            t={t}
          />
        ) : (
          <EmptyDropState t={t} />
        )}
      </div>
    </div>
  );
}
