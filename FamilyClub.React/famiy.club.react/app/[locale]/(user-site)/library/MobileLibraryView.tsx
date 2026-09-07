"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthorDTO, CategoryDto, ProductDto, ReviewDto as ApiReviewDto } from "@/lib/api/generated";
import { authorService, categoriesService, productService, reviewService } from "@/lib/api/services";
import { getImageSrc } from "../userProfile/hooks/useImageBook";
import { useUserReviews } from "../userProfile/hooks/useUserReviews";
import { CurrentUser } from "../userProfile/hooks/useCurrentUser";
import { FavoriteBook } from "@/lib/hooks/useFavorites";
import FormatBadge from "../userProfile/section/FormatBadge";
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

const CARD_COLORS = [
  "#325747",
  "#51381E",
  "#2A2A2A",
  "#034359",
  "#521A1B",
  "#555555",
  "#245841",
  "#592A2B",
];

const FALLBACK_GENRE_KEYS = [
  "romance", "scienceFiction", "fantasy", "contemporary", "thriller",
  "youngAdult", "detective", "children", "biography", "historical",
  "horror", "adventure", "education", "classics", "business", "comics",
  "poetry", "memoirs", "drama", "psychology",
];

export type MobileLibraryViewProps = {
  user?: CurrentUser | null;
  userId?: string;
  favorites: FavoriteBook[];
  loadingFavorites: boolean;
  toggleFavorite: (id: number) => void;
  myBooks: ProductDto[];
  loadingMyBooks: boolean;
};

