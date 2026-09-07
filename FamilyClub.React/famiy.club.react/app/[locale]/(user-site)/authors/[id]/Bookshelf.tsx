"use client";

import { alertWarning } from "@/lib/ui/sweetAlert";
import { ProductDto } from "@/lib/api/generated";
import { useRouter } from "next/navigation";
import { FavoriteBook } from "@/lib/hooks/useFavorites";
import {
  useLocalizedPath,
  useTranslations,
} from "@/lib/i18n/LocaleProvider";

interface BookshelfProps {
  rows: ProductDto[][];
  authorName?: string | null;
  isAuthenticated: boolean;
  getImageSrc: (book: ProductDto) => string | null;
  ratingByProductId: Map<number, number>;
  isInCart: (id?: number) => boolean;
  addToCart: (id: number) => Promise<boolean>;
  toggleFavorite: (id: number) => void;
  favorites: FavoriteBook[];
  isFav: (id?: number) => boolean;
}

export default function Bookshelf({
  rows,
  authorName,
  isAuthenticated,
  getImageSrc,
  ratingByProductId,
  isInCart,
  addToCart,
  toggleFavorite,
  isFav,
}: BookshelfProps) {
  const router = useRouter();
  const t = useTranslations();
  const lp = useLocalizedPath();

  const ratingToStars = (rating: number) => {
    const rounded = Math.max(0, Math.min(5, Math.round(rating)));
    return Array.from({ length: 5 }, (_, i) => (i < rounded ? "★" : "☆")).join("");
  };

  return (
    <div className="flex flex-col w-full">
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          style={{ minHeight: "400px" }}
          className="relative w-full flex items-start justify-center gap-[130px] px-10 pt-21 overflow-hidden"
        >
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

          {row.map((book) => {
            const imageSrc = getImageSrc(book);
            const rating = book.id ? ratingByProductId.get(book.id) ?? 0 : 0;

            return (
              <div
                key={book.id}
                onClick={() => router.push(lp(`/products/${book.id}`))}
                className="relative flex flex-col items-center -mt-[3vh] pb-8 mb-10 cursor-pointer
                                                       transition-transform duration-300 ease-out
                                                       hover:translate-y-[16px]"
                style={{ zIndex: 7 }}
              >
                <button
                  type="button"
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (!isAuthenticated) {
                      await alertWarning(t("authors.loginToFavorite"));
                      return;
                    }
                    if (!book.id) return;
                    toggleFavorite(book.id);
                  }}
                  className="absolute cursor-pointer top-16 right-2"
                  style={{ zIndex: 11 }}
                  aria-label={t("authors.favoriteAria")}
                >
                  <img
                    src={
                      isFav(book.id)
                        ? "/images/userProfile/icon-heart.svg"
                        : "/images/userProfile/heart-filled.svg"
                    }
                    className="w-[30px] h-[30px]"
                    alt=""
                  />
                </button>

                <div
                  style={{ boxShadow: "0px 10px 10px 0px #2424244D" }}
                  className="w-[250px] h-[460px] bg-white rounded-b-[30px] flex flex-col items-center"
                >
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

                  <div className="mt-4 px-4 w-full text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[#D9A441] text-sm">
                        {ratingToStars(rating)}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({rating.toFixed(1)})
                      </span>
                    </div>

                    <p className="font-semibold text-[15px] mt-2 line-clamp-2">
                      {book.productName}
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      {authorName}
                    </p>

                    <div>
                      <p className="text-[20px] font-semibold text-black mt-1">
                        {t("authors.price").replace("{price}", String(book.price ?? 0))}
                      </p>
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!book.id) return;
                          if (!isInCart(book.id)) {
                            const ok = await addToCart(book.id);
                            if (!ok && !isAuthenticated) {
                              await alertWarning(t("product.loginToAddCart"));
                            }
                          }
                        }}
                        className="relative cursor-pointer bottom-[3.7vh] left-[10vw]"
                        style={{ zIndex: 11 }}
                        aria-label={t("authors.addToCartAria")}
                      >
                        <img
                          src={
                            isInCart(book.id)
                              ? "/images/userProfile/checkBuy.png"
                              : "/images/userProfile/icon.svg"
                          }
                          className="w-[32px] h-[32px]"
                          alt=""
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
