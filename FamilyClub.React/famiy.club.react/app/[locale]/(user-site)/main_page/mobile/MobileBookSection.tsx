"use client";

import React from "react";
import Link from "next/link";
import MobileBookCard from "./MobileBookCard";
import { useLocalizedPath, useTranslations } from "@/lib/i18n/LocaleProvider";

type Book = {
  title: string;
  author?: string | null;
  price: string;
  image?: string | null;
  rating?: number | null;
  href?: string;
  formatTags?: Array<"paper" | "ebook" | "audio">;
};

type MobileBookSectionProps = {
  title?: string;
  books: Book[];
  showShelf?: boolean;
  href?: string;
};

export default function MobileBookSection({
  title,
  books,
  showShelf = false,
  href = "/categories",
}: MobileBookSectionProps) {
  const t = useTranslations();
  const lp = useLocalizedPath();

  if (!books || books.length === 0) return null;

  return (
    <section className="relative w-full py-2">
      {/* Title & Arrow Button (Figma Node 2199:2992 / Group 911 / Group 912) */}
      {title && (
        <div className="flex items-center justify-between px-4 mb-2">
          <h2 className="font-mono text-[32px] sm:text-[36px] font-bold text-[#242424] leading-none tracking-tight">
            {title}
          </h2>
          <Link
            href={lp(href)}
            aria-label={t("home.mobile.moreSection").replace("{title}", title)}
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
      )}

      {/* Wooden Bookshelf Bar (Figma Node 2199:2725 / Rectangle 139 / Rectangle 140 / Rectangle 141) */}
      {showShelf && (
        <div className="relative z-20 h-[40px] w-full shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] bg-[#7e4d1e] mb-4">
          <img
            src="/images/catalog/shelf_tex1.png"
            className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-50 pointer-events-none"
            alt=""
          />
          <div className="absolute inset-0 bg-[rgba(0,0,0,0.27)] pointer-events-none" />
          <div className="absolute left-0 right-0 bottom-0 h-[20px]">
            <img
              src="/images/catalog/shelf_tex2.png"
              className="absolute inset-0 w-full h-full object-cover mix-blend-multiply pointer-events-none"
              alt=""
            />
            <img
              src="/images/catalog/shelf_tex3.png"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              alt=""
            />
          </div>
        </div>
      )}

      {/* Horizontal Scroll of Books */}
      <div className="flex overflow-x-auto gap-4 px-4 pb-4 pt-1 snap-x snap-mandatory scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {books.map((book, idx) => (
          <div key={`${book.title}-${idx}`} className="snap-start shrink-0">
            <MobileBookCard {...book} />
          </div>
        ))}
      </div>
    </section>
  );
}
