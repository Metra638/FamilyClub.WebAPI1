"use client";

import React from "react";
import MobileBookCard from "./MobileBookCard";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

type Book = {
  title: string;
  author?: string | null;
  price: string;
  image?: string | null;
  rating?: number | null;
  href?: string;
  formatTags?: Array<"paper" | "ebook" | "audio">;
};

type MobileOthersSectionProps = {
  books: Book[];
};

export default function MobileOthersSection({ books }: MobileOthersSectionProps) {
  const t = useTranslations();

  if (!books || books.length === 0) return null;

  return (
    <section className="relative w-full py-2">
      {/* Title "Інші" left-aligned (Figma Node 2199:3282) */}
      <div className="px-4 mb-2">
        <h2 className="font-mono text-[32px] sm:text-[36px] font-bold text-[#242424] leading-none tracking-tight">
          {t("home.mobile.others")}
        </h2>
      </div>

      {/* Wooden Bookshelf Bar (Figma Node 2199:2725 / Rectangle 139 / Rectangle 140 / Rectangle 141) */}
      <div className="relative z-20 h-[40px] w-full shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] bg-[#7e4d1e] mb-6">
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

      {/* 2-Column Grid of Books */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-6 px-4 pb-24 max-w-[420px] mx-auto justify-items-center">
        {books.map((book, idx) => (
          <div key={`${book.title}-${idx}`} className="w-full flex justify-center">
            <MobileBookCard {...book} />
          </div>
        ))}
      </div>
    </section>
  );
}
