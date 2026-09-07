"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

interface OrdersHeaderProps {
  paws?: number;
  discount?: number;
}

export default function OrdersHeader({
  paws = 0,
  discount = 0,
}: OrdersHeaderProps) {
  const router = useRouter();
  const t = useTranslations();

  return (
    <div className="flex items-center justify-between w-full mb-8 pt-4 flex-wrap gap-4">
      {/* Left Group: Back Button & Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-[40px] h-[40px] rounded-full bg-[#E6E2D8] hover:bg-[#DCD7CC] transition flex items-center justify-center text-[#242424] shadow-sm shrink-0"
          title={t("orders.backAria")}
        >
          <span className="text-xl font-bold">←</span>
        </button>
        <h1 className="text-[28px] sm:text-[32px] md:text-[38px] font-bold text-[#242424] tracking-wide font-sans">
          {t("orders.title")}
        </h1>
      </div>

      {/* Right Group: Balance & Discount Widget */}
      <div className="flex items-center gap-3 bg-[#ECE8DE] px-4 py-2 rounded-full border border-[#DCD7CC] shadow-sm">
        <div className="flex items-center gap-1.5 border-r border-[#C8C2B4] pr-3">
          <span className="text-lg">🐾</span>
          <div className="flex flex-col text-[11px] leading-tight text-[#555555]">
            <span>{t("orders.pawsLabel")}</span>
            <span className="font-bold text-[#242424] text-[13px]">{paws}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-col text-[11px] leading-tight text-[#555555]">
            <span>{t("orders.discountLabel")}</span>
            <span className="font-bold text-[#242424] text-[13px]">
              {t("orders.discountAmount").replace("{value}", String(discount))}
            </span>
          </div>
          <div className="w-[26px] h-[20px] bg-[#D4A373] rounded flex items-center justify-center text-white text-[10px] font-bold shadow-inner">
            💳
          </div>
        </div>
      </div>
    </div>
  );
}