export default function MobileLibraryView({
  user,
  userId,
  favorites,
  toggleFavorite,
  myBooks,
  loadingMyBooks,
}: MobileLibraryViewProps) {
  const router = useRouter();
  const { locale } = useLocale();
  const t = useTranslations();
  const lp = useLocalizedPath();
  const { reviews: userReviews, loading: loadingUserReviews } = useUserReviews(userId);

  const [authors, setAuthors] = useState<AuthorDTO[]>([]);
  const [reviews, setReviews] = useState<ApiReviewDto[]>([]);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);

  // Sections open/closed state
  const [isRecentlyReadOpen, setIsRecentlyReadOpen] = useState(true);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(true);
  const [isAllOpen, setIsAllOpen] = useState(true);

  // Filter Drawer & Filter State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [yearFilter, setYearFilter] = useState("");
  const [onlyEbooks, setOnlyEbooks] = useState(false);
  const [onlyAudio, setOnlyAudio] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);

  useEffect(() => {
    authorService.apiAuthorsGet().then(setAuthors).catch(console.error);
    reviewService.apiReviewsGet().then(setReviews).catch(console.error);
    productService.apiProductsGet().then(setProducts).catch(console.error);
    categoriesService.apiCategoriesGet().then(setCategories).catch(console.error);
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

  const displayName =
    [user?.name, user?.surname].filter(Boolean).join(" ") ||
    user?.email?.split("@")[0] ||
    t("common.user");

  const avatarSrc = user?.avatarData
    ? user.avatarData.startsWith("http") || user.avatarData.startsWith("data:")
      ? user.avatarData
      : `data:image/jpeg;base64,${user.avatarData}`
    : null;

  // Pool of books inside user's library
  const libraryPool = useMemo(() => {
    return myBooks.length > 0 ? myBooks : products.slice(0, 16);
  }, [myBooks, products]);

  // Counts for header summary
  const ebookCount = useMemo(() => {
    return libraryPool.filter((b) => (b.formatIds ?? []).includes(1)).length;
  }, [libraryPool]);

  const audioCount = useMemo(() => {
    return libraryPool.filter((b) => (b.formatIds ?? []).includes(2)).length;
  }, [libraryPool]);

  // Genre list to display in Filter Modal
  const genreList = useMemo(() => {
    if (categories.length > 0) {
      return categories.map((c) => c.categoryName ?? "").filter(Boolean);
    }
    return FALLBACK_GENRE_KEYS.map((key) => t(`library.genres.${key}`));
  }, [categories, t]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  // Filtered and sorted books for "Усі" section
  const filteredAllBooks = useMemo(() => {
    let list = [...libraryPool];

    // Filter by Ebooks / Audio
    if (onlyEbooks || onlyAudio) {
      list = list.filter((b) => {
        const formats = b.formatIds ?? [];
        if (onlyEbooks && onlyAudio) return formats.includes(1) || formats.includes(2);
        if (onlyEbooks) return formats.includes(1);
        if (onlyAudio) return formats.includes(2);
        return true;
      });
    }

    // Filter by year
    if (yearFilter.trim()) {
      list = list.filter((b) => {
        if (!b.publishingDate) return false;
        const y = new Date(b.publishingDate).getFullYear().toString();
        return y.includes(yearFilter.trim());
      });
    }

    // Filter by genres
    if (selectedGenres.length > 0) {
      list = list.filter((b) => {
        if (categories.length > 0 && b.categoryIds) {
          const selectedCatIds = categories
            .filter((c) => c.categoryName && selectedGenres.includes(c.categoryName))
            .map((c) => c.id);
          return b.categoryIds.some((id) => selectedCatIds.includes(id));
        }
        return true;
      });
    }

    // Sort
    if (sortOrder === "asc") {
      list.sort((a, b) => (a.productName ?? "").localeCompare(b.productName ?? "", locale));
    } else if (sortOrder === "desc") {
      list.sort((a, b) => (b.productName ?? "").localeCompare(a.productName ?? "", locale));
    }

    return list;
  }, [libraryPool, onlyEbooks, onlyAudio, yearFilter, selectedGenres, categories, sortOrder, locale]);

  // Recently read subset
  const recentlyReadBooks = useMemo(() => {
    return libraryPool.slice(0, 4);
  }, [libraryPool]);

  // Favorites subset
  const favoriteBooks = useMemo(() => {
    const favIds = new Set(favorites.map((f) => f.id));
    const matched = libraryPool.filter((b) => b.id != null && favIds.has(b.id));
    return matched.length > 0 ? matched : libraryPool.slice(4, 8);
  }, [libraryPool, favorites]);

  const splitIntoRows = (books: ProductDto[]) => {
    const rows: ProductDto[][] = [];
    for (let i = 0; i < books.length; i += 2) {
      rows.push(books.slice(i, i + 2));
    }
    return rows;
  };

  const renderBookGrid = (books: ProductDto[]) => {
    const rows = splitIntoRows(books);
    if (rows.length === 0) {
      return (
        <div className="py-8 text-center text-[#242424]/60 text-sm font-medium">
          {t("library.noBooks")}
        </div>
      );
    }

    return (
      <div className="w-full pb-4 pt-4 px-3 sm:px-4 bg-[#c7a381]/25 rounded-b-[20px] border-x border-b border-[#c7a381]/40 shadow-inner flex flex-col gap-5">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="w-full grid grid-cols-2 gap-4 sm:gap-5">
            {row.map((book, idx) => {
              const imageSrc = getImageSrc(book);
              const rating = book.id ? ratingByProductId.get(book.id) ?? 4.5 : 4.5;
              const authorNames = (book.authorIds ?? [])
                .map((id) => authorsById.get(id))
                .filter(Boolean)
                .join(", ");

              const cardColor = CARD_COLORS[(book.id ?? idx) % CARD_COLORS.length];

              return (
                <div
                  key={book.id ?? `${rowIndex}-${idx}`}
                  onClick={() => router.push(lp(`/products/${book.id}`))}
                  className="relative w-full rounded-bl-[20px] rounded-br-[20px] rounded-t-none shadow-[0_10px_16px_rgba(36,36,36,0.4)] border-b border-x border-[#e0d8cc]/30 flex flex-col items-center transition-transform active:scale-[0.98] cursor-pointer overflow-hidden pb-4"
                  style={{ backgroundColor: cardColor }}
                >
                  {/* Format Badges on Top-Left Edge (Group 2 exact placement) */}
                  <div className="absolute left-[12px] top-[14px] flex flex-col gap-1 z-30 pointer-events-auto">
                    {FORMAT_CONFIG
                      .filter((f) => (book.formatIds ?? []).includes(f.id))
                      .map((f) => (
                        <FormatBadge key={f.id} icon={f.icon} icon1={f.icon1} label={t(f.labelKey)} />
                      ))}
                  </div>

                  {/* Favorite Heart Outline Icon (exact to Figma get_screenshot Group 916) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (book.id) toggleFavorite(book.id);
                    }}
                    className="absolute top-[14px] right-[14px] z-30 p-1 rounded-full hover:bg-black/20 transition-all active:scale-90"
                    aria-label={t("profile.ariaFavorite")}
                  >
                    <img
                      src={
                        isFav(book.id)
                          ? "/images/userProfile/heart-filled.svg"
                          : "/images/userProfile/icon-heart.svg"
                      }
                      alt=""
                      className="w-[26px] h-[26px] sm:w-[28px] sm:h-[28px] object-contain opacity-85 hover:opacity-100 transition-opacity drop-shadow-md"
                    />
                  </button>

                  {/* Book Cover Image - exact aspect ratio & placement */}
                  <div className="w-[100px] sm:w-[110px] aspect-[184/250] mt-[16px] rounded-[3px] overflow-hidden bg-[#e8e2d8] shadow-[0_6px_14px_rgba(0,0,0,0.4)] shrink-0 relative flex items-center justify-center">
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

                  {/* Card Info Block (Stars right under cover, then Title & Author - NO progress bars) */}
                  <div className="w-full px-3 pt-3 pb-0 flex flex-col text-center flex-1 justify-between">
                    <div>
                      {/* Stars Rating */}
                      <div className="flex items-center justify-center gap-0.5 mb-2 text-[#F5C518] text-[15px] sm:text-[16px] tracking-widest drop-shadow-sm">
                        {ratingToStars(rating)}
                      </div>

                      {/* Title in Lora Medium font */}
                      <p className="font-['Lora',serif] font-medium text-[17px] sm:text-[19px] text-[#f5f3ee] leading-snug line-clamp-2 truncate drop-shadow-sm">
                        {book.productName}
                      </p>

                      {/* Author in Source Sans 3 font */}
                      <p className="font-['Source_Sans_3',sans-serif] text-[13.5px] sm:text-[14.5px] text-[#f5f3ee]/75 leading-tight mt-1 truncate">
                        {authorNames || t("profile.unknownAuthor")}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#f5f3ee] flex flex-col font-['Source_Sans_3',sans-serif] pb-28 pt-[65px] select-none overflow-x-hidden">
      {/* 1. Profile Header Banner (Group 896) exact match to MobileUserProfileView */}
      <div
        className="relative w-full pt-[35px] pb-[25px] px-4 sm:px-6 overflow-hidden min-h-[220px] sm:min-h-[240px] flex flex-col justify-end shadow-md"
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
                @{user?.email?.split("@")[0] || t("common.userHandle")} · {!loadingMyBooks ? t("library.booksCount").replace("{count}", String(myBooks.length)) : "..."} · {!loadingUserReviews ? t("library.postsCount").replace("{count}", String(userReviews.length)) : "..."}
              </p>
              <p className="text-[13px] text-[#f5f3ee]/95 leading-snug tracking-[-0.154px] truncate mt-0.5">
                <span>{t("library.bio")} </span>
                <span className="font-bold cursor-pointer underline">{t("library.details")}</span>
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
                onClick={() => router.push(lp("/userProfile"))}
                className="px-3.5 py-1.5 rounded-full bg-[#3c2a1e] text-[#f5f3ee] text-[13px] font-semibold tracking-tight shadow-md flex items-center gap-1 hover:bg-[#4d3728] active:scale-95 transition-all"
              >
                <img src="/images/header/person_24px.png" alt="" className="w-3.5 h-3.5 object-contain brightness-0 invert opacity-90" />
                <span>{t("nav.profile")}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Full-Width Library Banner & Summary Bar (Group 1001 exact to Figma screenshot: no icon, continuous box, beige filter circle) */}
      <div className="relative z-30 -mt-[28px] w-full max-w-[440px] mx-auto px-4">
        <div
          className="w-full rounded-t-[20px] rounded-b-[16px] shadow-[0px_8px_20px_rgba(0,0,0,0.22)] flex flex-col overflow-hidden border border-[#e0d8cc]/40"
          style={{
            backgroundColor: "#c7a381",
            backgroundImage: "url('/images/userProfile/Rectangle 589.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Top Title: "Бібліотека" full width (NO book icon, continuous box exact to Figma) */}
          <div className="w-full py-3 sm:py-3.5 px-4 bg-[#c7a381]/85 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-[#242424] font-['Roboto_Mono',monospace] text-[17px] sm:text-[19px] font-bold tracking-tight">
              {t("nav.library")}
            </span>
          </div>

          {/* Bottom Row: Light Beige Filter circular button (Group 819) and "У вас" stats (Frame 1031) */}
          <div className="w-full px-4 sm:px-5 py-3.5 flex items-center justify-between bg-[#c7a381]/90 backdrop-blur-[1px]">
            {/* Left: Light Beige Filter circular button exact to Figma */}
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-[42px] h-[42px] rounded-full bg-[#dfcfbf] text-[#242424] flex items-center justify-center shadow hover:bg-[#d4c3b2] active:scale-90 transition-all shrink-0 border border-[#242424]/10"
              aria-label={t("library.filter")}
            >
              <svg className="w-5 h-5 text-[#242424] -rotate-90" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
              </svg>
            </button>

            {/* Right: Stats Summary (Frame 1031 & Frame 1030) */}
            <div className="flex items-center gap-4 sm:gap-5">
              <span className="font-['Source_Sans_3',sans-serif] text-[20px] sm:text-[22px] font-bold text-[#242424] tracking-tight">
                {t("library.yourCollection")}
              </span>
              <div className="flex flex-col text-right font-['Source_Sans_3',sans-serif] text-[14px] sm:text-[15px] font-medium text-[#242424] leading-snug">
                <span>{t("library.ebookCount").replace("{count}", String(ebookCount))}</span>
                <span>{t("library.audioCount").replace("{count}", String(audioCount))}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive Filter Drawer / Overlay (Group 1005 - Фільтр) */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="w-full max-h-[85vh] bg-[#f5f3ee] rounded-t-[28px] shadow-[0_-10px_25px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#e0d8cc] flex items-center justify-between shrink-0 bg-[#ebe5da]">
              <span className="text-[24px] font-bold text-[#242424]">{t("library.filter")}</span>
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 active:scale-90 transition-all text-[#242424] font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 overflow-y-auto flex flex-col gap-6">
              {/* Genres Section (Group 826) */}
              <div>
                <p className="text-[17px] font-bold text-[#242424] mb-3">{t("header.genres")}</p>
                <div className="flex flex-wrap gap-2">
                  {genreList.map((genre) => {
                    const selected = selectedGenres.includes(genre);
                    return (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => toggleGenre(genre)}
                        className={`px-3.5 py-1.5 rounded-full text-[14.5px] font-semibold transition-all border ${
                          selected
                            ? "bg-[#005B33] text-white border-[#005B33] shadow-sm scale-[1.02]"
                            : "bg-white/80 text-[#242424] border-[#d4b595] hover:bg-[#ebe5da]"
                        }`}
                      >
                        {genre}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Publication Year (Group 815 & Group 596) */}
              <div className="border-t border-[#e0d8cc] pt-5">
                <p className="text-[17px] font-bold text-[#242424] mb-2.5">{t("library.publicationYear")}</p>
                <input
                  type="text"
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  placeholder={t("library.yearPlaceholder")}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#d4b595] text-[#242424] text-[15px] outline-none focus:border-[#005B33] shadow-inner"
                />
              </div>

              {/* Format Checkboxes (Frame 1034) */}
              <div className="border-t border-[#e0d8cc] pt-5 flex flex-col gap-3.5">
                <label className="flex items-center justify-between cursor-pointer select-none">
                  <span className="text-[16px] font-semibold text-[#242424]">{t("profile.filter.ebookOnly")}</span>
                  <input
                    type="checkbox"
                    checked={onlyEbooks}
                    onChange={(e) => setOnlyEbooks(e.target.checked)}
                    className="w-6 h-6 accent-[#005B33] rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer select-none">
                  <span className="text-[16px] font-semibold text-[#242424]">{t("profile.filter.audioOnly")}</span>
                  <input
                    type="checkbox"
                    checked={onlyAudio}
                    onChange={(e) => setOnlyAudio(e.target.checked)}
                    className="w-6 h-6 accent-[#005B33] rounded cursor-pointer"
                  />
                </label>
              </div>

              {/* Sorting (Group 816) */}
              <div className="border-t border-[#e0d8cc] pt-5">
                <p className="text-[17px] font-bold text-[#242424] mb-3">{t("profile.filter.alphabet")}</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSortOrder(sortOrder === "asc" ? null : "asc")}
                    className={`flex-1 py-2.5 rounded-xl text-[15px] font-semibold border transition-all ${
                      sortOrder === "asc"
                        ? "bg-[#005B33] text-white border-[#005B33] shadow-md"
                        : "bg-white text-[#242424] border-[#d4b595] hover:bg-[#ebe5da]"
                    }`}
                  >
                    {t("profile.filter.az")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortOrder(sortOrder === "desc" ? null : "desc")}
                    className={`flex-1 py-2.5 rounded-xl text-[15px] font-semibold border transition-all ${
                      sortOrder === "desc"
                        ? "bg-[#005B33] text-white border-[#005B33] shadow-md"
                        : "bg-white text-[#242424] border-[#d4b595] hover:bg-[#ebe5da]"
                    }`}
                  >
                    {t("profile.filter.za")}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Bottom Apply Button (Group 818/Default) */}
            <div className="p-4 border-t border-[#e0d8cc] bg-[#ebe5da] flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setSelectedGenres([]);
                  setYearFilter("");
                  setOnlyEbooks(false);
                  setOnlyAudio(false);
                  setSortOrder(null);
                }}
                className="px-5 py-2.5 rounded-full text-sm font-semibold text-[#242424] hover:bg-black/10 transition-all"
              >
                {t("library.reset")}
              </button>
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="px-7 py-2.5 rounded-full bg-[#005B33] text-white text-sm font-bold shadow-md hover:bg-[#097E4B] active:scale-95 transition-all"
              >
                {t("header.apply")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Library Sections (Group 1017: green headers Group 998 with white text/arrow exact to Figma screenshot) */}
      <div className="mt-4 px-3 sm:px-4 flex flex-col w-full max-w-[440px] mx-auto">
        {/* Section 1: Останнє що читали */}
        <div className="w-full flex flex-col mb-6">
          <div
            onClick={() => setIsRecentlyReadOpen(!isRecentlyReadOpen)}
            className="w-full h-[60px] sm:h-[66px] rounded-t-[16px] rounded-b-[16px] shadow-md px-4 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] border border-[#e0d8cc]/20"
            style={{
              background: "linear-gradient(90deg, rgba(0, 91, 51, 0.45) 0%, rgba(0, 91, 51, 0.45) 100%), #c7a381",
              backgroundImage: "linear-gradient(90deg, rgba(0, 91, 51, 0.45) 0%, rgba(0, 91, 51, 0.45) 100%), url('/images/userProfile/Rectangle 589.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <span className="text-[18px] sm:text-[20px] font-bold text-[#f5f3ee] tracking-tight drop-shadow-sm">
              {t("library.recentlyRead")}
            </span>
            <div className={`transition-transform duration-300 ${isRecentlyReadOpen ? "rotate-0" : "rotate-180"}`}>
              <svg className="w-6 h-6 text-[#f5f3ee] drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.8} d="M5 15l7-7 7 7" />
              </svg>
            </div>
          </div>

          {isRecentlyReadOpen && renderBookGrid(recentlyReadBooks)}
        </div>

        {/* Section 2: Улюблені */}
        <div className="w-full flex flex-col mb-6">
          <div
            onClick={() => setIsFavoritesOpen(!isFavoritesOpen)}
            className="w-full h-[60px] sm:h-[66px] rounded-t-[16px] rounded-b-[16px] shadow-md px-4 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] border border-[#e0d8cc]/20"
            style={{
              background: "linear-gradient(90deg, rgba(0, 91, 51, 0.45) 0%, rgba(0, 91, 51, 0.45) 100%), #c7a381",
              backgroundImage: "linear-gradient(90deg, rgba(0, 91, 51, 0.45) 0%, rgba(0, 91, 51, 0.45) 100%), url('/images/userProfile/Rectangle 589.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <span className="text-[18px] sm:text-[20px] font-bold text-[#f5f3ee] tracking-tight drop-shadow-sm">
              {t("profile.tabs.favorite")}
            </span>
            <div className={`transition-transform duration-300 ${isFavoritesOpen ? "rotate-0" : "rotate-180"}`}>
              <svg className="w-6 h-6 text-[#f5f3ee] drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.8} d="M5 15l7-7 7 7" />
              </svg>
            </div>
          </div>

          {isFavoritesOpen && renderBookGrid(favoriteBooks)}
        </div>

        {/* Section 3: Усі */}
        <div className="w-full flex flex-col mb-6">
          <div
            onClick={() => setIsAllOpen(!isAllOpen)}
            className="w-full h-[60px] sm:h-[66px] rounded-t-[16px] rounded-b-[16px] shadow-md px-4 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] border border-[#e0d8cc]/20"
            style={{
              background: "linear-gradient(90deg, rgba(0, 91, 51, 0.45) 0%, rgba(0, 91, 51, 0.45) 100%), #c7a381",
              backgroundImage: "linear-gradient(90deg, rgba(0, 91, 51, 0.45) 0%, rgba(0, 91, 51, 0.45) 100%), url('/images/userProfile/Rectangle 589.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <span className="text-[18px] sm:text-[20px] font-bold text-[#f5f3ee] tracking-tight drop-shadow-sm">
              {t("library.all")}
            </span>
            <div className={`transition-transform duration-300 ${isAllOpen ? "rotate-0" : "rotate-180"}`}>
              <svg className="w-6 h-6 text-[#f5f3ee] drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.8} d="M5 15l7-7 7 7" />
              </svg>
            </div>
          </div>

          {isAllOpen && renderBookGrid(filteredAllBooks)}
        </div>
      </div>
    </div>
  );
}
