"use client";

import Link from "next/link";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

type BookCardProps = {
  title: string;
  author?: string | null;
  price: string;
  image?: string | null;
  rating?: number | null;
  href?: string;
  formatTags?: Array<"paper" | "ebook" | "audio">;
  productId?: number;
  isFavorite?: boolean;
  onToggleFavorite?: (productId: number) => void;
};

const clampRating = (value: number) => Math.max(0, Math.min(5, value));

const formatIconMap = {
  paper: {
    bg: "/images/main_page/icons/rec-icon-paper-bg.svg",
    icon: "/images/main_page/icons/rec-icon-paper.svg",
  },
  ebook: {
    bg: "/images/main_page/icons/rec-icon-ebook-bg.svg",
    icon: "/images/main_page/icons/rec-icon-ebook.svg",
  },
  audio: {
    bg: "/images/main_page/icons/rec-icon-audio-bg.svg",
    icon: "/images/main_page/icons/rec-icon-audio.svg",
  },
};

export default function BookCard({
  title,
  author,
  price,
  image,
  rating,
  href,
  formatTags,
  isFavorite,
  onToggleFavorite,
  productId,
}: BookCardProps) {
  const t = useTranslations();
  const roundedRating = clampRating(Math.round(rating ?? 0));
  const activeFormatTags = formatTags?.length ? formatTags : [];

  const card = (
    <div className="relative h-[400px] w-[260px]">
      <div
        className="absolute inset-0 rounded-bl-[30px] rounded-br-[30px] shadow-[0px_10px_10px_0px_rgba(36,36,36,0.3)]"
        style={{
          backgroundImage:
            "linear-gradient(0deg, rgba(245, 243, 238, 0.2) 84.667%, rgba(0, 0, 0, 0.2) 100%), linear-gradient(90deg, rgb(245, 243, 238) 0%, rgb(245, 243, 238) 100%)",
        }}
      />

      {activeFormatTags.length > 0 ? (
        <div className="absolute left-0 top-[20px] z-10 flex flex-col gap-2">
          {activeFormatTags.map((tag) => {
            const item = formatIconMap[tag];
            return (
              <div key={tag} className="relative h-[30px] w-[35px]">
                <img alt="" className="absolute inset-0 h-full w-full object-fill" src={item.bg} />
                <img
                  alt=""
                  className="absolute left-[5px] top-[5px] h-[20px] w-[20px] object-contain"
                  src={item.icon}
                />
              </div>
            );
          })}
        </div>
      ) : null}

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!productId || !onToggleFavorite) return;
          onToggleFavorite(productId);
        }}
        className="absolute right-[18px] top-[20px] z-10 h-[30px] w-[30px] cursor-pointer"
        aria-label={t("product.favoriteAria")}
      >
        <img
          alt={t("product.favoriteAria")}
          className="h-full w-full"
          src={
            isFavorite
              ? "/images/userProfile/heart-filled.svg"
              : "/images/main_page/icons/rec-icon-favorite.svg"
          }
        />
      </button>

      {image ? (
        <img
          alt={title}
          className="absolute left-1/2 top-[20px] h-[190px] w-[140px] -translate-x-1/2 object-contain"
          src={image}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="absolute left-1/2 top-[20px] h-[190px] w-[140px] -translate-x-1/2 flex flex-col items-center justify-center text-gray-400 text-center p-2 bg-white/80 rounded-[6px] shadow-sm border border-gray-200">
          <span className="text-3xl mb-1">📖</span>
          <span className="text-xs font-serif">{t("product.noPhoto")}</span>
        </div>
      )}

      <div className="absolute bottom-[20px] left-[20px] right-[20px]">
        <div
          className="mb-3 flex gap-1.5"
          aria-label={t("product.ratingAria").replace("{rating}", String(roundedRating))}
        >
          {Array.from({ length: 5 }, (_, index) => (
            <img
              key={`${title}-star-${index}`}
              src="/images/main_page/icons/rec-icon-star.svg"
              className={`h-[18px] w-[18px] ${index < roundedRating ? "opacity-100" : "opacity-30"}`}
              alt=""
            />
          ))}
        </div>

        <div className="mb-3">
          <p className="font-serif text-[18px] font-medium leading-[1.2] text-[#242424] line-clamp-2 overflow-hidden text-ellipsis h-[48px]">
            {title}
          </p>
          {author ? (
            <p className="text-[14px] text-[rgba(36,36,36,0.7)] overflow-hidden text-ellipsis whitespace-nowrap">
              {author}
            </p>
          ) : (
            <div className="h-[20px]" />
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[24px] text-[#242424]">{price}</span>
          <img
            alt={t("product.cartAria")}
            className="h-[30px] w-[30px] cursor-pointer"
            src="/images/main_page/icons/rec-icon-basket.svg"
          />
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link aria-label={title} className="block" href={href}>
        {card}
      </Link>
    );
  }

  return card;
}
