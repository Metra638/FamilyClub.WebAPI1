"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useLocale, useTranslations } from "@/lib/i18n/LocaleProvider";
import { localizedPath } from "@/lib/i18n/localized-path";

export default function DropDownCatalog() {
  const [open, setOpen] = useState(false);
  const { locale } = useLocale();
  const t = useTranslations();

  return (
    <div className="relative w-[150px] z-10 pointer-events-auto">
      <div
        className={`
    relative w-[150px] h-[340px]
    -top-[200px] -ml-[10px]
    transition-transform duration-300 ease-out
    ${open ? "translate-y-[6px]" : "translate-y-0"}
  `}
      >
        <Image
          src="/images/header/Rectangle 144.svg"
          alt="bg"
          fill
          className="object-contain pointer-events-none"
        />

        <Link
          href={localizedPath("/products", locale)}
          onClick={() => setOpen(true)}
          className="pointer-events-auto
            absolute inset-0
            flex justify-center items-end
            mb-[34px]
            z-10
            focus:outline-none
          "
        >
          <span className="text-[var(--color-white)]">{t("nav.catalog")}</span>
        </Link>
      </div>
    </div>
  );
}
