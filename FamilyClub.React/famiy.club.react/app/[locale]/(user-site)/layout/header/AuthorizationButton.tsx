"use client";

import { useTranslations } from "@/lib/i18n/LocaleProvider";

export default function AuthorizationButton() {
  const t = useTranslations();

  return (
    <>
      <button className="w-[95px] h-[24px] text-[var(--color-black)] font-normal text-[16px] leading-[150%] tracking-[-0.011em] text-center relative left-[14px]"
      >
        {t("header.signIn")}
      </button>
    </>
  );
}
