"use client";

import { useEffect, useMemo, useState } from "react";
import Hero from "@/app/(user-site)/main_page/Hero";
import BookSection from "@/app/(user-site)/main_page/BookSection";
import InkSection from "@/app/(user-site)/main_page/InkSection";
import AboutSection from "@/app/(user-site)/main_page/AboutSection";
import AdvantagesSection from "@/app/(user-site)/main_page/AdvantagesSection";
import ReviewsSection from "@/app/(user-site)/main_page/ReviewsSection";
import FormatSection, { type FormatKind } from "@/app/(user-site)/main_page/FormatSection";
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
    const [selectedFormat, setSelectedFormat] = useState<FormatKind | null>(null);
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

    const resolveCategoryId = (candidates: string[]) => {
        for (const candidate of candidates) {
            const normalized = candidate.trim().toLowerCase();
            const direct = categoryByName.get(normalized);
            if (direct != null) return direct;
            const fuzzy = categories.find((cat) => {
                const name = cat.categoryName?.trim().toLowerCase();
                if (!name) return false;
                return name.includes(normalized) || normalized.includes(name);
            });
            if (fuzzy?.id != null) return fuzzy.id;
        }
        return undefined;
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

    const romanceCategoryId = resolveCategoryId(["роман", "романи", "романтика", "любовн", "romance"]);
    const thrillerCategoryId = resolveCategoryId(["трилер", "трилери", "триллер", "триллери", "детектив", "детективи", "thriller", "detective"]);
    const scienceCategoryId = resolveCategoryId(["наук", "наукова", "нон-фікшн", "нонфікшн", "science", "non-fiction"]);
    const fantasyCategoryId = resolveCategoryId(["фентезі", "фентазі", "фантастик", "фантастика", "fantasy"]);

    const selectedFormatIds = useMemo(() => {
        if (!selectedFormat) return [];
        const ids: number[] = [];
        for (const format of formats) {
            if (format.id == null) continue;
            const label = `${format.name ?? ""} ${format.code ?? ""}`.toLowerCase();
            if (selectedFormat === "audio" && (label.includes("audio") || label.includes("аудіо"))) {
                ids.push(format.id);
            } else if (
                selectedFormat === "ebook" &&
                (label.includes("ebook") || label.includes("e-book") || label.includes("електрон"))
            ) {
                ids.push(format.id);
            } else if (
                selectedFormat === "paper" &&
                (label.includes("paper") || label.includes("print") || label.includes("папер"))
            ) {
                ids.push(format.id);
            }
        }
        return ids;
    }, [selectedFormat, formats]);

    const filterBySelectedFormat = (items: ProductDto[]) => {
        if (!selectedFormat) return items;
        return items.filter((product) => getFormatTags(product.formatIds).includes(selectedFormat));
    };

    const getCategoryBooks = (categoryId?: number) => {
        if (!categoryId) return [];
        let items = products.filter((product) => product.categoryIds?.includes(categoryId));
        if (selectedFormat) {
            items = filterBySelectedFormat(items);
        }
        return mapProductsToBooks(items, lp).slice(0, 4);
    };

    const romanceBooks = getCategoryBooks(romanceCategoryId);
    const thrillerBooks = getCategoryBooks(thrillerCategoryId);
    const scienceBooks = getCategoryBooks(scienceCategoryId);
    const fantasyBooks = getCategoryBooks(fantasyCategoryId);

    const buildShelfMoreHref = (options: {
        categoryId?: number;
        sort?: "bestsellers" | "newest";
        sets?: boolean;
        availability?: number;
    }) => {
        const params = new URLSearchParams();
        if (options.categoryId) {
            params.set("categoryId", String(options.categoryId));
        }
        if (options.sort) {
            params.set("sort", options.sort);
        }
        if (options.sets) {
            params.set("sets", "true");
        }
        if (options.availability !== undefined) {
            params.set("availability", String(options.availability));
        }
        if (selectedFormatIds.length > 0) {
            params.set("formatId", selectedFormatIds.join(","));
        }
        if (selectedFormat) {
            params.set("format", selectedFormat);
        }
        const query = params.toString();
        return lp(query ? `/products?${query}` : "/products");
    };

    const hitsBooks = mapProductsToBooks(
        [...filterBySelectedFormat(products)].sort(
            (a, b) => getReviewCountForProduct(b.id) - getReviewCountForProduct(a.id),
        ),
    ).slice(0, 4);
    const desktopHitsBooks = mapProductsToBooks(
        [...filterBySelectedFormat(products)].sort(
            (a, b) => getReviewCountForProduct(b.id) - getReviewCountForProduct(a.id),
        ),
        lp,
    ).slice(0, 4);

    const newBooks = mapProductsToBooks(getNewBooks(filterBySelectedFormat(products), 4));
    const desktopNewBooks = mapProductsToBooks(getNewBooks(filterBySelectedFormat(products), 4), lp);

    const setBooks = mapProductsToBooks(
        filterBySelectedFormat(products).filter((product) => (product.itemsInSet ?? 0) > 1),
        lp,
    ).slice(0, 4);

    const announcementBooks = mapProductsToBooks(
        filterBySelectedFormat(products).filter((product) => product.availability === Availability.NUMBER_2),
    ).slice(0, 4);
    const desktopAnnouncementBooks = mapProductsToBooks(
        filterBySelectedFormat(products).filter((product) => product.availability === Availability.NUMBER_2),
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
                    productId: review.productId ?? null,
                    href: review.productId ? lp(`/products/${review.productId}`) : undefined,
                };
            });
    }, [reviews, productById, lp]);

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
        <main className="bg-[var(--background-main)] text-[var(--foreground-primary)] overflow-x-hidden">
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
                    <BookSection
                        title={recommendationTitle}
                        books={desktopRecommendationBooks}
                        showMore
                        showMoreHref={lp("/pick-book")}
                        pillWidth={631}
                        isFav={isFav}
                        onToggleFavorite={toggleFavorite}
                        shelfIndex={0}
                    />
                ) : null}

                <InkSection />

                <AboutSection />

                <AdvantagesSection />

                <ReviewsSection reviews={desktopReviewCards} />

                <FormatSection
                    selectedFormat={selectedFormat}
                    onSelectFormat={setSelectedFormat}
                />

                <BookSection
                    title={t("home.sections.romance")}
                    books={romanceBooks}
                    showMore
                    showMoreHref={buildShelfMoreHref({ categoryId: romanceCategoryId })}
                    pillWidth={206}
                    isFav={isFav}
                    onToggleFavorite={toggleFavorite}
                    shelfIndex={1}
                />
                <BookSection
                    title={t("home.sections.thrillers")}
                    books={thrillerBooks}
                    showMore
                    showMoreHref={buildShelfMoreHref({ categoryId: thrillerCategoryId })}
                    pillWidth={253}
                    isFav={isFav}
                    onToggleFavorite={toggleFavorite}
                    shelfIndex={2}
                />
                <BookSection
                    title={t("home.sections.science")}
                    books={scienceBooks}
                    showMore
                    showMoreHref={buildShelfMoreHref({ categoryId: scienceCategoryId })}
                    pillWidth={211}
                    isFav={isFav}
                    onToggleFavorite={toggleFavorite}
                    shelfIndex={3}
                />
                <BookSection
                    title={t("home.sections.fantasy")}
                    books={fantasyBooks}
                    showMore
                    showMoreHref={buildShelfMoreHref({ categoryId: fantasyCategoryId })}
                    pillWidth={292}
                    isFav={isFav}
                    onToggleFavorite={toggleFavorite}
                    shelfIndex={4}
                />

                <PromoBanner />

                <BookSection
                    title={t("home.sections.bestsellers")}
                    books={desktopHitsBooks}
                    showMore
                    showMoreHref={buildShelfMoreHref({ sort: "bestsellers" })}
                    pillWidth={355}
                    isFav={isFav}
                    onToggleFavorite={toggleFavorite}
                    shelfIndex={5}
                />
                <BookSection
                    title={t("home.sections.newArrivals")}
                    books={desktopNewBooks}
                    showMore
                    showMoreHref={buildShelfMoreHref({ sort: "newest" })}
                    pillWidth={237}
                    isFav={isFav}
                    onToggleFavorite={toggleFavorite}
                    shelfIndex={6}
                />
                <BookSection
                    title={t("home.sections.bookSets")}
                    books={setBooks}
                    showMore
                    showMoreHref={buildShelfMoreHref({ sets: true })}
                    pillWidth={472}
                    isFav={isFav}
                    onToggleFavorite={toggleFavorite}
                    shelfIndex={7}
                />
                <BookSection
                    title={t("home.sections.announcements")}
                    books={desktopAnnouncementBooks}
                    showMore
                    showMoreHref={buildShelfMoreHref({ availability: Availability.NUMBER_2 })}
                    pillWidth={204}
                    isFav={isFav}
                    onToggleFavorite={toggleFavorite}
                    shelfIndex={8}
                />
            </div>
        </main>
    );
}