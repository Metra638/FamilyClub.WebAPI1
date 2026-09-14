"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePlatformSettingsOptional } from "@/lib/platformSettings/PlatformSettingsContext";
import { mediaSrc } from "@/lib/platformSettings/platformSettingsApi";
import type { Locale } from "@/lib/i18n/config";
import { useLocale, useLocalizedPath, useTranslations } from "@/lib/i18n/LocaleProvider";

const HERO_TITLE_IMAGES = {
  uk: "/images/main_page/hero/hero-title.png",
  en: "/images/main_page/hero/hero-titlee-en.png",
} as const;

const HERO_BOOKS: Record<Locale, readonly string[]> = {
  uk: [
    "/images/main_page/hero/hero-book-1-uk.png",
    "/images/main_page/hero/hero-book-2-uk.png",
    "/images/main_page/hero/hero-book-3-uk.png",
    "/images/main_page/hero/hero-book-4-uk.png",
  ],
  en: [
    "/images/main_page/hero/hero-book-1-en.png",
    "/images/main_page/hero/hero-book-2-en.png",
    "/images/main_page/hero/hero-book-3-en.png",
    "/images/main_page/hero/hero-book-4-en.png",
  ],
};

const HERO_BACKGROUND_IMAGES = {
  uk: "/images/main_page/hero/hero-background-uk.png",
  en: "/images/main_page/hero/hero-background-en.png",
} as const;

function HeroBookStack({
  covers,
  href,
  className,
  ariaLabel,
}: {
  covers: readonly string[];
  href: string;
  className: string;
  ariaLabel: string;
}) {
  const [hovering, setHovering] = useState(false);

  return (
    <Link
      href={href}
      className={className}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      aria-label={ariaLabel}
    >
      {covers.map((src, index) => {
        const isFront = index === 0;
        let transform = "translate(0px, 0px) rotate(-7.5deg)";
        let opacity = isFront ? 1 : 0;
        let transitionDelay = "0ms";

        if (hovering) {
          if (isFront) {
            transform = "translate(28px, 6px) rotate(-2deg)";
            opacity = 1;
          } else {
            const step = index;
            const angleStep = 21;
            transform = `translate(${-22 * step}px, ${4 * step}px) rotate(${-2 - step * angleStep}deg)`;
            opacity = 1;
            transitionDelay = `${step * 30}ms`;
          }
        } else if (!isFront) {
          transitionDelay = `${(covers.length - index) * 20}ms`;
        }

        return (
          <img
            key={src}
            alt=""
            src={src}
            className={`pointer-events-none absolute left-[65px] top-[27px] h-[341px] w-[230px] object-contain transition-all duration-300 ease-out ${
              isFront
                ? "drop-shadow-[0px_0px_30px_rgba(245,243,238,0.9)]"
                : "drop-shadow-[0px_6px_14px_rgba(0,0,0,0.35)]"
            }`}
            style={{
              zIndex: covers.length - index,
              opacity,
              transform,
              transitionDelay,
            }}
          />
        );
      })}
    </Link>
  );
}

