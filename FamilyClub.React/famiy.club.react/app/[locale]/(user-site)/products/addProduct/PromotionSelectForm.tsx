"use client";

import type { PromotionDto } from "@/lib/api/generated";
import { useLocale, useTranslations } from "@/lib/i18n/LocaleProvider";

type Props = {
  promotions: PromotionDto[];
  value?: number;
  price?: number;
  onChange: (id?: number) => void;
  onDiscountPriceChange: (price?: number) => void;
};

export default function PromotionSelectForm({
  promotions,
  value,
  price,
  onChange,
  onDiscountPriceChange,
}: Props) {
  const t = useTranslations();
  const { locale } = useLocale();

  const activePromotions = promotions.filter((p) => {
    if (!p.endDate) return true;

    return new Date(p.endDate) >= new Date();
  });

  const dateLocale = locale === "uk" ? "uk-UA" : "en-GB";

  return (
    <div className="w-[200px]" style={{ width: 200 }}>
      <p className="pt-3 text-[var(--color-black)] font-sans-pro font-normal text-[18px] leading-[150%] tracking-[-0.011em]">
        {t("sellerProduct.promotion")}
      </p>
      <select
        value={value ?? ""}
        style={{
          width: 200,
          maxWidth: 200,
        }}
        onChange={(e) => {
          const id = e.target.value ? Number(e.target.value) : undefined;
          onChange(id);

          const promo = activePromotions.find((p) => p.id === id);
          if (promo?.discountPercent != null && price != null) {
            onDiscountPriceChange(
              Math.round(price * (1 - promo.discountPercent / 100)),
            );
          }
        }}
        className={`w-[200px] rounded-[9px] text-[14px] px-2 bg-[var(--color-white)] shadow-[0px_0px_10px_0px_#00000040] h-[40px]
          ${!value ? "text-gray-500" : "text-[var(--color-black)]"}
        `}
      >
        <option value="" style={{ width: 200 }}>
          {t("sellerProduct.selectPromotion")}
        </option>
        {activePromotions.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name ?? `${p.id}`} — {p.discountPercent}%
            {p.endDate
              ? t("sellerProduct.promotionUntil").replace(
                  "{date}",
                  new Date(p.endDate).toLocaleDateString(dateLocale),
                )
              : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
