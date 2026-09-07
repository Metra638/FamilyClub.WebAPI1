"use client";

import Link from "next/link";
import { usePlatformSettingsOptional } from "@/lib/platformSettings/PlatformSettingsContext";
import { mediaSrc } from "@/lib/platformSettings/platformSettingsApi";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { localizedPath } from "@/lib/i18n/localized-path";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

const DEFAULT_LOGO = "/images/main_page/logo.png";
const LOGO_BACKGROUND = "/images/main_page/logo-background.png";

export default function Logo() {
  const { settings } = usePlatformSettingsOptional();
  const { locale } = useLocale();
  const t = useTranslations();
  const customLogo = mediaSrc(settings.logoData, settings.logoContentType);
  const src = customLogo ?? DEFAULT_LOGO;
  const alt = settings.companyName || "LIBRELLIS";
  const isDefaultLogo = !customLogo;

  return (
    <div className="absolute top-0 left-0 z-40">
      <Link
        href={localizedPath("/", locale)}
        aria-label={t("common.homeAria")}
        className="relative block w-[120px] h-[78px] isolate"
      >
        <img
          src={LOGO_BACKGROUND}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-fill pointer-events-none"
        />
        <img
          src={src}
          alt={alt}
          width={120}
          height={68}
          className={`relative z-10 w-full h-full object-contain p-[6px_8px_12px] ${
            isDefaultLogo ? "mix-blend-screen" : ""
          }`}
        />
      </Link>
    </div>
  );
}
