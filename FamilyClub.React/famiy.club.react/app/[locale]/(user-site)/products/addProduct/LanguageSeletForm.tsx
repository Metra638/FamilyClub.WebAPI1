"use client";

import type { LanguageDto } from "@/lib/api/generated";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

type Props = {
  languages: LanguageDto[];
  value?: number;
  onChange: (id?: number) => void;
};

export default function LanguageSelectForm({ languages, value, onChange }: Props) {
  const t = useTranslations();

  return (
    <>
      <p className="text-[var(--color-black)] font-sans-pro font-normal text-[18px] leading-[150%] tracking-[-0.011em]">
        {t("sellerProduct.language")}
      </p>
      <select
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value ? Number(e.target.value) : undefined)
        }
        className="input text[15px] rounded-[9px] bg-[var(--color-white)] shadow-[0px_0px_10px_0px_#00000040] h-[40px]"
      >
        <option value="">{t("sellerProduct.selectLanguage")}</option>

        {languages.map((l) => (
          <option key={l.id} value={l.id}>
            {l.languageName}
          </option>
        ))}
      </select>
    </>
  );
}
