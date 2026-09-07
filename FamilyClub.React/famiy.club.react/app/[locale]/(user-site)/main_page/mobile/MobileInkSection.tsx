"use client";

import React from "react";
import Link from "next/link";
import { useLocalizedPath, useTranslations } from "@/lib/i18n/LocaleProvider";

export type GazetteItem = {
  id: string;
  authorName: string;
  authorHandle: string;
  tag: string;
  title: string;
  image?: string | null;
  avatar?: string | null;
  href?: string;
};

type MobileInkSectionProps = {
  items?: GazetteItem[];
};

export default function MobileInkSection({ items }: MobileInkSectionProps) {
  const t = useTranslations();
  const lp = useLocalizedPath();
  const displayItems: GazetteItem[] =
    items && items.length > 0
      ? items
      : [];

  if (displayItems.length === 0) return null;

  return (
    <section className="relative w-full py-4">
      {/* Title "Газета" & Arrow Button (Figma Node 2199:2774 / 2199:2982) */}
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="font-mono text-[32px] sm:text-[36px] font-bold text-[#242424] leading-none tracking-tight">
          {t("home.mobile.gazette")}
        </h2>
        <Link
          href={lp("/categories")}
          aria-label={t("home.mobile.moreGazette")}
          className="relative w-[40px] h-[40px] shrink-0 block transition-transform hover:scale-105 active:scale-95"
        >
          <img
            src="/images/main_page/mobile/arrow-circle.svg"
            alt=""
            className="absolute inset-0 w-full h-full object-contain drop-shadow-[0px_0px_2.5px_rgba(0,0,0,0.4)]"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="/images/main_page/mobile/arrow-icon.svg"
              alt={t("home.mobile.goTo")}
              className="w-[18px] h-[18px] rotate-90 object-contain"
            />
          </div>
        </Link>
      </div>

      {/* Horizontal Scroll of Gazette Cards (Figma Node 2199:2799) */}
      <div className="flex overflow-x-auto gap-4 px-4 pb-4 pt-1 snap-x snap-mandatory scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {displayItems.map((item) => (
          <Link
            key={item.id}
            href={item.href && !item.href.startsWith("/") ? item.href : lp(item.href || "/categories")}
            className="group relative h-[205px] w-[186px] shrink-0 snap-start rounded-[10px] bg-[#f5f3ee] p-3 shadow-[0px_0px_20px_0px_rgba(0,0,0,0.4)] border-[10px] border-[#f5f3ee] flex flex-col justify-between transition-transform active:scale-[0.98]"
          >
            {/* Background texture (Figma imgRectangle438) */}
            <div className="absolute inset-0 rounded-[10px] -z-10 overflow-hidden pointer-events-none">
              <div className="absolute bg-[#f5f3ee] inset-0" />
              <img
                src="/images/main_page/mobile/gazette-bg.png"
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
              />
            </div>

            {/* Top: Avatar, Name, Handle, Tag */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2.5">
                <div className="w-[35px] h-[35px] rounded-full overflow-hidden shrink-0">
                  <img
                    src={item.avatar || "/images/main_page/mobile/ink-avatar.png"}
                    alt={item.authorName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col leading-none overflow-hidden">
                  <span className="font-sans font-bold text-[16px] text-[#242424] truncate leading-tight">
                    {item.authorName}
                  </span>
                  <span className="font-sans font-bold text-[14px] text-[rgba(36,36,36,0.5)] truncate">
                    {item.authorHandle}
                  </span>
                </div>
              </div>
              <span className="font-sans font-bold text-[14px] text-[rgba(36,36,36,0.5)] mt-1 block">
                {item.tag}
              </span>
            </div>

            {/* Middle Image (Figma Node 2199:2782) */}
            <div className="h-[79px] w-full rounded-[5px] overflow-hidden my-1 bg-[rgba(0,0,0,0.05)] flex items-center justify-center">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 text-center p-1 bg-white/60 w-full h-full">
                  <span className="text-lg">📖</span>
                  <span className="text-[8px] font-serif">{t("product.noPhoto")}</span>
                </div>
              )}
            </div>

            {/* Bottom Title / Action Text (Figma Node 2199:2783) */}
            <div className="text-center">
              <span className="font-sans font-bold text-[20px] text-[#242424] leading-tight block truncate tracking-[-0.22px]">
                {item.title}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
