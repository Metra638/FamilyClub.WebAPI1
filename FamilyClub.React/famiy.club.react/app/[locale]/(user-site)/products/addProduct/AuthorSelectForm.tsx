"use client";

import { useState } from "react";
import type { AuthorDTO } from "@/lib/api/generated";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

type Props = {
  authors: AuthorDTO[];
  value?: number[];
  onChange: (ids: number[]) => void;
};

export default function AuthorSelectForm({
  authors,
  value = [],
  onChange,
}: Props) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  const toggle = (id: number) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const displayText =
    value.length > 0
      ? authors
          .filter((a) => value.includes(a.id!))
          .map((a) => a.authorName)
          .join(", ")
      : t("sellerProduct.authorPlaceholder");

  return (
    <>
      <p className="pt-3 text-[var(--color-black)] font-sans-pro font-normal text-[18px] leading-[150%] tracking-[-0.011em]">
        {t("sellerProduct.authors")}
      </p>
      <div className="relative w-full">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`w-full text-left rounded-[9px] bg-[var(--color-white)] shadow-[0px_0px_10px_0px_#00000040] h-[40px] px-3 truncate
    ${value.length > 0 ? "text-[var(--color-black)]" : "text-gray-500"}
  `}
        >
          {displayText}
        </button>

        {open && (
          <div className="absolute z-10 w-full mt-2 max-h-[180px] overflow-y-auto rounded-[9px] bg-[var(--color-white)] shadow-[0px_0px_15px_0px_#00000040]">
            {authors.map((a) => (
              <label
                key={a.id}
                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 text-[16px]"
              >
                <input
                  type="checkbox"
                  checked={value.includes(a.id!)}
                  onChange={() => toggle(a.id!)}
                  className="w-4 h-4"
                />
                {a.authorName}
              </label>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
