"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localeLabels, locales, type Locale } from "@/lib/i18n/config";
import { switchLocalePath } from "@/lib/i18n/localized-path";

export default function UaCircle() {
  const pathname = usePathname() ?? "/";
  const activeLocale = (pathname.split("/")[1] as Locale) || "uk";

  return (
    <div className="flex items-center justify-center gap-1">
      {locales.map((locale) => {
        const isActive = activeLocale === locale;
        return (
          <Link
            key={locale}
            href={switchLocalePath(pathname, locale)}
            aria-label={localeLabels[locale]}
            className={`flex h-[40px] w-[40px] items-center justify-center rounded-full text-[13px] font-semibold leading-none tracking-wide transition-all duration-300 ${
              isActive
                ? "bg-[var(--color-white)] text-[#005B33] shadow-[0px_0px_15px_0px_#242424CC]"
                : "text-[#242424]/70 hover:bg-[var(--color-white)] hover:shadow-[0px_0px_15px_0px_#242424CC]"
            }`}
          >
            <span className="text-[13px] font-semibold leading-none">
              {localeLabels[locale]}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
