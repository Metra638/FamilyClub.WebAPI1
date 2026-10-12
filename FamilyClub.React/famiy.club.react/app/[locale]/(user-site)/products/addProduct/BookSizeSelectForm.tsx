"use client";

import { BookSizeDto } from "@/lib/api/generated";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

type Props = {
  formats: BookSizeDto[];
  value?: number;
  onChange: (id?: number) => void;
};

export default function BookSizeSelectForm({
  value,
  onChange,
  formats,
}: Props) {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-0 w-full">
      <p className="text-[var(--foreground-primary)] font-sans-pro font-normal text-[18px] leading-[150%] tracking-[-0.011em]">
        {t("sellerProduct.printFormat")}
      </p>
      <select
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value ? Number(e.target.value) : undefined)
        }
        className={`input rounded-[9px] text-[12.5px] bg-[var(--background-elevated)] text-[var(--foreground-primary)] shadow-[var(--shadow-input)] h-[40px]`}
      >
        <option value="" className="text-[var(--color-muted-fg)]">
          {t("sellerProduct.selectPrintFormat")}
        </option>
        {formats.map((size) => (
          <option
            key={size.id}
            value={size.id}
            className="text-[var(--foreground-primary)]"
          >
            {size.name}
          </option>
        ))}
      </select>
    </div>
  );
}
