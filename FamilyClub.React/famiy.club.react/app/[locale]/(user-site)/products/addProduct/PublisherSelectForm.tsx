"use client";

import type { PublisherDto } from "@/lib/api/generated";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

type Props = {
  publishers: PublisherDto[];
  value?: number;
  onChange: (id?: number) => void;
};

export default function PublisherSelectForm({ publishers, value, onChange }: Props) {
  const t = useTranslations();

  return (
    <>
      <p className="pt-3 text-[var(--color-black)] font-sans-pro font-normal text-[18px] leading-[150%] tracking-[-0.011em]">
        {t("sellerProduct.publisher")}
      </p>
      <select
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value ? Number(e.target.value) : undefined)
        }
        className={`input rounded-[9px] px-2 bg-[var(--color-white)] shadow-[0px_0px_10px_0px_#00000040] h-[40px]
          ${!value ? "text-gray-500" : "text-[var(--color-black)]"}
        `}
      >
        <option value="">{t("sellerProduct.selectPublisher")}</option>
        {publishers.map((p) => (
          <option key={p.id} value={p.id}>
            {p.publisherName}
          </option>
        ))}
      </select>
    </>
  );
}
