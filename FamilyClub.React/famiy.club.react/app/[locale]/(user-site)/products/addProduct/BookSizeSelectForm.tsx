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
      <p className="text-[var(--color-black)] font-sans-pro font-normal text-[18px] leading-[150%] tracking-[-0.011em]">
        {t("sellerProduct.printFormat")}
      </p>
      <select
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value ? Number(e.target.value) : undefined)
        }
        className={`input rounded-[9px] text-[12.5px] bg-[var(--color-white)] shadow-[0px_0px_10px_0px_#00000040] h-[40px]`}
      >
        <option value="" className="text-gray-400">
          {t("sellerProduct.selectPrintFormat")}
        </option>
        {formats.map((size) => (
          <option
            key={size.id}
            value={size.id}
            className="text-[var(--color-black)]"
          >
            {size.name}
          </option>
        ))}
      </select>
    </div>
  );
}
