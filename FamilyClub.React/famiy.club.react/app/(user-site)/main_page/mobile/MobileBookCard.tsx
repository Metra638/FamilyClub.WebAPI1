"use client";

import React from "react";
import Link from "next/link";

type MobileBookCardProps = {
  title: string;
  author?: string | null;
  price: string;
  image?: string | null;
  rating?: number | null;
  href?: string;
  formatTags?: Array<"paper" | "ebook" | "audio">;
};

const formatIconMap = {
  paper: {
    bg: "/images/main_page/icons/rec-icon-paper-bg.svg",
    icon: "/images/main_page/icons/rec-icon-paper.svg",
    label: "Паперова",
  },
  ebook: {
    bg: "/images/main_page/icons/rec-icon-ebook-bg.svg",
    icon: "/images/main_page/icons/rec-icon-ebook.svg",
    label: "eBooks",
  },
  audio: {
    bg: "/images/main_page/icons/rec-icon-audio-bg.svg",
    icon: "/images/main_page/icons/rec-icon-audio.svg",
    label: "Аудіо книга",
  },
};

export default function MobileBookCard({
  title,
  author,
  price,
  image,
  href,
  formatTags,
}: MobileBookCardProps) {
  const activeFormatTags = formatTags?.length ? formatTags : [];

  const cardContent = (
    <div className="relative h-[258px] w-full max-w-[186px] block overflow-hidden rounded-bl-[20px] rounded-br-[20px] shadow-[0px_8px_15px_rgba(36,36,36,0.25)] bg-[#f5f3ee] transition-transform duration-300 active:scale-[0.98]">
      {/* Background Gradient overlay matching Figma Node 2190:2466 */}
      <div
        className="absolute inset-0 rounded-bl-[20px] rounded-br-[20px] pointer-events-none z-0"
        style={{
          backgroundImage:
            "linear-gradient(0deg, rgba(245, 243, 238, 0.3) 89.6%, rgba(0, 0, 0, 0.15) 100%), linear-gradient(90deg, rgb(245, 243, 238) 0%, rgb(245, 243, 238) 100%)",
        }}
      />

      {/* Top Left Format Tags (Figma Node 2190:2659) */}
      {activeFormatTags.length > 0 && (
        <div className="absolute left-0 top-[12px] z-20 flex flex-col gap-1">
          {activeFormatTags.map((tag) => {
            const item = formatIconMap[tag];
            return (
              <div key={tag} className="relative h-[26px] w-[28px] group">
                <img
                  alt={item.label}
                  className="absolute inset-0 h-full w-full object-fill"
                  src={item.bg}
                />
                <img
                  alt=""
                  className="absolute left-[5px] top-[4px] h-[16px] w-[16px] object-contain"
                  src={item.icon}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Top Right Favorite Button (Figma Node 2190:2717) */}
      <button
        type="button"
        aria-label="Додати в улюблене"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className="absolute right-[8px] top-[12px] z-20 h-[32px] w-[32px] flex items-center justify-center rounded-full hover:bg-[rgba(0,0,0,0.05)] transition-colors"
      >
        <img
          alt="Улюблене"
          className="h-[20px] w-[20px] object-contain"
          src="/images/main_page/icons/rec-icon-favorite.svg"
        />
      </button>

      {/* Book Cover Image Container */}
      <div className="absolute top-[18px] left-1/2 -translate-x-1/2 w-[85%] max-w-[96px] h-[128px] z-10 flex items-center justify-center pointer-events-none">
        {image ? (
          <img
            alt={title}
            className="max-h-full max-w-full object-contain drop-shadow-[0px_4px_8px_rgba(0,0,0,0.3)]"
            src={image}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 text-center p-1 bg-white/80 rounded-[4px] w-full h-full shadow-sm border border-gray-200">
            <span className="text-xl">📖</span>
            <span className="text-[8px] font-serif">Немає фото</span>
          </div>
        )}
      </div>

      {/* Title Container */}
      <div className="absolute top-[154px] left-[8px] right-[8px] z-10 h-[38px] flex items-center justify-center">
        <p className="font-serif text-[14px] sm:text-[15px] font-medium leading-snug text-[#242424] text-center line-clamp-2 overflow-hidden text-ellipsis">
          {title}
        </p>
      </div>

      {/* Author & Price Container */}
      <div className="absolute bottom-[10px] left-[8px] right-[8px] z-10 flex items-end justify-between gap-1">
        <div className="flex flex-col justify-end min-w-0 flex-1 overflow-hidden">
          {author ? (
            <p className="text-[12px] sm:text-[13px] text-[rgba(36,36,36,0.7)] leading-tight truncate block">
              {author}
            </p>
          ) : (
            <div className="h-[14px]" />
          )}
          <p className="text-[15px] sm:text-[16px] font-bold text-[#242424] leading-tight mt-0.5 truncate block">
            {price}
          </p>
        </div>

        {/* Shopping Basket Button (Figma Node 2784:6220) */}
        <button
          type="button"
          aria-label="Додати в кошик"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="h-[32px] w-[32px] sm:h-[34px] sm:w-[34px] flex items-center justify-center rounded-full bg-[#005B33]/10 hover:bg-[#005B33]/20 transition-colors shrink-0"
        >
          <img
            alt="Кошик"
            className="h-[18px] w-[18px] sm:h-[20px] sm:w-[20px] object-contain"
            src="/images/main_page/icons/rec-icon-basket.svg"
          />
        </button>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block w-full max-w-[186px] flex justify-center">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
