"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BookSection from "@/app/(user-site)/main_page/BookSection";
import { useCurrentUser } from "@/app/(user-site)/userProfile/hooks/useCurrentUser";
import { useFavorites } from "@/lib/hooks/useFavorites";
import {
  authorService,
  formatService,
  orderService,
  productService,
  reviewService,
} from "@/lib/api/services";
import type {
  AuthorDTO,
  FormatDto,
  OrderDTO,
  ProductDto,
  ReviewDto,
} from "@/lib/api/generated";
import { pickRecommendedBooks } from "@/lib/recommendations/pickBooks";
import { mapProductToBookCard } from "@/lib/recommendations/mapProductToBook";
import {
  useLocalizedPath,
  useTranslations,
} from "@/lib/i18n/LocaleProvider";

export default function PickBookPage() {
  const t = useTranslations();
  const lp = useLocalizedPath();
  const { user, loading: userLoading } = useCurrentUser();
  const { favorites, toggleFavorite } = useFavorites(user?.id);
  const isFav = (id?: number) => !!id && favorites.some((f) => f.id === id);

  const [products, setProducts] = useState<ProductDto[]>([]);
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [authors, setAuthors] = useState<AuthorDTO[]>([]);
  const [formats, setFormats] = useState<FormatDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const [productsResult, reviewsResult, authorsResult, formatsResult] =
          await Promise.all([
            productService.apiProductsGet().catch(() => []),
            reviewService.apiReviewsGet().catch(() => []),
            authorService.apiAuthorsGet().catch(() => []),
            formatService.apiFormatsGet().catch(() => []),
          ]);

        let userOrders: OrderDTO[] = [];
        if (user?.id) {
          userOrders =
            (await orderService
              .apiOrdersByUserUserIdGet({ userId: user.id })
              .catch(() => [])) ?? [];
        }

        if (!mounted) return;
        setProducts(productsResult ?? []);
        setReviews(reviewsResult ?? []);
        setAuthors(authorsResult ?? []);
        setFormats(formatsResult ?? []);
        setOrders(userOrders);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (!userLoading) load();

    return () => {
      mounted = false;
    };
  }, [user?.id, userLoading]);

  const ratingByProductId = useMemo(() => {
    const map = new Map<number, { sum: number; count: number }>();
    for (const review of reviews) {
      if (!review.productId || review.rating == null) continue;
      if (review.approved === false) continue;
      const current = map.get(review.productId) ?? { sum: 0, count: 0 };
      map.set(review.productId, {
        sum: current.sum + review.rating,
        count: current.count + 1,
      });
    }
    return map;
  }, [reviews]);

  const getRating = (productId?: number) => {
    if (!productId) return 0;
    const entry = ratingByProductId.get(productId);
    if (!entry || entry.count === 0) return 0;
    return entry.sum / entry.count;
  };

  const authorsById = useMemo(() => {
    const map = new Map<number, AuthorDTO>();
    for (const author of authors) {
      if (author.id != null) map.set(author.id, author);
    }
    return map;
  }, [authors]);

  const formatsById = useMemo(() => {
    const map = new Map<number, FormatDto>();
    for (const format of formats) {
      if (format.id != null) map.set(format.id, format);
    }
    return map;
  }, [formats]);

  const favoriteProductIds = useMemo(
    () => favorites.map((f) => f.id).filter((id): id is number => id != null),
    [favorites],
  );

  const { recommended, basedOnPurchases, basedOnPreferences, newBooks } = useMemo(
    () =>
      pickRecommendedBooks({
        products,
        orders,
        favoriteProductIds,
        getRating,
        take: 8,
      }),
    [products, orders, favoriteProductIds, ratingByProductId],
  );

  const toCards = (items: ProductDto[]) =>
    items.map((product) => {
      const rating = getRating(product.id);
      return mapProductToBookCard(product, {
        rating: rating > 0 ? rating : null,
        authorsById,
        formatsById,
      });
    });

  const recommendedCards = toCards(recommended.slice(0, 8));
  const newBookCards = toCards(newBooks.slice(0, 8));

  const subtitle = basedOnPurchases
    ? t("pickBook.subtitlePurchases")
    : basedOnPreferences
      ? t("pickBook.subtitleFavorites")
      : user
        ? t("pickBook.subtitleGuestNew")
        : t("pickBook.subtitleLoggedOut");

  return (
    <main className="bg-[#f5f3ee] text-[#242424] min-h-screen overflow-x-hidden pb-16">
      <section className="relative mx-auto max-w-[1180px] px-4 pt-[120px] md:pt-[180px] pb-6 lg:px-0">
        <p className="font-mono text-[14px] text-[#005B33] mb-2">
          <Link href={lp("/")} className="hover:underline">
            {t("pickBook.breadcrumbHome")}
          </Link>
          <span className="mx-2 text-[#242424]/40">/</span>
          {t("pickBook.title")}
        </p>
        <h1 className="font-serif text-[36px] md:text-[48px] font-bold leading-tight">
          {t("pickBook.title")}
        </h1>
        <p className="mt-3 max-w-[640px] text-[16px] md:text-[18px] text-[#242424]/80">
          {subtitle}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={lp("/products")}
            className="inline-flex h-[48px] items-center rounded-full border border-[#005B33] px-6 text-[16px] font-semibold text-[#005B33] transition-transform hover:scale-105"
          >
            {t("pickBook.allCatalog")}
          </Link>
        </div>
      </section>

      {loading || userLoading ? (
        <p className="mx-auto max-w-[1220px] px-4 py-16 text-[#6B6B6B]">
          {t("pickBook.loading")}
        </p>
      ) : (
        <>
          {recommendedCards.length > 0 ? (
            <BookSection
              title={
                basedOnPreferences
                  ? t("pickBook.sectionForYou")
                  : t("pickBook.sectionStartNew")
              }
              books={recommendedCards}
              pillWidth={basedOnPreferences ? 420 : 430}
              isFav={isFav}
              onToggleFavorite={toggleFavorite}
            />
          ) : null}

          {basedOnPreferences && newBookCards.length > 0 ? (
            <BookSection
              title={t("pickBook.sectionNew")}
              books={newBookCards}
              pillWidth={237}
              isFav={isFav}
              onToggleFavorite={toggleFavorite}
            />
          ) : null}

          {!basedOnPreferences && newBookCards.length > 4 ? (
            <BookSection
              title={t("pickBook.sectionMoreNew")}
              books={newBookCards.slice(4)}
              pillWidth={320}
              isFav={isFav}
              onToggleFavorite={toggleFavorite}
            />
          ) : null}

          {!loading && recommendedCards.length === 0 && newBookCards.length === 0 ? (
            <div className="mx-auto max-w-[1220px] px-4 py-20 text-center">
              <p className="text-[18px] text-[#6B6B6B] mb-6">
                {t("pickBook.empty")}
              </p>
              <Link
                href={lp("/products")}
                className="inline-flex h-[56px] items-center gap-2 rounded-full bg-[#005B33] px-8 text-[18px] font-semibold text-[#f5f3ee] shadow-[0px_4px_12px_rgba(0,0,0,0.25)] transition-transform hover:scale-105"
              >
                {t("pickBook.toCatalog")}
                <span>→</span>
              </Link>
            </div>
          ) : null}
        </>
      )}
    </main>
  );
}
