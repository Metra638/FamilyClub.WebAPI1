"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PromotionDto, ProductDto, ReviewDto } from "@/lib/api/generated";
import { promotionService, productService, reviewService } from "@/lib/api/services";
import { useCart } from "@/lib/hooks/useCart";
import { useFavorites } from "@/lib/hooks/useFavorites";
import { useCurrentUser } from "../userProfile/hooks/useCurrentUser";
import BookShelf from "./BookShelf";
import { usePagination } from "./hooks/usePagination";
import Pagination from "./Pagination";
import { getProductCoverUrl } from "@/lib/products/productCoverUrl";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

function isActive(promotion: PromotionDto): boolean {
  const now = new Date();
  const start = promotion.startDate ? new Date(promotion.startDate) : null;
  const end = promotion.endDate ? new Date(promotion.endDate) : null;
  if (start && now < start) return false;
  if (end && now > end) return false;
  return true;
}

export default function PromotionsPage() {
  const t = useTranslations();
  const shelfRef = useRef<HTMLDivElement>(null);
  const { items, addToCart } = useCart();
  const { user } = useCurrentUser();

  const { favorites, toggleFavorite } = useFavorites(user?.id);

  const [promotions, setPromotions] = useState<PromotionDto[]>([]);
  const [allProducts, setAllProducts] = useState<ProductDto[]>([]);
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPromotionId, setSelectedPromotionId] = useState<number | null>(null);

  useEffect(() => {
    document.body.style.backgroundImage = "url('/images/authorsUserPage/Rectangle 326.png')";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundAttachment = "fixed";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";

    return () => {
      document.body.style.backgroundImage = "";
      document.body.style.backgroundSize = "";
      document.body.style.backgroundAttachment = "";
      document.body.style.backgroundPosition = "";
      document.body.style.backgroundRepeat = "";
    };
  }, []);

  useEffect(() => {
    Promise.all([
      promotionService.apiPromotionsGet(),
      productService.apiProductsGet(),
      reviewService.apiReviewsGet(),
    ])
      .then(([promotionsData, products, reviewsData]) => {
        setPromotions(promotionsData);
        setAllProducts(products);
        setReviews(reviewsData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const activePromotionIds = useMemo(
    () => new Set(promotions.filter(isActive).map((p) => p.id)),
    [promotions],
  );

  const books = useMemo(
    () =>
      allProducts.filter(
        (p) =>
          p.promotionId != null &&
          activePromotionIds.has(p.promotionId) &&
          (selectedPromotionId === null || p.promotionId === selectedPromotionId),
      ),
    [allProducts, activePromotionIds, selectedPromotionId],
  );

  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedBooks,
    setCurrentPage,
  } = usePagination(books, 6);

  useEffect(() => {
    shelfRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentPage]);

  const activePromotionsList = useMemo(
    () => promotions.filter(isActive),
    [promotions],
  );

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

  const isInCart = (id?: number) => {
    if (!id) return false;
    return items.some((item) => item.productId === id);
  };
  const isFav = (id?: number) => {
    if (!id) return false;
    return favorites.some((f) => f.id === id);
  };
  const getImageSrc = (book: ProductDto) => getProductCoverUrl(book);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <p className="text-[var(--color-black)] opacity-60">{t("promotions.loading")}</p>
      </div>
    );
  }

  const rows: ProductDto[][] = [];
  for (let i = 0; i < paginatedBooks.length; i += 3) {
    rows.push(paginatedBooks.slice(i, i + 3));
  }
  while (rows.length < 2) {
    rows.push([]);
  }

  return (
    <div
      ref={shelfRef}
      key={currentPage}
      className="transition-opacity mt-40 duration-300 ease-in-out animate-[fadeIn_0.3s_ease-in-out]"
    >
      {activePromotionsList.length > 0 && (
        <div
          className="
                    w-screen relative left-1/2 -translate-x-1/2
                    bg-center bg-no-repeat py-8
                    flex justify-center items-center gap-5 mb-8
                "
          style={{
            backgroundImage: "url('/images/entities/books/top_frame.svg')",
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setSelectedPromotionId(null);
              setCurrentPage(1);
            }}
            className={`
                        font-['Source_Sans_Pro'] font-normal text-[20px] leading-[125%] tracking-[-0.011em]
                        px-5 py-2.5 rounded-[9px]
                        hover:text-[var(--foreground-on-dark)] hover:bg-[var(--color-brand-green)]
                        transition-colors duration-200 ease-in-out
                        ${
                          selectedPromotionId === null
                            ? "text-[var(--foreground-on-dark)] bg-[var(--color-brand-green)]"
                            : "text-[var(--foreground-primary)] bg-transparent"
                        }
                    `}
          >
            {t("promotions.all")}
          </button>

          {activePromotionsList.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setSelectedPromotionId(p.id!);
                setCurrentPage(1);
              }}
              className={`
                            font-['Source_Sans_Pro'] font-normal text-[20px] leading-[125%] tracking-[-0.011em]
                            px-5 py-2.5 rounded-[9px]
                            hover:text-[var(--foreground-on-dark)] hover:bg-[var(--color-brand-green)]
                            transition-colors duration-200 ease-in-out
                            ${
                              selectedPromotionId === p.id
                                ? "text-[var(--foreground-on-dark)] bg-[var(--color-brand-green)]"
                                : "text-[var(--foreground-primary)] bg-transparent"
                            }
                        `}
            >
              {t("promotions.promoLabel")
                .replace("{name}", p.name ?? "")
                .replace("{percent}", String(p.discountPercent ?? 0))}
            </button>
          ))}
        </div>
      )}
      <BookShelf
        rows={rows}
        authorName={undefined}
        getImageSrc={getImageSrc}
        isAuthenticated={!!user}
        ratingByProductId={ratingByProductId}
        isInCart={isInCart}
        addToCart={addToCart}
        toggleFavorite={toggleFavorite}
        favorites={favorites}
        isFav={isFav}
      />
      <div className="w-full flex justify-center mt-10 mb-16 min-h-[40px]">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
