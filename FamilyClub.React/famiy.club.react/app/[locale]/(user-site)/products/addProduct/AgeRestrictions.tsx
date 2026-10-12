"use client";

import { AgeRestrictionDto } from "@/lib/api/generated";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

type Props = {
  ageRestrictions: AgeRestrictionDto[];
  value?: number;
  onChange: (id?: number) => void;
};

export default function AgeRestrictions({ value, onChange, ageRestrictions }: Props) {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-0 w-full">
      <p className="text-[var(--foreground-primary)] font-sans-pro font-normal text-[18px] leading-[150%] tracking-[-0.011em]">
        {t("sellerProduct.ageRestrictions")}
      </p>
      <select
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value ? Number(e.target.value) : undefined)
        }
        className="input text-[14px] rounded-[9px] bg-[var(--background-elevated)] text-[var(--foreground-primary)] shadow-[var(--shadow-input)] h-[40px]"
      >
        <option value="">{t("sellerProduct.selectAge")}</option>

        {ageRestrictions.map((age) => (
          <option key={age.id} value={age.id}>
            {age.name}
          </option>
        ))}
      </select>
    </div>
  );
}
