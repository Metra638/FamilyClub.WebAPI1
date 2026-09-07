"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthorDTO, ProductDto, ReviewDto as ApiReviewDto } from "@/lib/api/generated";
import { authorService, reviewService } from "@/lib/api/services";
import { getImageSrc } from "./hooks/useImageBook";
import { useCart } from "@/lib/hooks/useCart";
import { useUserReviews } from "./hooks/useUserReviews";
import { CurrentUser } from "./hooks/useCurrentUser";
import { FavoriteBook } from "@/lib/hooks/useFavorites";
import { TabType } from "./page";
import FormatBadge from "./section/FormatBadge";
import { useLocale, useLocalizedPath, useTranslations } from "@/lib/i18n/LocaleProvider";

const FORMAT_CONFIG = [
  { id: 3, icon: "/images/userProfile/Property1.svg", icon1: "/images/userProfile/Rectangle 185.svg", labelKey: "profile.formats.paper" },
  { id: 1, icon: "/images/userProfile/Property2.svg", icon1: "/images/userProfile/Rectangle 186.svg", labelKey: "profile.formats.ebook" },
  { id: 2, icon: "/images/userProfile/Property3.svg", icon1: "/images/userProfile/Rectangle 188.svg", labelKey: "profile.formats.audio" },
];

const SOCIALS = [
  { name: "telegram", href: "https://t.me", icon: "/images/userProfile/Vector1.png" },
  { name: "facebook", href: "https://facebook.com", icon: "/images/userProfile/Vector2.png" },
  { name: "instagram", href: "https://instagram.com", icon: "/images/userProfile/Vector3.png" },
];

export type MobileUserProfileViewProps = {
  user?: CurrentUser | null;
  userId?: string;
  favorites: FavoriteBook[];
  loadingFavorites: boolean;
  toggleFavorite: (id: number) => void;
  myBooks: ProductDto[];
  loadingMyBooks: boolean;
  products: ProductDto[];
  activeTab: TabType | null;
  setActiveTab: (tab: TabType | null) => void;
  hasFilters: boolean;
  sortedBooks: ProductDto[];
  getBooksForTab: () => ProductDto[];
};

