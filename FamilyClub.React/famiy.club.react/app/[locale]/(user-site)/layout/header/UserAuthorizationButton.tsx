"use client";

import { useTranslations } from "@/lib/i18n/LocaleProvider";

export default function UserAuthorizationButton() {
  const t = useTranslations();

  return (
    <div className="group flex items-center justify-center">
      <div
        className="flex row w-full w-[110px] h-[40px]
          items-center
          justify-center
          rounded-full
          transition-all
          duration-300
          group-hover:bg-[var-(--color-white)]
          group-hover:shadow-[0px_0px_15px_0px_#242424CC]"
      >
        <button className="w-[110px] h-[40px] text-[var(--color-black)] font-normal text-[14px] leading-[150%] tracking-[-0.011em] text-center relative">
          {t("header.signIn")}
        </button>
      </div>
    </div>
  );
}
