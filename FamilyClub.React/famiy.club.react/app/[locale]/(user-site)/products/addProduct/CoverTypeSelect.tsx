"use client";

import { CoverType } from "@/lib/api/generated";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

type Props = {
  value: CoverType;
  onChange: (value: CoverType) => void;
};

export default function CoverTypeSelect({ value, onChange }: Props) {
  const t = useTranslations();
  const coverTypeOptions = [
    { label: t("sellerProduct.hardCover"), value: CoverType.NUMBER_0 },
    { label: t("sellerProduct.softCover"), value: CoverType.NUMBER_1 },
  ];

  return (
    <div>
      <p className="text-[var(--color-black)] font-sans-pro font-normal text-[18px]">
        {t("sellerProduct.coverType")}
      </p>

      <div className="flex flex-row justify-around gap-2">
        {coverTypeOptions.map((cover) => (
          <label key={cover.value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="coverType"
              checked={value === cover.value}
              onChange={() => onChange(cover.value)}
              className="accent-black"
            />
            <span>{cover.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
