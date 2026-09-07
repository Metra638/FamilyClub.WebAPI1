"use client";

import React from "react";
import MobileBanner from "./MobileBanner";
import MobileBookSection from "./MobileBookSection";
import MobileInkSection from "./MobileInkSection";
import MobileOthersSection from "./MobileOthersSection";
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

type MobileHomeProps = {
  recommendations: Book[];
  newBooks: Book[];
  announcements: Book[];
  hitsBooks: Book[];
  otherBooks: Book[];
  gazetteItems?: React.ComponentProps<typeof MobileInkSection>["items"];
};

export default function MobileHome({
  recommendations,
  newBooks,
  announcements,
  hitsBooks,
  otherBooks,
  gazetteItems,
}: MobileHomeProps) {
  const t = useTranslations();

  return (
    <div className="w-full bg-[#f5f3ee] min-h-screen text-[#242424] overflow-x-hidden font-sans">
      {/* 1. Top Banner / Stories (Figma Group 903) */}
      <MobileBanner />

      {/* 2. Recommendations Section (no shelf above it, matching Figma Node 2199:2691) */}
      <MobileBookSection
        books={recommendations}
        showShelf={false}
      />

      {/* 3. Gazette Section / "Газета" (Figma Node 2199:2774) */}
      <MobileInkSection items={gazetteItems} />

      {/* 4. New Books / "Нові" (Figma Node 2199:2992) */}
      <MobileBookSection
        title={t("home.sections.newArrivals")}
        books={newBooks}
        showShelf={true}
        href="/pick-book"
      />

      {/* 5. Announcements / "Анонси" (Figma Node 2199:3275) */}
      <MobileBookSection
        title={t("home.sections.announcements")}
        books={announcements}
        showShelf={true}
        href="/categories?sort=announcements"
      />

      {/* 6. Sales Hits / "Хід продажу" */}
      <MobileBookSection
        title={t("home.sections.bestsellers")}
        books={hitsBooks}
        showShelf={true}
        href="/categories?sort=hits"
      />

      {/* 7. Others / "Інші" (Figma Node 2199:3282) */}
      <MobileOthersSection books={otherBooks} />
    </div>
  );
}
