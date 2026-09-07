// import Image from "next/image";
//
//
// export default async function Home() {
// /////////////////////////////////////////////////////
// // Added to test connection between backend and frontend
//   let message = "Loading...";
//   try {
//     const response = await fetch('https://localhost:7069/api/Home', {
//       cache: 'no-store' // This ensures we get fresh data every time
//     });
//
//     if (response.ok) {
//       message = await response.text(); // We use .text() because the API returns a string
//     } else {
//       message = "Error: Backend reached but returned " + response.status;
//     }
//   } catch (error) {
//     console.log("REAL ERROR:", error);
//     message = "Connection Failed: Is the Backend running?";
//   }
// /////////////////////////////////////////////////////
//
//   return (
//     <h1>Our amazing `main_page`.</h1>
//
//   );
// }

"use client";

import { useEffect, useMemo, useState } from "react";
import Hero from "@/app/(user-site)/main_page/Hero";
import BookSection from "@/app/(user-site)/main_page/BookSection";
import InkSection from "@/app/(user-site)/main_page/InkSection";
import AboutSection from "@/app/(user-site)/main_page/AboutSection";
import AdvantagesSection from "@/app/(user-site)/main_page/AdvantagesSection";
import ReviewsSection from "@/app/(user-site)/main_page/ReviewsSection";
import FormatSection from "@/app/(user-site)/main_page/FormatSection";
import PromoBanner from "@/app/(user-site)/main_page/PromoBanner";
import MobileHome from "@/app/(user-site)/main_page/mobile/MobileHome";
import {
    authorService,
    categoriesService,
    formatService,
    orderService,
    productService,
    reviewService,
} from "@/lib/api/services";
import { Availability } from "@/lib/api/generated";
import type {
    AuthorDTO,
    CategoryDto,
    FormatDto,
    OrderDTO,
    ProductDto,
    ReviewDto,
} from "@/lib/api/generated";
import { useFavorites } from "@/lib/hooks/useFavorites";
import { useCurrentUser } from "@/app/(user-site)/userProfile/hooks/useCurrentUser";
import { useLocale, useLocalizedPath, useTranslations } from "@/lib/i18n/LocaleProvider";
import { pickRecommendedBooks, getNewBooks } from "@/lib/recommendations/pickBooks";
import {
    formatBookPrice,
    getAuthorLabel as buildAuthorLabel,
    getFormatTags as buildFormatTags,
    getProductImageSrc,
} from "@/lib/recommendations/mapProductToBook";

const getAvatarSrc = (avatarData?: string | null) => {
    if (!avatarData) return null;
    const normalizedData = avatarData.trim();
    if (normalizedData.startsWith("data:")) {
        return normalizedData;
    }
    const mimeType = (() => {
        if (normalizedData.startsWith("UklGR")) return "image/webp";
        if (normalizedData.startsWith("/9j/")) return "image/jpeg";
        if (normalizedData.startsWith("iVBORw0KGgo")) return "image/png";
        if (normalizedData.startsWith("R0lGOD")) return "image/gif";
        return "image/jpeg";
    })();
    return `data:${mimeType};base64,${normalizedData}`;
};

const formatReviewDate = (value?: Date | string | null, locale: "uk" | "en" = "uk") => {
    if (!value) return "";
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString(locale === "uk" ? "uk-UA" : "en-US");
};

const mapProductToBook = (
    product: ProductDto,
    rating: number | null,
    author: string | null,
    formatTags: Array<"paper" | "ebook" | "audio">,
    localizeHref?: (path: string) => string,
) => ({
    productId: product.id,
    href: product.id
        ? (localizeHref ? localizeHref(`/products/${product.id}`) : `/products/${product.id}`)
        : undefined,
    title: product.productName ?? "",
    author,
    price: formatBookPrice(product.discountPrice ?? product.price),
    image: getProductImageSrc(product),
    rating,
    formatTags,
});

