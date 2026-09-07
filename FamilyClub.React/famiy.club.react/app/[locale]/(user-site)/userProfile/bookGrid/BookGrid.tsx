"use client";

import { AuthorDTO, ProductDto, ReviewDto } from "@/lib/api/generated";
import { getImageSrc } from "../hooks/useImageBook";
import { useEffect, useMemo, useState } from "react";
import { authorService, reviewService } from "@/lib/api/services";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/hooks/useCart";
import { FavoriteBook } from "@/lib/hooks/useFavorites";
import FormatBadge from "../section/FormatBadge";
import { useLocalizedPath, useTranslations } from "@/lib/i18n/LocaleProvider";

type Props = {
  books: ProductDto[];
  userId?: string;
  favorites: FavoriteBook[];
  toggleFavorite: (id: number) => void;
};

export default function BookGrid({ books, userId, favorites, toggleFavorite }: Props) {
  const t = useTranslations();
  const lp = useLocalizedPath();
  const [authors, setAuthors] = useState<AuthorDTO[]>([]);
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const { items, addToCart } = useCart();
  const router = useRouter();

  const FORMAT_CONFIG = [
    { id: 3, icon: "/images/userProfile/Property1.svg", icon1: "/images/userProfile/Rectangle 185.svg", label: t("profile.formats.paper") },
    { id: 1, icon: "/images/userProfile/Property2.svg", icon1: "/images/userProfile/Rectangle 186.svg", label: t("profile.formats.ebook") },
    { id: 2, icon: "/images/userProfile/Property3.svg", icon1: "/images/userProfile/Rectangle 188.svg", label: t("profile.formats.audio") },
  ];

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

  if (books.length === 0) {
    return (
      <div
        className="flex h-[680px] relative flex-col items-center justify-center"
        style={{
          backgroundImage: "url('/images/userProfile/Frame 627.png')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "100% 700px",
          backgroundPosition: "top center",
        }}
      >
        <img src="/images/userProfile/imgIko.png" alt={t("profile.emptyAlt")} className="w-[230px] h-[240px] object-contain" />
        <p className="mt-4 text-gray-500 text-lg">{t("profile.emptyTitle")}</p>
      </div>
    );
  }

  const rows: ProductDto[][] = [];
  for (let i = 0; i < books.length; i += 3) {
    rows.push(books.slice(i, i + 3));
  }

  return (
    <div className="flex flex-col w-full">
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          style={{ minHeight: "400px" }}
          className="relative w-full flex items-start justify-center gap-[130px] px-10 pt-21 overflow-hidden"
        >
          {/* Фон полиці — ззаду карток */}
          <img
            src="/images/userProfile/Frame 627.png"
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ objectFit: "fill", zIndex: 0 }}
          />
          <img
            src="/images/userProfile/Group 187.png"
            alt=""
            aria-hidden
            className="absolute inset-0 w-[100vw] h-[100px] pointer-events-none"
            style={{ objectFit: "fill", zIndex: 9 }}
          />
          {/* Картки */}
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
                className="relative flex flex-col items-center -mt-[3vh] pb-6 mb-10
                           transition-transform duration-300 ease-out
                           hover:translate-y-[16px]"
                style={{ zIndex: 7 }}
              >
                  {/* like button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!book.id) return;
                      toggleFavorite(book.id);
                    }}
                    className="absolute cursor-pointer top-16 right-2"
                    style={{ zIndex: 11 }}
                    aria-label={t("profile.ariaFavorite")}
                  >
                    <img
                      src={
                        isFav(book.id)
                          ? "/images/userProfile/icon-heart.svg"
                          : "/images/userProfile/heart-filled.svg"
                      }
                      className="w-[30px] h-[30px]"
                    />
                  </button>

                  {/* формати */}
                  <div
                    className="absolute left-[0px] top-[14vh] flex flex-col gap-1"
                    style={{ zIndex: 11 }}
                  >
                    {FORMAT_CONFIG
                      .filter((f) => (book.formatIds ?? []).includes(f.id))
                      .map((f) => (
                        <FormatBadge key={f.id} icon={f.icon} icon1={f.icon1} label={f.label} />
                      ))}
                  </div>

                  {/* CARD */}
                  <div
                    style={{ boxShadow: "0px 10px 10px 0px #2424244D" }}
                    className="w-[250px] h-[470px] bg-white rounded-b-[30px] flex flex-col items-center"
                  >
                    {/* IMAGE */}
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={book.productName ?? ""}
                        className="w-[150px] h-[230px] mt-[8vh] object-cover"
                      />
                    ) : (
                      <div className="w-[150px] h-[230px] mt-8 flex items-center justify-center text-sm text-gray-400 text-center px-2">
                        {book.productName}
                      </div>
                    )}

                    {/* INFO */}
                    <div className="mt-4 px-4 w-full text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-[#D9A441] text-sm">{ratingToStars(rating)}</span>
                        <span className="text-xs text-gray-500">({rating.toFixed(1)})</span>
                      </div>

                      <p className="font-semibold text-[15px] mt-2 line-clamp-2">{book.productName}</p>

                      <p className="text-sm text-gray-500 mt-1">{authorNames || t("profile.unknownAuthor")}</p>

                      <div>
                        <p className="text-[20px] font-semibold text-black mt-1">
                          {t("cart.price").replace("{value}", String(book.price))}
                        </p>
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!book.id) return;
                            if (!isInCart(book.id)) await addToCart(book.id);
                          }}
                          className="relative cursor-pointer bottom-[3.7vh] left-[10vw]"
                          style={{ zIndex: 11 }}
                          aria-label={t("profile.ariaAddToCart")}
                        >
                          <img
                            src={
                              isInCart(book.id)
                                ? "/images/userProfile/checkBuy.png"
                                : "/images/userProfile/icon.svg"
                            }
                            className="w-[32px] h-[32px]"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