export default function Hero() {
  const { locale } = useLocale();
  const { settings } = usePlatformSettingsOptional();
  const t = useTranslations();
  const lp = useLocalizedPath();
  const titleSrc = HERO_TITLE_IMAGES[locale];
  const bannerSrc =
    mediaSrc(settings.bannerData, settings.bannerContentType) ??
    HERO_BACKGROUND_IMAGES[locale];

  const covers = HERO_BOOKS[locale] ?? HERO_BOOKS.uk;

  useEffect(() => {
    covers.slice(1).forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [covers]);

  return (
    <section className="relative overflow-visible bg-[#f5f3ee]">
      <div className="relative mx-auto hidden h-[700px] max-w-[1920px] overflow-visible min-[1600px]:block">
        <img
          alt=""
          className="absolute left-[-20px] top-[74px] h-[510px] w-[1960px] object-cover blur-[2.5px]"
          src={bannerSrc}
        />
        <div className="absolute left-[350px] top-0 h-[659px] w-[1220px] bg-[rgba(36,36,36,0.5)] blur-[50px]" />

        <img
          alt=""
          className="absolute left-0 top-[458px] h-[476px] w-[383px] z-10 pointer-events-none"
          src="/images/main_page/hero/hero-vines-left.png"
        />
        <img
          alt=""
          className="absolute left-[1532px] top-[451px] h-[452px] w-[387px] z-10 pointer-events-none"
          src="/images/main_page/hero/hero-vines-right.png"
        />

        <HeroBookStack
          covers={covers}
          href={lp("/products")}
          ariaLabel={t("nav.catalog")}
          className="absolute left-[300px] top-[190px] z-40 h-[420px] w-[360px] cursor-pointer overflow-visible"
        />

        <img
          alt={t("home.hero.titleAlt")}
          className="absolute left-[734px] top-[184px] h-[118px] w-[835px]"
          src={titleSrc}
        />

        <img
          alt=""
          className="absolute left-[606px] top-[217px] h-[64px] w-[114px] rotate-[3deg]"
          src="/images/main_page/hero/hero-arrow.png"
        />

        <img
          alt=""
          className="absolute left-[1062px] top-[405px] h-[174px] w-[609px] opacity-60"
          src="/images/main_page/hero/hero-cloud.png"
        />

        <p
          className="absolute left-[770px] top-[405px] w-[800px] text-right font-mono text-[24px] font-medium text-[#f5f3ee]"
          style={{ textShadow: "0px 0px 10px #242424, 0px 0px 28px #242424" }}
        >
          {t("home.hero.tagline")}
        </p>

        <Link
          href={lp("/pick-book")}
          className="absolute left-[1062px] top-[500px] flex h-[60px] items-center gap-3 rounded-full bg-[#005B33] px-8 text-[20px] font-semibold text-[#f5f3ee] shadow-[0px_4px_12px_rgba(0,0,0,0.4)] transition-transform hover:scale-105"
        >
          {t("home.hero.pickBook")}
          <span className="text-[24px]">→</span>
        </Link>
      </div>

      <div className="relative mx-auto h-[560px] max-w-[1220px] overflow-visible px-4 py-10 min-[1600px]:hidden">
        <img
          alt=""
          className="absolute left-1/2 top-[40px] h-[510px] w-[min(1960px,100vw)] -translate-x-1/2 object-cover blur-[2.5px]"
          src={bannerSrc}
        />
        <div className="absolute inset-0 bg-[rgba(36,36,36,0.5)] blur-[50px]" />

        <HeroBookStack
          covers={covers}
          href={lp("/products")}
          ariaLabel={t("nav.catalog")}
          className="absolute left-0 top-[140px] z-40 h-[420px] w-[340px] cursor-pointer overflow-visible"
        />

        <img
          alt={t("home.hero.titleAlt")}
          className="absolute left-1/2 top-[140px] w-[min(835px,92%)] -translate-x-1/2"
          src={titleSrc}
        />

        <img
          alt=""
          className="absolute left-[22%] top-[210px] hidden w-[110px] rotate-[3deg] md:block"
          src="/images/main_page/hero/hero-arrow.png"
        />

        <img
          alt=""
          className="absolute bottom-[60px] right-[30px] w-[320px] opacity-60 md:right-[40px] md:w-[420px]"
          src="/images/main_page/hero/hero-cloud.png"
        />

        <p
          className="absolute bottom-[195px] right-[40px] w-[320px] text-right font-mono text-[18px] font-medium text-[#f5f3ee] md:bottom-[210px] md:right-[60px] md:w-[520px] md:text-[24px]"
          style={{ textShadow: "0px 0px 10px #242424, 0px 0px 28px #242424" }}
        >
          {t("home.hero.tagline")}
        </p>

        <Link
          href={lp("/pick-book")}
          className="absolute bottom-[120px] right-[40px] flex h-[50px] items-center gap-2 rounded-full bg-[#005B33] px-6 text-[16px] font-semibold text-[#f5f3ee] shadow-[0px_4px_12px_rgba(0,0,0,0.4)] transition-transform hover:scale-105 md:bottom-[140px] md:right-[60px] md:h-[60px] md:px-8 md:text-[20px]"
        >
          {t("home.hero.pickBook")}
          <span className="text-[20px] md:text-[24px]">→</span>
        </Link>
      </div>
    </section>
  );
}