export default function Home() {
    const { locale } = useLocale();
    const t = useTranslations();
    const lp = useLocalizedPath();
    const [products, setProducts] = useState<ProductDto[]>([]);
    const [reviews, setReviews] = useState<ReviewDto[]>([]);
    const [categories, setCategories] = useState<CategoryDto[]>([]);
    const [authors, setAuthors] = useState<AuthorDTO[]>([]);
    const [formats, setFormats] = useState<FormatDto[]>([]);
    const [orders, setOrders] = useState<OrderDTO[]>([]);
    const { user } = useCurrentUser();
    const { favorites, toggleFavorite } = useFavorites(user?.id);
    const isFav = (id?: number) => !!id && favorites.some((f) => f.id === id);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                const [
                    productsResult,
                    reviewsResult,
                    categoriesResult,
                    authorsResult,
                    formatsResult,
                ] = await Promise.all([
                    productService.apiProductsGet().catch((err) => { console.warn("Failed to fetch products:", err); return []; }),
                    reviewService.apiReviewsGet().catch((err) => { console.warn("Failed to fetch reviews:", err); return []; }),
                    categoriesService.apiCategoriesGet().catch((err) => { console.warn("Failed to fetch categories:", err); return []; }),
                    authorService.apiAuthorsGet().catch((err) => { console.warn("Failed to fetch authors:", err); return []; }),
                    formatService.apiFormatsGet().catch((err) => { console.warn("Failed to fetch formats:", err); return []; }),
                ]);

                if (!isMounted) return;
                setProducts(productsResult ?? []);
                setReviews(reviewsResult ?? []);
                setCategories(categoriesResult ?? []);
                setAuthors(authorsResult ?? []);
                setFormats(formatsResult ?? []);
            } catch (error) {
                console.error("Home data fetch failed:", error);
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        let isMounted = true;

        const loadOrders = async () => {
            if (!user?.id) {
                if (isMounted) setOrders([]);
                return;
            }
            const userOrders =
                (await orderService
                    .apiOrdersByUserUserIdGet({ userId: user.id })
                    .catch(() => [])) ?? [];
            if (isMounted) setOrders(userOrders);
        };

        loadOrders();
        return () => {
            isMounted = false;
        };
    }, [user?.id]);

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

    const getRatingForProduct = (productId?: number) => {
        if (!productId) return 0;
        const entry = ratingByProductId.get(productId);
        if (!entry || entry.count === 0) return 0;
        return entry.sum / entry.count;
    };

    const getReviewCountForProduct = (productId?: number) => {
        if (!productId) return 0;
        const entry = ratingByProductId.get(productId);
        return entry?.count ?? 0;
    };

    const authorById = useMemo(() => {
        const map = new Map<number, AuthorDTO>();
        for (const author of authors) {
            if (author.id == null) continue;
            map.set(author.id, author);
        }
        return map;
    }, [authors]);

    const formatById = useMemo(() => {
        const map = new Map<number, FormatDto>();
        for (const format of formats) {
            if (format.id == null) continue;
            map.set(format.id, format);
        }
        return map;
    }, [formats]);

    const categoryByName = useMemo(() => {
        const map = new Map<string, number>();
        for (const category of categories) {
            const name = category.categoryName?.trim().toLowerCase();
            if (!name || category.id == null) continue;
            map.set(name, category.id);
        }
        return map;
    }, [categories]);

    const productById = useMemo(() => {
        const map = new Map<number, ProductDto>();
        for (const product of products) {
            if (product.id == null) continue;
            map.set(product.id, product);
        }
        return map;
    }, [products]);


    const getAuthorLabel = (authorIds?: Array<number> | null) =>
        buildAuthorLabel(authorIds, authorById);

    const getFormatTags = (formatIds?: Array<number> | null) =>
        buildFormatTags(formatIds, formatById);

    const resolveCategoryId = (name: string) => {
        const normalized = name.trim().toLowerCase();
        const direct = categoryByName.get(normalized);
        if (direct != null) return direct;
        const fuzzy = categories.find((category) => category.categoryName?.toLowerCase().includes(normalized));
        return fuzzy?.id;
    };

    const mapProductsToBooks = (items: ProductDto[], localizeHref?: (path: string) => string) =>
        items.map((product) => {
            const reviewCount = getReviewCountForProduct(product.id);
            const ratingValue = reviewCount > 0 ? getRatingForProduct(product.id) : null;
            return mapProductToBook(
                product,
                ratingValue,
                getAuthorLabel(product.authorIds),
                getFormatTags(product.formatIds),
                localizeHref,
            );
        });

    const favoriteProductIds = useMemo(
        () => favorites.map((f) => f.id).filter((id): id is number => id != null),
        [favorites],
    );

    const pickResult = useMemo(
        () =>
            pickRecommendedBooks({
                products,
                orders,
                favoriteProductIds,
                getRating: getRatingForProduct,
                take: 4,
            }),
        [products, orders, favoriteProductIds, ratingByProductId],
    );

    const recommendationBooks = mapProductsToBooks(pickResult.recommended);
    const desktopRecommendationBooks = mapProductsToBooks(pickResult.recommended, lp);
    const recommendationTitle = pickResult.basedOnPreferences
        ? t("home.sections.recommendationsForYou")
        : t("home.sections.newForYou");

    const romanceCategoryId = resolveCategoryId("Романи") ?? resolveCategoryId("Роман");
    const thrillerCategoryId = resolveCategoryId("Триллери");
    const scienceCategoryId = resolveCategoryId("Наукові");
    const fantasyCategoryId = resolveCategoryId("Фантастика");

    const romanceBooks = romanceCategoryId
        ? mapProductsToBooks(
            products.filter((product) => product.categoryIds?.includes(romanceCategoryId)),
            lp,
        ).slice(0, 4)
        : [];
    const thrillerBooks = thrillerCategoryId
        ? mapProductsToBooks(
            products.filter((product) => product.categoryIds?.includes(thrillerCategoryId)),
            lp,
        ).slice(0, 4)
        : [];
    const scienceBooks = scienceCategoryId
        ? mapProductsToBooks(
            products.filter((product) => product.categoryIds?.includes(scienceCategoryId)),
            lp,
        ).slice(0, 4)
        : [];
    const fantasyBooks = fantasyCategoryId
        ? mapProductsToBooks(
            products.filter((product) => product.categoryIds?.includes(fantasyCategoryId)),
            lp,
        ).slice(0, 4)
        : [];

    const hitsBooks = mapProductsToBooks(
        [...products].sort(
            (a, b) => getReviewCountForProduct(b.id) - getReviewCountForProduct(a.id),
        ),
    ).slice(0, 4);
    const desktopHitsBooks = mapProductsToBooks(
        [...products].sort(
            (a, b) => getReviewCountForProduct(b.id) - getReviewCountForProduct(a.id),
        ),
        lp,
    ).slice(0, 4);

    const newBooks = mapProductsToBooks(getNewBooks(products, 4));
    const desktopNewBooks = mapProductsToBooks(getNewBooks(products, 4), lp);

    const setBooks = mapProductsToBooks(
        products.filter((product) => (product.itemsInSet ?? 0) > 1),
        lp,
    ).slice(0, 4);

    const announcementBooks = mapProductsToBooks(
        products.filter((product) => product.availability === Availability.NUMBER_2),
    ).slice(0, 4);
    const desktopAnnouncementBooks = mapProductsToBooks(
        products.filter((product) => product.availability === Availability.NUMBER_2),
        lp,
    ).slice(0, 4);

    const reviewCards = useMemo(() => {
        return reviews
            .filter((review) => review.comment && review.approved !== false)
            .map((review, index) => {
                const author = review.userName || review.userId || "Анонім";
                const product = review.productId ? productById.get(review.productId) : undefined;
                return {
                    id: review.id ?? review.createdAt?.toString() ?? index,
                    author,
                    text: review.comment ?? "",
                    timeLabel: formatReviewDate(review.createdAt, "uk"),
                    createdAt: review.createdAt,
                    avatar: getAvatarSrc(review.userAvatarData),
                    bookImage: product ? getProductImageSrc(product) : null,
                    rating: review.rating,
                };
            });
    }, [reviews, productById]);

    const desktopReviewCards = useMemo(
        () =>
            reviewCards.map((card) => ({
                ...card,
                timeLabel: formatReviewDate(card.createdAt, locale),
            })),
        [reviewCards, locale],
    );

    const allBooks = mapProductsToBooks(products);

    const gazetteItems = useMemo(() => {
        return reviewCards.slice(0, 4).map((r, idx) => ({
            id: String(r.id),
            authorName: r.author || "Користувач",
            authorHandle: `@${(r.author || "user").toLowerCase().replace(/\s+/g, "_")}`,
            tag: "#новини",
            title: r.text.slice(0, 30) || "",
            image: r.bookImage || null,
            avatar: r.avatar || "/images/body/cat-uk.webp",
            href: "/categories",
        }));
    }, [reviewCards]);

    return (
        <main className="bg-[#f5f3ee] text-[#242424] overflow-x-hidden">
            {/* Mobile Home Page Version (1-to-1 Figma Node 2119:32862) */}
            <div className="block md:hidden">
                <MobileHome
                    recommendations={recommendationBooks}
                    newBooks={pickResult.basedOnPreferences ? newBooks : mapProductsToBooks(getNewBooks(products, 8).slice(4))}
                    announcements={announcementBooks}
                    hitsBooks={hitsBooks}
                    otherBooks={allBooks}
                    gazetteItems={gazetteItems}
                />
            </div>

            {/* Desktop Home Page Version */}
            <div className="hidden md:block">
                <Hero />

                {desktopRecommendationBooks.length > 0 ? (

                    <BookSection title={recommendationTitle} books={desktopRecommendationBooks} showMore pillWidth={631} 
                    isFav={isFav} onToggleFavorite={toggleFavorite}/>
                ) : null}

                <InkSection />

                <AboutSection />

                <AdvantagesSection />

                <ReviewsSection reviews={desktopReviewCards} />

                <FormatSection />

                {romanceBooks.length > 0 ? <BookSection title={t("home.sections.romance")} books={romanceBooks} pillWidth={206} isFav={isFav} onToggleFavorite={toggleFavorite} /> : null}
                {thrillerBooks.length > 0 ? (
                    <BookSection title={t("home.sections.thrillers")} books={thrillerBooks} pillWidth={253} isFav={isFav} onToggleFavorite={toggleFavorite} />
                ) : null}
                {scienceBooks.length > 0 ? (
                    <BookSection title={t("home.sections.science")} books={scienceBooks} pillWidth={211} isFav={isFav} onToggleFavorite={toggleFavorite}/>
                ) : null}
                {fantasyBooks.length > 0 ? (
                    <BookSection title={t("home.sections.fantasy")} books={fantasyBooks} pillWidth={292} isFav={isFav} onToggleFavorite={toggleFavorite}/>
                ) : null}

                <PromoBanner />

                {desktopHitsBooks.length > 0 ? (
                    <BookSection title={t("home.sections.bestsellers")} books={desktopHitsBooks} pillWidth={355} isFav={isFav} onToggleFavorite={toggleFavorite}/>
                ) : null}
                {desktopNewBooks.length > 0 && pickResult.basedOnPreferences ? (
                    <BookSection title={t("home.sections.newArrivals")} books={desktopNewBooks} pillWidth={237} isFav={isFav} onToggleFavorite={toggleFavorite}/>
                ) : null}
                {setBooks.length > 0 ? (
                    <BookSection title={t("home.sections.bookSets")} books={setBooks} pillWidth={472} isFav={isFav} onToggleFavorite={toggleFavorite}/>
                ) : null}
                {desktopAnnouncementBooks.length > 0 ? (
                    <BookSection title={t("home.sections.announcements")} books={desktopAnnouncementBooks} pillWidth={204} isFav={isFav} onToggleFavorite={toggleFavorite}/>
                ) : null}
            </div>
        </main>
    );
}