export default function MobileUserProfileView({
  user,
  userId,
  favorites,
  loadingFavorites,
  toggleFavorite,
  myBooks,
  loadingMyBooks,
  activeTab,
  setActiveTab,
  getBooksForTab,
}: MobileUserProfileViewProps) {
  const router = useRouter();
  const { locale } = useLocale();
  const t = useTranslations();
  const lp = useLocalizedPath();
  const { items, addToCart } = useCart();
  const { reviews: userReviews, loading: loadingUserReviews } = useUserReviews(userId);

  const [authors, setAuthors] = useState<AuthorDTO[]>([]);
  const [reviews, setReviews] = useState<ApiReviewDto[]>([]);

  useEffect(() => {
    authorService.apiAuthorsGet().then(setAuthors).catch(console.error);
    reviewService.apiReviewsGet().then(setReviews).catch(console.error);
  }, []);

  const authorsById = useMemo(() => {
    const map = new Map<number, string>();
    for (const a of authors) {
      if (a.id != null) map.set(a.id, a.authorName ?? "");
    }
    return map;
  }, [authors]);

  const ratingByProductId = useMemo(() => {
    const temp = new Map<number, { sum: number; count: number }>();
    const result = new Map<number, number>();
    for (const review of reviews) {
      if (review.productId == null || review.rating == null) continue;
      if (review.approved === false) continue;
      const entry = temp.get(review.productId) ?? { sum: 0, count: 0 };
      temp.set(review.productId, { sum: entry.sum + review.rating, count: entry.count + 1 });
    }
    temp.forEach((v, key) => result.set(key, v.sum / v.count));
    return result;
  }, [reviews]);

  const isFav = (id?: number) => {
    if (!id) return false;
    return favorites.some((f) => f.id === id);
  };

  const clampRating = (value: number) => Math.max(0, Math.min(5, value));

  const ratingToStars = (rating: number) => {
    const rounded = clampRating(Math.round(rating));
    return Array.from({ length: 5 }, (_, i) => (i < rounded ? "★" : "☆")).join("");
  };

  const isInCart = (id?: number) => {
    if (!id) return false;
    return items.some((item) => item.productId === id);
  };

  const displayName =
    [user?.name, user?.surname].filter(Boolean).join(" ") ||
    user?.email?.split("@")[0] ||
    t("common.user");

  const avatarSrc = user?.avatarData
    ? user.avatarData.startsWith("http") || user.avatarData.startsWith("data:")
      ? user.avatarData
      : `data:image/jpeg;base64,${user.avatarData}`
    : null;

  const buttons: { label: string; tab: TabType; iconType: "books" | "favorite" | "newspaper" }[] = [
    { label: t("profile.tabs.myBooks"), tab: "myBooks", iconType: "books" },
    { label: t("profile.tabs.favorite"), tab: "favorite", iconType: "favorite" },
    { label: t("profile.tabs.myPosts"), tab: "myPosts", iconType: "newspaper" },
  ];

  const formatPrice = (value?: number | null) => {
    if (value == null || value === 0) return t("cart.zeroPrice");
    const formatted = new Intl.NumberFormat(locale === "uk" ? "uk-UA" : "en-US").format(value);
    return t("cart.price").replace("{value}", formatted);
  };

  const booksToDisplay = activeTab === "favorite" && loadingFavorites ? [] : getBooksForTab();

  const bookRows: ProductDto[][] = [];
  for (let i = 0; i < booksToDisplay.length; i += 2) {
    bookRows.push(booksToDisplay.slice(i, i + 2));
  }

  return (
    <div className="w-full min-h-screen bg-[#f5f3ee] flex flex-col font-['Source_Sans_3',sans-serif] pb-28 pt-[65px] select-none overflow-x-hidden">
      <div
        className="relative w-full pt-[24px] pb-[20px] px-4 sm:px-6 overflow-hidden min-h-[210px] sm:min-h-[220px] flex flex-col justify-end shadow-md"
        style={{
          backgroundImage: "url('/images/userProfile/Rectangle 326.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col w-full">
          <div className="flex items-start gap-3.5 sm:gap-4 w-full">
            <div className="w-[60px] h-[60px] rounded-full overflow-hidden border border-[#f5f3ee]/50 shadow-lg shrink-0 bg-[#3c2a1e] flex items-center justify-center">
              {avatarSrc ? (
                <img src={avatarSrc} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <img src="/images/header/person_24px.png" alt={t("nav.profile")} className="w-[30px] h-[30px] object-contain brightness-0 invert opacity-80" />
              )}
            </div>
            <div className="flex flex-col min-w-0 flex-1 justify-center pt-0.5">
              <span className="text-[20px] sm:text-[22px] font-bold text-[#f5f3ee] tracking-[-0.22px] leading-tight truncate">
                {displayName}
              </span>
              <p className="text-[13.5px] text-[#f5f3ee] font-bold tracking-[-0.154px] leading-snug truncate mt-1">
                @{user?.email?.split("@")[0] || t("common.userHandle")} · {!loadingMyBooks ? t("profile.mobile.booksCount").replace("{count}", String(myBooks.length)) : "..."} · {!loadingUserReviews ? t("profile.mobile.postsCount").replace("{count}", String(userReviews.length)) : "..."}
              </p>
              <p className="text-[13px] text-[#f5f3ee]/95 leading-snug tracking-[-0.154px] truncate mt-0.5">
                <span>{t("profile.mobile.bio")} </span>
                <span className="font-bold cursor-pointer underline">{t("profile.mobile.details")}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between w-full mt-4 pt-3 border-t border-[#f5f3ee]/15 pr-1">
            <div className="flex items-center gap-5">
              {SOCIALS.map(({ name, href, icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="active:scale-90 transition-transform"
                >
                  <img src={icon} alt={name} className="w-[36px] h-[36px] object-contain drop-shadow" />
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.push(lp("/library"))}
                className="px-3.5 py-1.5 rounded-full bg-[#005B33] text-[#f5f3ee] text-[13px] font-semibold tracking-tight shadow-md flex items-center gap-1.5 hover:bg-[#097E4B] active:scale-95 transition-all"
              >
                <svg className="w-4 h-4 text-[#f5f3ee] shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0-2-.9-2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z" />
                </svg>
                <span>{t("nav.library")}</span>
              </button>

              {userId && (
                <button
                  type="button"
                  onClick={() => router.push(lp(`/userProfile/editUserProfile/${userId}`))}
                  className="px-3.5 py-1.5 rounded-full bg-[#3c2a1e] text-[#f5f3ee] text-[13px] font-semibold tracking-tight shadow-md flex items-center gap-1.5 hover:bg-[#4d3728] active:scale-95 transition-all"
                >
                  <span>{t("profile.mobile.edit")}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-30 -mt-[33px] w-full max-w-[420px] mx-auto px-2 sm:px-4 flex justify-between gap-1.5 sm:gap-2">
        {buttons.map(({ label, tab, iconType }) => {
          const isSelected = activeTab === tab;
          return (
            <button
              key={label}
              type="button"
              onClick={() => setActiveTab(activeTab === tab ? null : tab)}
              className={`w-[32%] relative flex flex-col items-center justify-start pt-3 cursor-pointer transition-all duration-300 select-none ${
                isSelected
                  ? "h-[113px] pb-8 -mb-[13px] translate-y-[2px] scale-[1.02] brightness-105 drop-shadow-[0_10px_16px_rgba(0,0,0,0.35)] z-30"
                  : "h-[100px] pb-5 opacity-90 hover:opacity-100 drop-shadow-[0_6px_10px_rgba(0,0,0,0.25)] z-20 hover:-translate-y-0.5"
              }`}
              style={{
                backgroundImage: "url('/images/userProfile/recGr.svg')",
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
              }}
            >
              {iconType === "books" && (
                <svg className="w-[22px] h-[22px] text-[#f5f3ee] drop-shadow-sm shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3ZM19 19H7V5H19V19ZM9 7H17V9H9V7ZM9 11H17V13H9V11Z"/>
                </svg>
              )}
              {iconType === "favorite" && (
                <img
                  src="/images/userProfile/icon-heart.svg"
                  alt={label}
                  className="w-[22px] h-[22px] object-contain brightness-0 invert drop-shadow-sm shrink-0"
                />
              )}
              {iconType === "newspaper" && (
                <svg className="w-[22px] h-[22px] text-[#f5f3ee] drop-shadow-sm shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3ZM19 19H5V5H19V19ZM7 7H17V9H7V7ZM7 11H17V13H7V11ZM7 15H13V17H7V15Z"/>
                </svg>
              )}
              <span className="text-[#f5f3ee] text-[13px] font-bold mt-1.5 tracking-tight truncate px-1 w-full text-center">
                {label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 px-2 sm:px-4 flex flex-col w-full max-w-[440px] mx-auto">
        {bookRows.length === 0 ? (
          <div
            className="flex min-h-[380px] relative flex-col items-center justify-center w-full px-4 text-center mt-4 rounded-3xl"
            style={{
              backgroundImage: "url('/images/userProfile/Frame 627.png')",
              backgroundRepeat: "no-repeat",
              backgroundSize: "100% 100%",
              backgroundPosition: "center",
            }}
          >
            <div className="bg-[#f5f3ee]/90 backdrop-blur-sm p-6 rounded-2xl flex flex-col items-center max-w-[280px] shadow-lg border border-[#e0d8cc]">
              <img src="/images/userProfile/imgIko.png" alt={t("profile.emptyAlt")} className="w-[140px] h-auto object-contain drop-shadow" />
              <p className="mt-4 text-[#242424] text-[17px] font-bold tracking-tight">{t("profile.emptyTitle")}</p>
              <p className="text-[13px] text-[#242424]/70 mt-1">{t("profile.mobile.emptyHint")}</p>
            </div>
          </div>
        ) : (
          bookRows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="relative w-full flex flex-col items-center mb-6 sm:mb-8"
            >
              {/* Wooden Shelf Bar directly above cards (Figma Group3 / Rectangle 139 height 40px) */}
              <div className="relative z-20 w-full h-[40px] sm:h-[44px] shrink-0 pointer-events-none shadow-[0_4px_8px_rgba(0,0,0,0.28)]">
                <img
                  src="/images/userProfile/Group 187.png"
                  alt=""
                  className="w-full h-full object-fill"
                />
              </div>

              {/* Downward shadow cast by shelf directly behind hanging book cards */}
              <div className="absolute top-[40px] sm:top-[44px] left-0 right-0 h-[50px] bg-gradient-to-b from-black/25 via-black/10 to-transparent pointer-events-none z-0" />

              {/* Book Cards sitting right underneath the wooden shelf (Figma Group 458/Default) */}
              <div className="relative z-10 w-full grid grid-cols-2 gap-4 sm:gap-5 px-1 sm:px-3 pt-0">
                {row.map((book) => {
                  const imageSrc = getImageSrc(book);
                  const rating = book.id ? ratingByProductId.get(book.id) ?? 0 : 0;
                  const authorNames = (book.authorIds ?? [])
                    .map((id) => authorsById.get(id))
                    .filter(Boolean)
                    .join(", ");

                  return (
                    <div
                      key={book.id}
                      onClick={() => router.push(lp(`/products/${book.id}`))}
                      className="relative w-full bg-[#f5f3ee] rounded-t-none rounded-bl-[20px] rounded-br-[20px] shadow-[0_10px_14px_rgba(36,36,36,0.3)] border-b border-x border-[#e0d8cc] flex flex-col items-center transition-transform active:scale-[0.98] cursor-pointer overflow-visible"
                    >
                      {/* Format Badges on Left Edge (Figma Group4) */}
                      <div className="absolute left-[-2px] top-[14px] flex flex-col gap-1 z-30 pointer-events-auto">
                        {FORMAT_CONFIG
                          .filter((f) => (book.formatIds ?? []).includes(f.id))
                          .map((f) => (
                            <FormatBadge key={f.id} icon={f.icon} icon1={f.icon1} label={t(f.labelKey)} />
                          ))}
                      </div>

                      {/* Heart / Favorite Button (Figma icon/action/favorite_border_24px) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (book.id) toggleFavorite(book.id);
                        }}
                        className="absolute top-[14px] right-[6px] z-30 p-1 rounded-full hover:bg-black/10 transition-all active:scale-90"
                        aria-label={t("profile.ariaFavorite")}
                      >
                        <img
                          src={
                            isFav(book.id)
                              ? "/images/userProfile/heart-filled.svg"
                              : "/images/userProfile/icon-heart.svg"
                          }
                          alt=""
                          className="w-[24px] h-[24px] sm:w-[26px] sm:h-[26px] object-contain"
                        />
                      </button>

                      {/* Book Cover Image (Figma 310-828-new-250x250 1) */}
                      <div className="w-[90px] sm:w-[98px] h-[126px] sm:h-[136px] mt-[16px] rounded-[4px] overflow-hidden bg-[#e8e2d8] shadow-[0_4px_8px_rgba(0,0,0,0.25)] shrink-0 relative flex items-center justify-center">
                        {imageSrc ? (
                          <img
                            src={imageSrc}
                            alt={book.productName || ""}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                        ) : (
                          <span className="text-xs text-[#242424]/60 px-1 text-center font-medium">
                            {book.productName}
                          </span>
                        )}
                      </div>

                      {/* Card Info Block (Title, Author, Price, Cart) */}
                      <div className="w-full px-3 pt-2 pb-3 flex flex-col text-left flex-1 justify-between">
                        <div>
                          {/* Title (Lora Medium 16px) */}
                          <p className="font-['Lora',serif] font-medium text-[15px] sm:text-[16px] text-[#242424] leading-tight line-clamp-1 truncate">
                            {book.productName}
                          </p>

                          {/* Author (Source Sans Pro Regular 14px text-opacity 70%) */}
                          <p className="font-['Source_Sans_3',sans-serif] text-[13px] sm:text-[14px] text-[#242424]/70 leading-tight mt-0.5 truncate">
                            {authorNames || t("profile.unknownAuthor")}
                          </p>
                        </div>

                        {/* Price & Cart row (Figma 504 грн & shopping_basket_24px) */}
                        <div className="flex items-center justify-between w-full mt-3 pt-1 border-t border-[#242424]/10">
                          <span className="font-bold text-[15px] sm:text-[16px] text-[#242424] tracking-tight">
                            {formatPrice(book.price)}
                          </span>
                          <button
                            type="button"
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (book.id && !isInCart(book.id)) await addToCart(book.id);
                            }}
                            className="p-1 rounded-full hover:bg-black/5 active:scale-90 transition-all z-20"
                            aria-label={t("profile.ariaAddToCart")}
                          >
                            <img
                              src={
                                isInCart(book.id)
                                  ? "/images/userProfile/checkBuy.png"
                                  : "/images/userProfile/icon.svg"
                              }
                              alt=""
                              className="w-[30px] h-[30px] sm:w-[32px] sm:h-[32px] object-contain"
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
