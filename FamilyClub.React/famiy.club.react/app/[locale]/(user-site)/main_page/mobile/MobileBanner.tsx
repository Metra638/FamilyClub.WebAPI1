"use client";

import React from "react";
import Link from "next/link";
import { useLocalizedPath, useTranslations } from "@/lib/i18n/LocaleProvider";

export default function MobileBanner() {
  const t = useTranslations();
  const lp = useLocalizedPath();

  return (
    <section className="relative w-full h-[380px] sm:h-[420px] pt-[65px] overflow-hidden bg-[#f5f3ee] select-none">
      {/* 1. Background Room Photo (blurred: blur-[10px] with scale-110) */}
      <img
        src="/images/main_page/hero/hero-background-uk.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover blur-[10px] scale-110 opacity-95 pointer-events-none z-0"
      />
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(255,255,255,0.2)] via-transparent to-[rgba(0,0,0,0.3)] pointer-events-none z-0" />

      {/* 2. Foreground Scratching Post & Shelf (reduced scale to 125% and shifted bottom to -28px for slim, exact Figma proportions) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        {/* Copy 1: Positions scratching post on the right and slim bottom green shelf */}
        <img
          src="/images/main_page/mobile/banner-bg.png"
          alt=""
          className="absolute bottom-[-28px] left-[-1%] w-[102%] h-[125%] max-w-none object-cover object-bottom select-none"
        />
        {/* Copy 2: Extends green shelf to the left */}
        <img
          src="/images/main_page/mobile/banner-bg.png"
          alt=""
          className="absolute bottom-[-28px] left-[-22%] w-[125%] h-[125%] max-w-none object-cover object-bottom select-none"
        />
      </div>

      {/* 3. Cat Box / House sitting neatly on the shelf on the left */}
      <div className="absolute bottom-[20px] left-[16px] z-20 w-[80px] h-[80px]">
        <img
          src="/images/main_page/mobile/cat-frame.svg"
          alt=""
          className="absolute inset-0 w-full h-full object-contain drop-shadow-md pointer-events-none"
        />
        <div className="absolute inset-0 flex items-center justify-center p-1.5">
          <img
            src="/images/main_page/mobile/banner-cat.png"
            alt={t("ink.catAlt")}
            className="w-[85%] h-[85%] object-contain pointer-events-none"
          />
        </div>
      </div>

      {/* 4. Hanging Yellow Ball / Bell hanging down */}
      <Link
        href={lp("/pick-book")}
        aria-label={t("home.mobile.inkBellAria")}
        className="absolute top-[65px] right-[65px] sm:right-[85px] z-30 block w-[44px] h-[132px] cursor-pointer transition-transform duration-300 hover:scale-105"
      >
        <img
          src="/images/main_page/mobile/bell.png"
          alt={t("ink.ringBellAria")}
          className="w-full h-full object-contain drop-shadow-md pointer-events-none"
        />
      </Link>
    </section>
  );
}
