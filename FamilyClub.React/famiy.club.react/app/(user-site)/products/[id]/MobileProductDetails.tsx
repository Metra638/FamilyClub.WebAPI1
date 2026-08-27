"use client";

import { alertSuccess, alertWarning } from "@/lib/ui/sweetAlert";
import React from "react";
import Link from "next/link";
import { ProductDto, CoverType } from "@/lib/api/generated";
import ReviewPagination from "./ReviewPagination";

type ReviewCardData = {
  id: number | string;
  author: string;
  text: string;
  timeLabel: string;
  avatar?: string | null;
  bookImage?: string | null;
  likesCount?: number;
};

type MobileProductDetailsProps = {
  product?: ProductDto;
  authorName: string;
  authorPhoto: string;
  categoryLabel: string;
  formatDisplay: string;
  pageCountText: string;
  pageCountValue: string;
  weightText: string;
  yearText: string;
  languageName: string;
  publisherName: string;
  priceText: string;
  rating: number;
  ratingCount: number;
  reviews: ReviewCardData[];
  currentReviewPage: number;
  totalReviewPages: number;
  onReviewPageChange: (page: number) => void;
  booksByAuthorCards: any[];
  similarBookCards: any[];
  isFavorite: boolean;
  toggleFavorite: () => void;
  addToCart: (id: number) => Promise<boolean>;
  galleryImages: string[];
  displayImage?: string | null;
  setSelectedImage: (img: string | null) => void;
  newComment?: string;
  setNewComment?: (val: string) => void;
  isSubmittingComment?: boolean;
  handleCommentSubmit?: () => void;
};

const clampRating = (value: number) => Math.max(0, Math.min(5, value));
const ratingToStars = (rating: number) => {
  const rounded = clampRating(Math.round(rating));
  return Array.from({ length: 5 }, (_, index) =>
    index < rounded ? "★" : "☆"
  ).join(" ");
};

