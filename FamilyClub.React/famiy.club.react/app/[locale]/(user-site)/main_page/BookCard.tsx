"use client";

import Link from "next/link";
import { useTranslations } from "@/lib/i18n/LocaleProvider";
import { useTheme } from "@/lib/theme/ThemeProvider";

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
  const { theme } = useTheme();
  const isNight = theme === "ink-night";
  const roundedRating = clampRating(Math.round(rating ?? 0));
  const activeFormatTags = formatTags?.length ? formatTags : [];

  const actionIconClass = isNight
    ? "book-card-action-icon book-card-action-icon--night"
    : "book-card-action-icon book-card-action-icon--day";

  const starIconClass = isNight
    ? "book-card-star-icon book-card-star-icon--night"
    : "book-card-star-icon";

  const card = (
    <div className="book-card-shell group relative z-0 h-[490px] w-[260px] hover:z-[5]">
      {/* Plate stretches from top; content drops in sync (same duration/easing) */}
      <div
        className="book-card-bg absolute inset-0 origin-top rounded-bl-[30px] rounded-br-[30px] shadow-[0px_10px_10px_0px_rgba(36,36,36,0.3)] will-change-transform"
        style={{
          backgroundImage:
            "linear-gradient(0deg, color-mix(in srgb, var(--background-elevated) 20%, transparent) 84.667%, rgba(0, 0, 0, 0.2) 100%), linear-gradient(90deg, var(--background-elevated) 0%, var(--background-elevated) 100%)",
        }}
      />

      <div className="book-card-content absolute inset-0 z-[1] mt-8">
        {activeFormatTags.length > 0 ? (
          <div className="absolute left-0 top-[65px] z-20 flex flex-col gap-2">
            {activeFormatTags.map((tag) => {
              const item = formatIconMap[tag];
              const label = t(`product.formats.${tag}`);
              return (
                <div
                  key={tag}
                  className={`book-format-ribbon book-format-ribbon--${tag}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  title={label}
                >
                  <img
                    alt=""
                    className="book-format-ribbon__icon"
                    src={item.icon}
                    width={20}
                    height={20}
                  />
                  <span className="book-format-ribbon__label">{label}</span>
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
          className="absolute right-[18px] top-[65px] z-10 h-[30px] w-[30px] cursor-pointer"
          aria-label={t("product.favoriteAria")}
        >
          <img
            alt={t("product.favoriteAria")}
            className={`h-full w-full ${
              isFavorite
                ? isNight
                  ? "book-card-favorite-icon--night"
                  : ""
                : actionIconClass
            }`}
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
            className="absolute left-1/2 top-[65px] h-[190px] w-[140px] -translate-x-1/2 object-contain"
            src={image}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="absolute left-1/2 top-[65px] h-[190px] w-[140px] -translate-x-1/2 flex flex-col items-center justify-center text-[var(--color-muted-fg)] text-center p-2 bg-[color-mix(in_srgb,var(--foreground-primary)_8%,var(--background-elevated))] rounded-[6px] shadow-sm border border-[color-mix(in_srgb,var(--foreground-primary)_14%,transparent)]">
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
                className={`h-[18px] w-[18px] ${index < roundedRating ? "opacity-100" : "opacity-30"} ${starIconClass}`}
                alt=""
              />
            ))}
          </div>

          <div className="mb-3">
            <p className="font-serif text-[18px] font-medium leading-[1.2] text-[var(--foreground-primary)] line-clamp-2 overflow-hidden text-ellipsis h-[48px]">
              {title}
            </p>
            {author ? (
              <p className="text-[14px] text-[var(--color-muted-fg)] overflow-hidden text-ellipsis whitespace-nowrap">
                {author}
              </p>
            ) : (
              <div className="h-[20px]" />
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[24px] text-[var(--foreground-primary)]">{price}</span>
            <img
              alt={t("product.cartAria")}
              className={`h-[30px] w-[30px] cursor-pointer ${actionIconClass}`}
              src="/images/main_page/icons/rec-icon-basket.svg"
            />
          </div>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link aria-label={title} className="book-card-link relative block" href={href}>
        {card}
      </Link>
    );
  }

  return card;
}