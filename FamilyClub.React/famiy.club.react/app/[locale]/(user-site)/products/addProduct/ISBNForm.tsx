"use client";

import { useTranslations } from "@/lib/i18n/LocaleProvider";

type Props = {
  value: string;
  loading: boolean;
  onChange: (v: string) => void;
  onLookup: () => void;
  isbnLoading: boolean;
};

export default function ISBNForm({
  value,
  loading,
  onChange,
  onLookup,
}: Props) {
  const t = useTranslations();

  return (
    <>
      <div className="flex items-baseline gap-2 h-[32px]">
        <span className="text-[18px]">ISBN</span>
        <span className="text-[var(--color-muted-fg)] text-[16px]">
          {t("sellerProduct.isbnDigits")}
        </span>
      </div>
      <div className="flex justify-between items-center w-full text-[14px]">
        <input
          maxLength={13}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="5649827409123"
          className="isbn-input rounded-[9px] bg-[var(--background-elevated)] text-[var(--foreground-primary)] shadow-[var(--shadow-input)] w-[120px] h-[40px] text-center"
        />
        <button
          type="button"
          onClick={onLookup}
          disabled={loading}
          className="isbn-btn rounded-[9px] bg-[var(--background-elevated)] text-[var(--foreground-primary)] shadow-[var(--shadow-input)] w-[200px] h-[40px]"
        >
          {loading
            ? t("sellerProduct.isbnSearch")
            : t("sellerProduct.isbnAutofill")}
        </button>
      </div>
    </>
  );
}