export default function MobileProductDetails({
  product,
  authorName,
  authorPhoto,
  categoryLabel,
  formatDisplay,
  pageCountText,
  pageCountValue,
  weightText,
  yearText,
  languageName,
  publisherName,
  priceText,
  rating,
  ratingCount,
  reviews,
  currentReviewPage,
  totalReviewPages,
  onReviewPageChange,
  booksByAuthorCards = [],
  similarBookCards = [],
  isFavorite,
  toggleFavorite,
  addToCart,
  galleryImages,
  displayImage,
  setSelectedImage,
  newComment = "",
  setNewComment,
  isSubmittingComment = false,
  handleCommentSubmit,
}: MobileProductDetailsProps) {
  const productTitle = product?.productName ?? "";
  const descriptionText = product?.description ?? "Опис книги відсутній.";
  const thumbnails = galleryImages.slice(0, 4);

  return (
    <div className="relative min-h-screen w-full bg-[#f5f3ee] pb-[100px] select-none text-[#242424] overflow-x-hidden font-sans">
      {/* Top Board Section (Figma Node 2298:4517 - Warm Wood/Tan Board #c7a381) */}
      <div className="relative w-full bg-[#c7a381] pt-[85px] pb-10 shadow-[0_14px_40px_rgba(0,0,0,0.35)]">
        
        {/* 1. Book Info & Cover Header */}
        <div className="px-4 sm:px-6 flex gap-3 sm:gap-5 items-start">
          {/* Left Column: Cover + Thumbnails */}
          <div className="w-[160px] sm:w-[180px] shrink-0 flex flex-col items-center">
            <div className="w-full h-[230px] sm:h-[250px] bg-white rounded-[6px] p-1.5 shadow-[0_6px_15px_rgba(0,0,0,0.3)] relative flex items-center justify-center">
              {displayImage ? (
                <img
                  src={displayImage}
                  alt={productTitle}
                  className="w-full h-full object-contain rounded-[4px]"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 text-center p-2">
                  <span className="text-3xl mb-1">📖</span>
                  <span className="text-xs font-serif">Немає фото</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {thumbnails.length > 1 && (
              <div className="flex gap-1.5 mt-2.5 w-full justify-center">
                {thumbnails.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`w-[36px] h-[50px] rounded-[4px] bg-white p-0.5 shadow-sm transition-transform ${
                      displayImage === img ? "ring-2 ring-[#0e503f] scale-105" : "opacity-75 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain rounded-[2px]" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Title, Author, Price Box, Format Ribbons */}
          <div className="flex-1 flex flex-col justify-start min-w-0 pt-1">
            <h1 className="font-sans font-bold text-[26px] sm:text-[30px] text-[#242424] leading-[1.2] tracking-tight">
              {productTitle}
            </h1>

            {authorName && (
              <div className="text-[14px] text-[#242424]/80 mt-1 font-medium">
                Автор: <span className="font-semibold text-[#242424]">{authorName}</span>
              </div>
            )}

            {/* Price Box with Heart & Cart Button */}
            <div className="mt-3 bg-[#f5f3ee] rounded-[8px] border border-[#242424]/15 p-3 relative shadow-sm flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[12px] text-[#242424]/70">Ціна в Libria:</div>
                  <div className="text-[22px] sm:text-[24px] font-bold text-[#242424] leading-tight mt-0.5">
                    {priceText || "0 грн"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleFavorite}
                  className="w-[38px] h-[38px] rounded-full flex items-center justify-center hover:bg-black/5 active:scale-90 transition-all"
                  aria-label="Улюблене"
                >
                  <img
                    src="/images/main_page/icons/rec-icon-favorite.svg"
                    alt="Heart"
                    className={`w-[26px] h-[26px] transition-transform ${isFavorite ? "filter invert-[0.2] sepia-[1] saturate-[5] hue-rotate-[320deg] scale-110" : "opacity-80"}`}
                  />
                </button>
              </div>

              {/* Кнопка "Додати в кошик" */}
              <button
                type="button"
                onClick={async () => {
                  if (!product?.id) return;
                  const ok = await addToCart(product.id);
                  if (ok) {
                    await alertSuccess("Товар додано в кошик");
                  } else {
                    await alertWarning("Увійдіть в акаунт, щоб додати товар у кошик");
                  }
                }}
                className="w-full py-3 px-4 rounded-[10px] bg-[#0e503f] hover:bg-[#093529] active:scale-[0.98] transition-all text-white font-bold text-[16px] flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(14,80,63,0.35)] cursor-pointer"
              >
                <img
                  src="/images/main_page/icons/rec-icon-basket.svg"
                  alt=""
                  className="w-[20px] h-[20px] brightness-200"
                />
                <span>Додати в кошик</span>
              </button>
            </div>

            {/* Format Ribbons (Паперова, eBooks, Аудіо книга) */}
            <div className="flex flex-col gap-1.5 mt-3.5">
              <div className="flex items-center justify-between bg-[#7e4d1e] text-white rounded-l-[6px] h-[30px] px-2.5 w-[125px] shadow-sm text-[13px] font-medium">
                <span>Паперова</span>
                <img src="/images/main_page/icons/rec-icon-paper.svg" alt="" className="w-4 h-4 brightness-200" />
              </div>
              <div className="flex items-center justify-between bg-[#0e503f] text-white rounded-l-[6px] h-[30px] px-2.5 w-[115px] shadow-sm text-[13px] font-medium">
                <span>eBooks</span>
                <img src="/images/main_page/icons/rec-icon-ebook.svg" alt="" className="w-4 h-4 brightness-200" />
              </div>
              <div className="flex items-center justify-between bg-[#7e4d1e] text-white rounded-l-[6px] h-[30px] px-2.5 w-[135px] shadow-sm text-[13px] font-medium">
                <span>Аудіо книга</span>
                <img src="/images/main_page/icons/rec-icon-audio.svg" alt="" className="w-4 h-4 brightness-200" />
              </div>
            </div>

            {/* Page Count, Line, Genre & Rating */}
            <div className="mt-3.5 text-[14px] text-[#242424]">
              {pageCountText && <div className="font-medium">{pageCountText}</div>}
              <div className="border-b border-[#242424]/25 my-1.5 w-full" />
              {categoryLabel && <div className="font-semibold underline text-[#242424]">{categoryLabel}</div>}
              <div className="text-[16px] text-[#7e4d1e] tracking-widest mt-1 font-bold">
                {ratingToStars(rating || 0)}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Description Box ("Опис") */}
        <div className="mx-4 sm:mx-6 mt-7 bg-[#f5f3ee] rounded-[16px] p-5 shadow-[0_6px_20px_rgba(0,0,0,0.18)] border border-[#242424]/10">
          <h2 className="text-[22px] font-bold text-[#242424] mb-2.5">Опис</h2>
          <div className="text-[14px] text-[#242424] leading-[1.6] whitespace-pre-wrap">
            {descriptionText}
          </div>
        </div>

        {/* 3. Author Banner ("Ві Кіланд") */}
        {authorName && (
          <div className="mx-4 sm:mx-6 mt-6 bg-gradient-to-r from-[#5a3512] to-[#7e4d1e] rounded-[14px] p-4 shadow-md flex items-center justify-between text-[#f5f3ee] border border-white/10">
            <div className="flex items-center gap-3.5">
              {authorPhoto ? (
                <img src={authorPhoto} alt={authorName} className="w-[54px] h-[54px] rounded-full object-cover border-2 border-[#f5f3ee] shadow-sm" />
              ) : (
                <div className="w-[54px] h-[54px] rounded-full bg-white/20 border-2 border-[#f5f3ee] flex items-center justify-center font-bold text-xl">
                  {authorName.charAt(0)}
                </div>
              )}
              <span className="text-[22px] font-bold tracking-tight">{authorName}</span>
            </div>
            <button
              type="button"
              className="w-[42px] h-[42px] rounded-full bg-[#f5f3ee] text-[#242424] flex items-center justify-center text-2xl font-bold shadow-md hover:scale-105 transition-transform"
              aria-label="Більше про автора"
            >
              +
            </button>
          </div>
        )}

        {/* Books by Author Cards */}
        {booksByAuthorCards && booksByAuthorCards.length > 0 && (
          <div className="mt-5 px-4 sm:px-6">
            <div className="text-[18px] font-bold text-[#242424] mb-3">Інші книги автора:</div>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {booksByAuthorCards.map((book: any, idx: number) => (
                <div
                  key={idx}
                  className="w-[160px] shrink-0 bg-gradient-to-b from-[#f5f3ee] to-[#e8e6e1] rounded-b-[16px] rounded-t-[6px] p-2.5 shadow-md border border-[#242424]/10 flex flex-col justify-between relative"
                >
                  <Link href={book.href || "#"} className="w-[110px] h-[145px] mx-auto bg-white rounded-[4px] p-1 shadow-sm flex items-center justify-center mt-1">
                    {book.image ? (
                      <img src={book.image} alt={book.title} className="w-full h-full object-contain" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400 text-center p-1">
                        <span className="text-xl">📖</span>
                        <span className="text-[9px] font-serif">Немає фото</span>
                      </div>
                    )}
                  </Link>

                  <div className="mt-2.5">
                    <Link href={book.href || "#"} className="font-bold text-[14px] text-[#242424] block truncate hover:underline">
                      {book.title || ""}
                    </Link>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#242424]/10">
                    <span className="font-bold text-[15px] text-[#242424]">{book.price || ""}</span>
                    <button
                      type="button"
                      onClick={async () => {
                        const targetId = book.id ?? product?.id;
                        if (!targetId) return;
                        const ok = await addToCart(targetId);
                        if (ok) {
                          await alertSuccess("Товар додано в кошик");
                        } else {
                          await alertWarning("Увійдіть в акаунт, щоб додати товар у кошик");
                        }
                      }}
                      className="w-[32px] h-[32px] rounded-full bg-[#0e503f] text-white flex items-center justify-center shadow-sm hover:bg-[#093529] transition-colors"
                    >
                      <img src="/images/main_page/icons/rec-icon-basket.svg" alt="" className="w-4 h-4 brightness-200" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Characteristics Section ("Характеристика") */}
        <div className="mx-4 sm:mx-6 mt-8">
          <h2 className="text-[28px] sm:text-[32px] font-bold text-[#242424] text-center mb-5">
            Характеристика
          </h2>
          <div className="bg-white/40 backdrop-blur-sm rounded-[14px] p-4 sm:p-5 border border-[#242424]/10 shadow-sm">
            <div className="grid grid-cols-[130px_1fr] sm:grid-cols-[150px_1fr] gap-y-3 text-[15px] sm:text-[16px]">
              <div className="text-[#242424]/75">Код товару:</div>
              <div className="font-medium text-[#242424]">{product?.productCode ?? `#${product?.id ?? ""}`}</div>

              <div className="text-[#242424]/75">Назва книги:</div>
              <div className="font-medium text-[#242424]">{productTitle}</div>

              {pageCountValue && (
                <>
                  <div className="text-[#242424]/75">Сторінок:</div>
                  <div className="font-medium text-[#242424]">{pageCountValue}</div>
                </>
              )}

              {weightText && (
                <>
                  <div className="text-[#242424]/75">Вага:</div>
                  <div className="font-medium text-[#242424]">{weightText}</div>
                </>
              )}

              {yearText && (
                <>
                  <div className="text-[#242424]/75">Рік видання:</div>
                  <div className="font-medium text-[#242424]">{yearText}</div>
                </>
              )}

              {categoryLabel && (
                <>
                  <div className="text-[#242424]/75">Жанри:</div>
                  <div className="font-semibold underline text-[#242424]">{categoryLabel}</div>
                </>
              )}

              {authorName && (
                <>
                  <div className="text-[#242424]/75">Автор:</div>
                  <div className="font-semibold underline text-[#242424]">{authorName}</div>
                </>
              )}

              {languageName && (
                <>
                  <div className="text-[#242424]/75">Мова:</div>
                  <div className="font-medium text-[#242424]">{languageName}</div>
                </>
              )}

              {publisherName && (
                <>
                  <div className="text-[#242424]/75">Видавництво:</div>
                  <div className="font-medium text-[#242424]">{publisherName}</div>
                </>
              )}

              {product?.coverType != null && (
                <>
                  <div className="text-[#242424]/75">Обкладинка:</div>
                  <div className="font-medium text-[#242424]">
                    {product.coverType === CoverType.NUMBER_1 ? "Мʼяка" : "Тверда"}
                  </div>
                </>
              )}

              {formatDisplay && (
                <>
                  <div className="text-[#242424]/75">Формат:</div>
                  <div className="font-medium text-[#242424]">{formatDisplay}</div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 5. Similar Books Section ("Схожі:") */}
        <div className="mt-8">
          <h2 className="text-[24px] font-bold text-[#242424] mx-4 sm:mx-6 mb-4">
            Схожі:
          </h2>
          {similarBookCards.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto px-4 sm:px-6 pb-4 no-scrollbar">
              {similarBookCards.map((sim, idx) => (
                <div
                  key={idx}
                  className="w-[170px] shrink-0 bg-gradient-to-b from-[#f5f3ee] to-[#e8e6e1] rounded-b-[18px] rounded-t-[6px] p-3 shadow-md border border-[#242424]/10 flex flex-col justify-between relative"
                >
                  {/* Format Ribbons on card left */}
                  <div className="absolute left-0 top-3 flex flex-col gap-1 z-10">
                    <div className="w-[22px] h-[18px] bg-[#7e4d1e] rounded-r-[3px] flex items-center justify-center">
                      <img src="/images/main_page/icons/rec-icon-paper.svg" alt="" className="w-3 h-3 brightness-200" />
                    </div>
                    <div className="w-[22px] h-[18px] bg-[#0e503f] rounded-r-[3px] flex items-center justify-center">
                      <img src="/images/main_page/icons/rec-icon-ebook.svg" alt="" className="w-3 h-3 brightness-200" />
                    </div>
                  </div>

                  {/* Heart icon on top right */}
                  <button type="button" className="absolute right-2 top-2 z-10 opacity-70 hover:opacity-100">
                    <img src="/images/main_page/icons/rec-icon-favorite.svg" alt="" className="w-5 h-5" />
                  </button>

                  {/* Book Cover */}
                  <Link href={sim.href || "#"} className="w-[120px] h-[160px] mx-auto bg-white rounded-[4px] p-1 shadow-sm flex items-center justify-center mt-2">
                    {sim.image ? (
                      <img src={sim.image} alt={sim.title} className="w-full h-full object-contain" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400 text-center p-1">
                        <span className="text-xl">📖</span>
                        <span className="text-[10px] font-serif">Немає фото</span>
                      </div>
                    )}
                  </Link>

                  <div className="mt-3">
                    <Link href={sim.href || "#"} className="font-bold text-[15px] text-[#242424] block truncate hover:underline">
                      {sim.title || ""}
                    </Link>
                    <div className="text-[13px] text-[#242424]/70 truncate mt-0.5">
                      {sim.author || ""}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#242424]/10">
                    <span className="font-bold text-[16px] text-[#242424]">{sim.price || ""}</span>
                    <button
                      type="button"
                      onClick={async () => {
                        const targetId = sim.id ?? product?.id;
                        if (!targetId) return;
                        const ok = await addToCart(targetId);
                        if (ok) {
                          await alertSuccess("Товар додано в кошик");
                        } else {
                          await alertWarning("Увійдіть в акаунт, щоб додати товар у кошик");
                        }
                      }}
                      className="w-[32px] h-[32px] rounded-full bg-[#0e503f] text-white flex items-center justify-center shadow-sm hover:bg-[#093529] transition-colors"
                    >
                      <img src="/images/main_page/icons/rec-icon-basket.svg" alt="" className="w-4 h-4 brightness-200" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mx-4 sm:mx-6 px-4 py-6 bg-white/40 backdrop-blur-sm rounded-[14px] text-center text-[14px] text-[#242424]/60 border border-[#242424]/10">
              Схожих книг в даній категорії поки що немає.
            </div>
          )}
        </div>

        {/* 6. Torn Paper Bottom Edge on the Board */}
        <div className="absolute -bottom-[1px] left-0 right-0 w-full overflow-hidden leading-none text-[#c7a381]">
          <svg className="w-full h-[14px] block" viewBox="0 0 1200 10" fill="currentColor" preserveAspectRatio="none">
            <path d="M0,10 L0,5 C 15,2 30,7 45,4 S 75,1 90,5 S 120,2 135,6 S 165,1 180,4 S 210,7 225,3 S 255,1 270,5 S 300,2 315,6 S 345,1 360,4 S 390,7 405,3 S 435,1 450,5 S 480,2 495,6 S 525,1 540,4 S 570,7 585,3 S 615,1 630,5 S 660,2 675,6 S 705,1 720,4 S 750,7 765,3 S 795,1 810,5 S 840,2 855,6 S 885,1 900,4 S 930,7 945,3 S 975,1 990,5 S 1020,2 1035,6 S 1065,1 1080,4 S 1110,7 1125,3 S 1155,1 1170,5 S 1185,3 1200,4 L1200,10 Z" />
          </svg>
        </div>
      </div>

      {/* Cream Paper Bottom Section (#f5f3ee) */}
      <div className="pt-6 px-4 sm:px-6">
        {/* 7. Community Banner Button ("Перейти до спільноти") */}
        <Link
          href="/userProfile"
          className="bg-gradient-to-r from-[#5a3512] to-[#7e4d1e] rounded-[14px] p-4 shadow-[0_6px_20px_rgba(0,0,0,0.2)] flex items-center justify-between text-[#ffd9d9] border border-white/10 group mb-6"
        >
          <div className="w-[50px] h-[60px] bg-white rounded-[4px] p-0.5 shrink-0 shadow-sm flex items-center justify-center">
            {displayImage ? (
              <img src={displayImage} alt="" className="w-full h-full object-contain" />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 text-center p-0.5">
                <span className="text-sm">📖</span>
                <span className="text-[8px] font-serif">Немає фото</span>
              </div>
            )}
          </div>
          <span className="text-[18px] sm:text-[20px] font-bold ml-4 flex-1 tracking-tight group-hover:underline">
            Перейти до спільноти
          </span>
          <span className="text-2xl font-bold transition-transform group-hover:translate-x-1">→</span>
        </Link>

        {/* 8. Reviews List (Comments) */}
        <div className="flex flex-col gap-4 mb-6">
          {reviews.length > 0 ? (
            reviews.map((rev, idx) => (
              <div
                key={idx}
                className="bg-white rounded-[18px] p-4 sm:p-5 shadow-[0_4px_15px_rgba(0,0,0,0.08)] border border-[#242424]/10 flex flex-col justify-between"
              >
                {/* Header: Avatar + Author */}
                <div className="flex items-center gap-3">
                  {rev.avatar ? (
                    <img src={rev.avatar} alt="" className="w-[34px] h-[34px] rounded-full object-cover shadow-sm" />
                  ) : (
                    <div className="w-[34px] h-[34px] rounded-full bg-[#e8e6e1] text-[#7e4d1e] font-mono font-bold flex items-center justify-center text-sm shadow-sm">
                      {rev.author ? rev.author.charAt(0).toUpperCase() : "?"}
                    </div>
                  )}
                  <span className="font-mono font-bold text-[15px] text-[#242424]">
                    {rev.author || "Користувач"}
                  </span>
                </div>

                {/* Body: Text + Book Thumbnail */}
                <div className="flex gap-3.5 mt-3 items-start">
                  <p className="flex-1 text-[14px] text-[#242424] leading-[1.6] font-sans">
                    {rev.text}
                  </p>
                  <div className="w-[65px] h-[90px] rounded-[6px] bg-[#fcfbf8] border border-gray-200 p-1 shrink-0 flex items-center justify-center shadow-sm">
                    {displayImage ? (
                      <img src={displayImage} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400 text-center p-0.5">
                        <span className="text-xl">📖</span>
                        <span className="text-[8px] font-serif">Немає фото</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer: Time + Actions */}
                <div className="flex items-center justify-between text-[13px] text-[#242424]/60 mt-4 pt-2.5 border-t border-gray-100">
                  <span>{rev.timeLabel || ""}</span>
                  <div className="flex items-center gap-4">
                    <button type="button" className="hover:text-black transition-colors" title="Поскаржитись / Опції">
                      <img src="/images/header/more_horiz_24px.svg" alt="..." className="w-5 h-5 opacity-70" />
                    </button>
                    <div className="flex items-center gap-1.5 font-medium text-[#242424]">
                      <span>{rev.likesCount || 0}</span>
                      <button type="button" className="hover:scale-110 transition-transform">
                        <img src="/images/main_page/icons/rec-icon-favorite.svg" alt="Like" className="w-5 h-5 opacity-80" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-[18px] p-8 text-center shadow-sm border border-[#242424]/10 my-2">
              <p className="font-serif text-lg text-[#242424]/70">Поки що немає відгуків на цю книгу.</p>
              <p className="mt-1 text-xs text-[#242424]/50">Станьте першим, хто поділиться своїми враженнями!</p>
            </div>
          )}

          {reviews.length > 0 && (
            <ReviewPagination
              currentPage={currentReviewPage}
              totalPages={totalReviewPages}
              onPageChange={onReviewPageChange}
            />
          )}
        </div>

        {/* 9. Add Comment Input Bar */}
        <div className="bg-white h-[56px] rounded-full shadow-[0_4px_20px_rgba(36,36,36,0.15)] px-5 flex items-center justify-between border border-[#242424]/15 mb-6">
          <input
            type="text"
            placeholder="Додайте коментар..."
            value={newComment}
            onChange={(e) => setNewComment?.(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCommentSubmit?.()}
            disabled={isSubmittingComment}
            className="bg-transparent text-[14px] text-[#242424] placeholder-[#242424]/50 focus:outline-none flex-1 pr-4 font-sans"
          />
          <button
            type="button"
            onClick={handleCommentSubmit}
            disabled={isSubmittingComment || !newComment.trim()}
            className="w-[42px] h-[42px] rounded-full bg-[#0e503f] text-white flex items-center justify-center shadow-md hover:bg-[#093529] transition-transform active:scale-95 shrink-0 disabled:opacity-50"
            aria-label="Відправити"
          >
            {isSubmittingComment ? "..." : (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* 10. Sticky / Fixed Bottom Action Bar for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#f5f3ee]/95 backdrop-blur-md border-t border-[#242424]/15 px-4 py-2.5 shadow-[0_-4px_25px_rgba(0,0,0,0.18)] flex items-center justify-between gap-3 sm:gap-4 md:hidden">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {displayImage ? (
            <img src={displayImage} alt="" className="w-[36px] h-[48px] object-contain rounded-[4px] bg-white p-0.5 shadow-xs shrink-0" />
          ) : (
            <div className="w-[36px] h-[48px] rounded-[4px] bg-white flex items-center justify-center shrink-0">📖</div>
          )}
          <div className="min-w-0 flex-1">
            <div className="font-bold text-[14px] text-[#242424] truncate">{productTitle}</div>
            <div className="font-bold text-[15px] text-[#0e503f]">{priceText || "0 грн"}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={async () => {
            if (!product?.id) return;
            const ok = await addToCart(product.id);
            if (ok) {
              await alertSuccess("Товар додано в кошик");
            } else {
              await alertWarning("Увійдіть в акаунт, щоб додати товар у кошик");
            }
          }}
          className="bg-[#0e503f] hover:bg-[#093529] active:scale-95 text-white px-5 py-3 rounded-[12px] font-bold text-[15px] flex items-center gap-2 shadow-[0_4px_15px_rgba(14,80,63,0.4)] shrink-0 transition-all cursor-pointer"
        >
          <img src="/images/main_page/icons/rec-icon-basket.svg" alt="" className="w-4 h-4 brightness-200" />
          <span>У кошик</span>
        </button>
      </div>
    </div>
  );
}
