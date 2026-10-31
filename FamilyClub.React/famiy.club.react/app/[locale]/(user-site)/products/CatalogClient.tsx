"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import BookCard from "@/app/(user-site)/main_page/BookCard";
import MobileBookCard from "@/app/(user-site)/main_page/mobile/MobileBookCard";
import { ProductDto, FormatDto, CategoryDto, ReviewDto, Availability } from "@/lib/api/generated";
import { productService, formatService, categoriesService, reviewService } from "@/lib/api/services";
import { getProductCoverUrl } from "@/lib/products/productCoverUrl";
import { getFormatTags } from "@/lib/recommendations/mapProductToBook";
import { useLocale, useLocalizedPath, useTranslations } from "@/lib/i18n/LocaleProvider";
import ShelfCat from "../main_page/ShelfCat";
import { useMascotShelf } from "@/lib/mascot/MascotShelfContext";

interface CatalogClientProps {
  initialProducts?: ProductDto[];
}

const PRODUCTS_PER_PAGE = 12; // 4 columns × 3 rows

type ShelfDecor = {
  src: string;
  side: "left" | "right";
  width: number;
  height: number;
  offsetY?: number;
};

/** Desktop shelf side props (same assets as the previous catalog decorations layer). */
const CATALOG_SHELF_DECORS: ShelfDecor[] = [
  { src: "/images/catalog/lilies.png", side: "left", width: 304, height: 137 },
  { src: "/images/catalog/pillows.png", side: "right", width: 314, height: 251 },
  { src: "/images/catalog/train.png", side: "left", width: 306, height: 210 },
  { src: "/images/catalog/plaid.png", side: "right", width: 295, height: 286, offsetY: 130 },
  { src: "/images/catalog/hunger_games.png", side: "left", width: 336, height: 128 },
];

function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function pickShelfDecorsForRows(rowCount: number, seed: number): Array<ShelfDecor | null> {
  const rand = seededRandom(seed);
  const pool = [...CATALOG_SHELF_DECORS];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return Array.from({ length: rowCount }, (_, rowIndex) => {
    // ~80% of shelves get a prop; shuffle pool so repeats are delayed
    if (rand() < 0.2) return null;
    return pool[rowIndex % pool.length];
  });
}

interface CatalogShelfRowProps {
  rowIndex: number;
  row: ProductDto[];
  decor: ShelfDecor | null;
  lp: (path: string) => string;
  t: (key: string) => string;
  getDesktopProductPrice: (p: ProductDto) => string;
  getProductImage: (p: ProductDto) => string | undefined;
}

function CatalogShelfRow({
  rowIndex,
  row,
  decor,
  lp,
  t,
  getDesktopProductPrice,
  getProductImage,
}: CatalogShelfRowProps) {
  const { isCatOnShelf, activeShelfIndex, registerShelf } = useMascotShelf();

  useEffect(() => {
    return registerShelf(rowIndex);
  }, [rowIndex, registerShelf]);

  const hasCat = isCatOnShelf && activeShelfIndex === rowIndex;

  return (
    <section
      key={`catalog-shelf-${rowIndex}`}
      className="relative w-full overflow-visible pt-0 pb-0"
      style={{
        backgroundImage:
          "linear-gradient(180.074deg, color-mix(in srgb, var(--foreground-primary) 12%, transparent) 0.24409%, transparent 17.892%), linear-gradient(180.074deg, color-mix(in srgb, var(--foreground-primary) 22%, transparent) 9.5072%, transparent 49.996%), linear-gradient(90deg, var(--background-main) 0%, var(--background-main) 100%)",
      }}
    >
      <div
        id={`book-shelf-${rowIndex}`}
        data-shelf-index={rowIndex}
        className="relative h-[85px] md:h-[95px] w-full overflow-visible"
      >
        <img
          src="/images/userProfile/Group 187.png"
          alt=""
          aria-hidden
          className="absolute inset-0 z-10 w-full h-full object-fill pointer-events-none"
        />

        {hasCat && (
          <div className="pointer-events-none absolute inset-0 z-50 mx-auto max-w-[1220px] px-4 lg:px-0">
            <div className="relative h-full w-full" id="shelf-cat-anchor" data-shelf-cat="true">
              <ShelfCat />
            </div>
          </div>
        )}
      </div>

      {decor ? (
        <div className="pointer-events-none absolute inset-0 z-[15] hidden xl:block overflow-visible">
          <img
            src={decor.src}
            alt=""
            aria-hidden
            className={`absolute object-contain ${
              decor.side === "left" ? "left-0" : "right-0"
            }`}
            style={{
              width: decor.width,
              height: decor.height,
              top: `calc(${55}px - ${decor.height}px + 12px + ${decor.offsetY ?? 0}px)`,
            }}
          />
        </div>
      ) : null}

      <div className="relative mx-auto max-w-[1220px] px-4 lg:px-0">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-[60px] pb-12 -mt-[50px]">
          {row.map((product) => (
            <Link
              key={product.id}
              href={lp(`/products/${product.id}`)}
              className="flex justify-center"
            >
              <BookCard
                title={product.productName || t("catalog.untitled")}
                price={getDesktopProductPrice(product)}
                image={getProductImage(product)}
                rating={0}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function CatalogClient({ initialProducts = [] }: CatalogClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const lp = useLocalizedPath();
  const { locale } = useLocale();
  const [currentPage, setCurrentPage] = useState(1);
  const [allProducts, setAllProducts] = useState<ProductDto[]>(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const [loadError, setLoadError] = useState(false);
  const [formats, setFormats] = useState<FormatDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [reviews, setReviews] = useState<ReviewDto[]>([]);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      formatService.apiFormatsGet().catch(() => []),
      categoriesService.apiCategoriesGet().catch(() => []),
      reviewService.apiReviewsGet().catch(() => []),
    ]).then(([formatsRes, categoriesRes, reviewsRes]) => {
      if (!mounted) return;
      if (Array.isArray(formatsRes)) setFormats(formatsRes);
      if (Array.isArray(categoriesRes)) setCategories(categoriesRes);
      if (Array.isArray(reviewsRes)) setReviews(reviewsRes);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (initialProducts.length > 0) return;

    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setLoadError(false);
        const products = await productService.apiProductsGet();
        if (!mounted) return;
        if (!Array.isArray(products)) {
          setAllProducts([]);
          setLoadError(true);
          return;
        }
        setAllProducts(products);
      } catch (err) {
        console.error("Failed to load catalog", err);
        if (mounted) {
          setAllProducts([]);
          setLoadError(true);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [initialProducts.length]);

  const reviewCountByProductId = useMemo(() => {
    const map = new Map<number, number>();
    for (const r of reviews) {
      if (!r.productId || r.approved === false) continue;
      map.set(r.productId, (map.get(r.productId) ?? 0) + 1);
    }
    return map;
  }, [reviews]);

  const getReviewCountForProduct = (productId?: number) => {
    if (!productId) return 0;
    return reviewCountByProductId.get(productId) ?? 0;
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    let products = [...allProducts];

    const categoryIds = searchParams.getAll("categoryId").flatMap(v => v.split(',')).map(id => parseInt(id)).filter(id => !isNaN(id));
    if (categoryIds.length > 0) {
      products = products.filter(
        (p) => p.categoryIds?.some(id => categoryIds.includes(id))
      );
    }

    const authorIds = searchParams.getAll("authorId").flatMap(v => v.split(',')).map(id => parseInt(id)).filter(id => !isNaN(id));
    if (authorIds.length > 0) {
      products = products.filter(
        (p) => p.authorIds?.some(id => authorIds.includes(id))
      );
    }

    const languageIds = searchParams.getAll("languageId").flatMap(v => v.split(',')).map(id => parseInt(id)).filter(id => !isNaN(id));
    if (languageIds.length > 0) {
      products = products.filter(
        (p) => p.languageIds?.some(id => languageIds.includes(id))
      );
    }

    const formatIds = searchParams.getAll("formatId").flatMap(v => v.split(',')).map(id => parseInt(id)).filter(id => !isNaN(id));
    const formatKey = searchParams.get("format") as "paper" | "ebook" | "audio" | null;

    if (formatIds.length > 0 || formatKey) {
      const formatsMap = new Map<number, FormatDto>();
      formats.forEach((f) => { if (f.id != null) formatsMap.set(f.id, f); });
      products = products.filter((p) => {
        const matchesId = formatIds.length > 0 ? p.formatIds?.some(id => formatIds.includes(id)) : false;
        const matchesKey = formatKey && formatsMap.size > 0 ? getFormatTags(p.formatIds, formatsMap).includes(formatKey) : false;
        return matchesId || matchesKey;
      });
    }

    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    if (minPrice || maxPrice) {
      products = products.filter((p) => {
        const price = p.discountPrice ?? p.price ?? 0;
        if (minPrice && price < parseFloat(minPrice)) return false;
        if (maxPrice && price > parseFloat(maxPrice)) return false;
        return true;
      });
    }

    const ageRestrictionIds = searchParams.getAll("ageRestrictionId").flatMap(v => v.split(',')).map(id => parseInt(id)).filter(id => !isNaN(id));
    if (ageRestrictionIds.length > 0) {
      products = products.filter(
        (p) => p.ageRestrictionIds?.some(id => ageRestrictionIds.includes(id))
      );
    }

    const year = searchParams.get("year");
    if (year) {
      const yearNum = parseInt(year);
      products = products.filter((p) => {
        if (!p.publishingDate) return false;
        const pubYear = new Date(p.publishingDate).getFullYear();
        return pubYear === yearNum;
      });
    }

    const yearFrom = searchParams.get("yearFrom");
    const yearTo = searchParams.get("yearTo");
    if (yearFrom || yearTo) {
      products = products.filter((p) => {
        if (!p.publishingDate) return false;
        const pubYear = new Date(p.publishingDate).getFullYear();
        if (yearFrom && pubYear < parseInt(yearFrom)) return false;
        if (yearTo && pubYear > parseInt(yearTo)) return false;
        return true;
      });
    }

    const search = searchParams.get("search") || searchParams.get("q");
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      products = products.filter(
        (p) =>
          p.productName?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    const promoOnly = searchParams.get("promo");
    if (promoOnly === "true") {
      products = products.filter((p) => p.discountPrice != null);
    }

    const setsOnly = searchParams.get("sets");
    if (setsOnly === "true") {
      products = products.filter((p) => (p.itemsInSet ?? 0) > 1);
    }

    const availability = searchParams.get("availability");
    if (availability === "2" || availability === "announcement") {
      products = products.filter((p) => p.availability === Availability.NUMBER_2 || (p.availability as unknown) === 2);
    }

    const sort = searchParams.get("sort");
    if (sort === "bestsellers" || sort === "hits") {
      products.sort((a, b) => {
        const countA = getReviewCountForProduct(a.id);
        const countB = getReviewCountForProduct(b.id);
        if (countB !== countA) return countB - countA;
        return (b.id ?? 0) - (a.id ?? 0);
      });
    } else if (sort === "newest" || sort === "new") {
      products.sort((a, b) => {
        const timeA = a.publishingDate ? new Date(a.publishingDate).getTime() : 0;
        const timeB = b.publishingDate ? new Date(b.publishingDate).getTime() : 0;
        if (timeB !== timeA) return timeB - timeA;
        return (b.id ?? 0) - (a.id ?? 0);
      });
    } else if (sort === "price-asc") {
      products.sort((a, b) => (a.discountPrice ?? a.price ?? 0) - (b.discountPrice ?? b.price ?? 0));
    } else if (sort === "price-desc") {
      products.sort((a, b) => (b.discountPrice ?? b.price ?? 0) - (a.discountPrice ?? a.price ?? 0));
    }

    return products;
  }, [allProducts, searchParams, formats, reviews, reviewCountByProductId]);

  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const desktopShelfRowCount = Math.max(1, Math.ceil(paginatedProducts.length / 4));

  // Stable per page (seeded) so hydration matches; reshuffles when page/product count changes
  const shelfDecorByRow = useMemo(
    () =>
      pickShelfDecorsForRows(
        desktopShelfRowCount,
        currentPage * 9973 + paginatedProducts.length * 13 + 42,
      ),
    [desktopShelfRowCount, currentPage, paginatedProducts.length],
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getProductPrice = (p: ProductDto) => {
    const price = p.discountPrice ?? p.price ?? 0;
    const formatted = price.toLocaleString(locale === "en" ? "en-US" : "uk-UA");
    return locale === "en" ? `${formatted} UAH` : `${formatted} грн`;
  };

  const getDesktopProductPrice = (p: ProductDto) => {
    const price = p.discountPrice ?? p.price ?? 0;
    const formatted = price.toLocaleString(locale === "en" ? "en-US" : "uk-UA");
    return locale === "en" ? `${formatted} UAH` : `${formatted} грн`;
  };

  const getProductImage = (p: ProductDto) => {
    return getProductCoverUrl(p) ?? undefined;
  };

  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [currentPage, totalPages]);

  const activeFilterChips = useMemo(() => {
    const chips: { id: string; label: string; removeKeys: string[] }[] = [];
    const currency = locale === "en" ? "UAH" : "грн";

    const yearFrom = searchParams.get("yearFrom");
    const yearTo = searchParams.get("yearTo");
    const year = searchParams.get("year");

    if (yearFrom || yearTo) {
      let label = t("catalog.filters.publicationYear") + " ";
      if (yearFrom === "0" && yearTo === "1999") label += t("catalog.filters.before2000");
      else if (yearFrom === "2000" && yearTo === "2010") label += t("catalog.filters.year2000_2010");
      else if (yearFrom === "2010" && yearTo === "2020") label += t("catalog.filters.year2010_2020");
      else if (yearFrom === "2020" && (yearTo === "3000" || yearTo === "9999")) label += t("catalog.filters.from2020");
      else if (yearFrom && yearTo) label += `${yearFrom}–${yearTo}`;
      else if (yearFrom) label += t("catalog.filters.from").replace("{value}", yearFrom);
      else if (yearTo) label += t("catalog.filters.to").replace("{value}", yearTo);

      chips.push({ id: "year-range", label, removeKeys: ["yearFrom", "yearTo"] });
    } else if (year) {
      chips.push({
        id: "year-exact",
        label: `${t("catalog.filters.publicationYear")} ${year}`,
        removeKeys: ["year"],
      });
    }

    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    if (minPrice || maxPrice) {
      let label = t("catalog.filters.price") + " ";
      if (minPrice && maxPrice) label += `${minPrice}–${maxPrice} ${currency}`;
      else if (minPrice) label += `${t("catalog.filters.from").replace("{value}", minPrice)} ${currency}`;
      else if (maxPrice) label += `${t("catalog.filters.to").replace("{value}", maxPrice)} ${currency}`;

      chips.push({ id: "price-range", label, removeKeys: ["minPrice", "maxPrice"] });
    }

    const categoryIds = searchParams.getAll("categoryId").flatMap(v => v.split(',')).filter(Boolean);
    if (categoryIds.length > 0) {
      let catLabel = t("catalog.filters.categoriesSelected").replace("{count}", String(categoryIds.length));
      if (categoryIds.length === 1) {
        const targetId = parseInt(categoryIds[0]);
        const cat = categories.find((c) => c.id === targetId);
        if (cat?.categoryName) catLabel = cat.categoryName;
      }
      chips.push({
        id: "categories",
        label: catLabel,
        removeKeys: ["categoryId"],
      });
    }

    const authorIds = searchParams.getAll("authorId").flatMap(v => v.split(',')).filter(Boolean);
    if (authorIds.length > 0) {
      chips.push({
        id: "authors",
        label: t("catalog.filters.authorsSelected").replace("{count}", String(authorIds.length)),
        removeKeys: ["authorId"],
      });
    }

    const languageIds = searchParams.getAll("languageId").flatMap(v => v.split(',')).filter(Boolean);
    if (languageIds.length > 0) {
      chips.push({
        id: "languages",
        label: t("catalog.filters.languagesSelected").replace("{count}", String(languageIds.length)),
        removeKeys: ["languageId"],
      });
    }

    const formatIds = searchParams.getAll("formatId").flatMap(v => v.split(',')).filter(Boolean);
    const formatKey = searchParams.get("format");
    if (formatIds.length > 0 || formatKey) {
      let label = t("catalog.filters.formatsSelected").replace("{count}", String(formatIds.length || 1));
      if (formatKey === "paper") label = t("product.formats.paper") || "Паперові книги";
      else if (formatKey === "ebook") label = t("product.formats.ebook") || "eBook";
      else if (formatKey === "audio") label = t("product.formats.audio") || "Аудіокниги";

      chips.push({
        id: "formats",
        label,
        removeKeys: ["formatId", "format"],
      });
    }

    const ageIds = searchParams.getAll("ageRestrictionId").flatMap(v => v.split(',')).filter(Boolean);
    if (ageIds.length > 0) {
      chips.push({
        id: "age-restrictions",
        label: t("catalog.filters.ageCategories").replace("{count}", String(ageIds.length)),
        removeKeys: ["ageRestrictionId"],
      });
    }

    const search = searchParams.get("search") || searchParams.get("q");
    if (search && search.trim()) {
      chips.push({
        id: "search-q",
        label: t("catalog.filters.search").replace("{query}", search.trim()),
        removeKeys: ["search", "q"],
      });
    }

    const promo = searchParams.get("promo");
    if (promo === "true") {
      chips.push({ id: "promo-tag", label: t("catalog.filters.promo"), removeKeys: ["promo"] });
    }

    const sort = searchParams.get("sort");
    if (sort === "bestsellers" || sort === "hits") {
      chips.push({ id: "sort-bestsellers", label: t("home.sections.bestsellers") || "Хіти продажу", removeKeys: ["sort"] });
    } else if (sort === "newest" || sort === "new") {
      chips.push({ id: "sort-newest", label: t("home.sections.newArrivals") || "Новинки", removeKeys: ["sort"] });
    }

    const sets = searchParams.get("sets");
    if (sets === "true") {
      chips.push({ id: "sets-tag", label: t("home.sections.bookSets") || "Книжкові комплекти", removeKeys: ["sets"] });
    }

    const availability = searchParams.get("availability");
    if (availability === "2" || availability === "announcement") {
      chips.push({ id: "availability-tag", label: t("home.sections.announcements") || "Анонси", removeKeys: ["availability"] });
    }

    return chips;
  }, [searchParams, t, locale, categories]);

  const handleRemoveFilterChip = (keysToRemove: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    keysToRemove.forEach((key) => params.delete(key));
    const newUrl = params.toString() ? `${lp("/products")}?${params.toString()}` : lp("/products");
    router.replace(newUrl, { scroll: false });
  };

  const handleClearAllFilters = () => {
    router.replace(lp("/products"), { scroll: false });
  };

  return (
    <div className="w-full min-h-screen bg-[var(--background-main)] font-sans text-[var(--foreground-primary)] overflow-x-hidden">
      {/* MOBILE CATALOG VIEW (Figma Node 2199:3603 "Пошук" 1-to-1 spec) */}
      <div className="block md:hidden pt-[75px] pb-[100px] px-3 sm:px-4">
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h1 className="font-mono text-[28px] font-bold text-[var(--foreground-primary)] leading-tight">
              {t("nav.catalog")}
            </h1>
            <p className="text-[14px] text-[var(--color-muted-fg)] font-medium">
              {loading
                ? t("common.loading")
                : t("catalog.productsFound").replace("{count}", String(totalProducts))}
            </p>
          </div>
          <Link
            href={lp("/categories")}
            className="px-3.5 py-1.5 rounded-full bg-[var(--color-green)] text-white font-sans text-[13px] font-semibold shadow-sm hover:bg-[color-mix(in_srgb,var(--color-green)_85%,black)] transition-colors flex items-center gap-1"
          >
            <span>{t("catalog.filtersButton")}</span>
            <span>⚙️</span>
          </Link>
        </div>

        {activeFilterChips.length > 0 && (
          <div className="mb-4 flex flex-col gap-2 bg-[color-mix(in_srgb,var(--background-elevated)_92%,transparent)] p-3 rounded-2xl border border-[var(--color-border-warm)] shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-[var(--foreground-primary)]">
                {t("catalog.activeFilters")}
              </span>
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="text-[12px] font-bold text-[var(--color-green)] hover:underline"
              >
                {t("catalog.clearAll")}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {activeFilterChips.map((chip) => (
                <div
                  key={`mobile-${chip.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[color-mix(in_srgb,var(--color-green)_10%,transparent)] border border-[color-mix(in_srgb,var(--color-green)_20%,transparent)] rounded-full text-[12px] font-semibold text-[var(--color-green)]"
                >
                  <span>{chip.label}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFilterChip(chip.removeKeys)}
                    className="text-[var(--color-green)] hover:text-[var(--foreground-primary)] font-bold ml-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16">
            <p className="text-[16px] text-[var(--color-muted-fg)] font-mono">{t("catalog.loadingBooks")}</p>
          </div>
        ) : loadError ? (
          <div className="text-center py-16 px-4 bg-[color-mix(in_srgb,var(--background-elevated)_70%,transparent)] rounded-2xl border border-[var(--color-border-warm)]">
            <h2 className="text-[20px] font-bold text-[var(--foreground-primary)] mb-2">{t("catalog.loadErrorTitle")}</h2>
            <p className="text-[14px] text-[var(--color-muted-fg)]">{t("catalog.loadErrorText")}</p>
          </div>
        ) : paginatedProducts.length > 0 ? (
          <>
            <div className="flex flex-col gap-6 max-w-[420px] mx-auto pt-2">
              {Array.from({ length: Math.ceil(paginatedProducts.length / 2) }).map((_, rowIndex) => {
                const rowProducts = paginatedProducts.slice(rowIndex * 2, rowIndex * 2 + 2);
                return (
                  <div key={`mobile-shelf-row-${rowIndex}`} className="w-full flex flex-col items-center">
                    {/* Books Row */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-4 w-full justify-items-center z-10">
                      {rowProducts.map((product) => (
                        <div key={product.id} className="w-full flex justify-center">
                          <MobileBookCard
                            title={product.productName || t("catalog.untitled")}
                            author={product.authorIds?.length ? t("product.authorAlt") : null}
                            price={getProductPrice(product)}
                            image={getProductImage(product)}
                            rating={0}
                            href={lp(`/products/${product.id}`)}
                            formatTags={["paper"]}
                          />
                        </div>
                      ))}
                      {rowProducts.length === 1 && <div className="w-full max-w-[186px] h-[258px]" />}
                    </div>

                    {/* 3D Wooden Bookshelf Bar (Figma Node 2199:3605 / Rectangle 194) */}
                    <div className="relative z-0 h-[28px] w-[calc(100%+24px)] -mx-3 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] bg-[var(--color-shelf)] mt-[-6px] rounded-sm overflow-hidden">
                      <img
                        src="/images/catalog/shelf_tex1.png"
                        className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-50 pointer-events-none"
                        alt=""
                      />
                      <div className="absolute inset-0 bg-[rgba(0,0,0,0.27)] pointer-events-none" />
                      <div className="absolute left-0 right-0 bottom-0 h-[10px]">
                        <img
                          src="/images/catalog/shelf_tex2.png"
                          className="absolute inset-0 w-full h-full object-cover mix-blend-multiply pointer-events-none"
                          alt=""
                        />
                        <img
                          src="/images/catalog/shelf_tex3.png"
                          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                          alt=""
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8 py-4">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3.5 py-1.5 rounded-lg bg-[var(--background-elevated)] border border-[var(--color-border-warm)] text-[14px] font-medium shadow-sm disabled:opacity-40"
                >
                  {t("catalog.prevPage")}
                </button>
                <span className="text-[14px] font-semibold text-[var(--foreground-primary)] px-2">
                  {t("catalog.pageOf")
                    .replace("{current}", String(currentPage))
                    .replace("{total}", String(totalPages))}
                </span>
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3.5 py-1.5 rounded-lg bg-[var(--background-elevated)] border border-[var(--color-border-warm)] text-[14px] font-medium shadow-sm disabled:opacity-40"
                >
                  {t("catalog.nextPage")}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 px-4 bg-[color-mix(in_srgb,var(--background-elevated)_70%,transparent)] rounded-2xl border border-[var(--color-border-warm)]">
            <h2 className="text-[20px] font-bold text-[var(--foreground-primary)] mb-2">{t("catalog.noProductsTitle")}</h2>
            <p className="text-[14px] text-[var(--color-muted-fg)] mb-4">{t("catalog.noProductsText")}</p>
            {activeFilterChips.length > 0 && (
              <button
                onClick={handleClearAllFilters}
                className="px-4 py-2 rounded-full bg-[var(--color-green)] text-white font-semibold text-[14px] shadow-sm"
              >
                {t("catalog.clearAllFilters")}
              </button>
            )}
          </div>
        )}
      </div>

      {/* DESKTOP CATALOG VIEW */}
      <div className="hidden md:block">
        <div className="w-full pt-[280px] pb-[60px] relative">
          <div className="max-w-[1220px] mx-auto px-[16px] lg:px-0 relative">
            <img 
              src="/images/catalog/arrow.svg" 
              alt={t("catalog.arrowAlt")} 
              className="absolute left-[120px] -top-[120px] w-[120px] h-[72px] -rotate-90 pointer-events-none hidden md:block"
            />
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 md:gap-0">
              <div className="max-w-[590px] font-mono font-semibold text-[16px] tracking-[-0.176px] leading-[1.5]">
                <p className="text-[var(--color-muted-fg)] whitespace-pre-wrap">
                  <span className="text-[var(--foreground-primary)]">{t("catalog.introHighlight")}</span>
                  <br />
                  {t("catalog.introText")}
                </p>
              </div>

              <div className="text-[var(--foreground-primary)] font-mono font-semibold text-[24px] md:text-[32px] text-right tracking-[-0.352px] leading-[1.5]">
                {loading
                  ? t("catalog.loading")
                  : t("catalog.matchesFound").replace(
                      "{count}",
                      totalProducts.toLocaleString(locale === "en" ? "en-US" : "uk-UA")
                    )}
              </div>
            </div>

            {activeFilterChips.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-2 bg-[color-mix(in_srgb,var(--background-elevated)_92%,transparent)] p-3 rounded-2xl border border-[var(--color-border-warm)] shadow-sm">
                <span className="text-sm font-semibold text-[var(--foreground-primary)] mr-1">
                  {t("catalog.activeFilters")}
                </span>
                {activeFilterChips.map((chip) => (
                  <div
                    key={chip.id}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-[color-mix(in_srgb,var(--color-green)_10%,transparent)] border border-[color-mix(in_srgb,var(--color-green)_20%,transparent)] rounded-full text-xs font-semibold text-[var(--color-green)]"
                  >
                    <span>{chip.label}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFilterChip(chip.removeKeys)}
                      className="text-[var(--color-green)] hover:text-[var(--foreground-primary)] font-bold ml-1 transition-colors"
                      aria-label={t("catalog.removeFilterAria").replace("{label}", chip.label)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="ml-auto text-xs font-bold text-[var(--color-green)] hover:underline"
                >
                  {t("catalog.clearAll")}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Products Grid on Wooden Shelves (same shelf tech as home BookSection) */}
        <div className="relative w-full overflow-visible pb-[100px]">
          {loading ? (
            <div className="max-w-[1220px] mx-auto px-[16px] lg:px-0 pt-[120px] text-center py-[100px]">
              <p className="text-[18px] text-[var(--color-muted-fg)] font-mono">{t("catalog.loadingBooks")}</p>
            </div>
          ) : loadError ? (
            <div className="max-w-[1220px] mx-auto px-[16px] lg:px-0 pt-[120px] text-center py-[100px]">
              <h2 className="text-[24px] font-bold text-[var(--foreground-primary)] mb-[16px]">
                {t("catalog.loadErrorTitle")}
              </h2>
              <p className="text-[16px] text-[var(--color-muted-fg)]">
                {t("catalog.loadErrorText")}
              </p>
            </div>
          ) : paginatedProducts.length > 0 ? (
            <>
              <div className="relative z-20 w-full pt-[40px]">
                {Array.from({ length: desktopShelfRowCount }).map((_, rowIndex) => {
                  const row = paginatedProducts.slice(rowIndex * 4, rowIndex * 4 + 4);
                  const decor = shelfDecorByRow[rowIndex];
                  return (
                    <CatalogShelfRow
                      key={`catalog-shelf-${rowIndex}`}
                      rowIndex={rowIndex}
                      row={row}
                      decor={decor}
                      lp={lp}
                      t={t}
                      getDesktopProductPrice={getDesktopProductPrice}
                      getProductImage={getProductImage}
                    />
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="max-w-[1220px] mx-auto px-[16px] lg:px-0 flex items-center justify-center gap-[20px] py-[40px]">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center w-[40px] h-[40px] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-xl"
                    aria-label={t("catalog.previousPageAria")}
                  >
                    ←
                  </button>
                  <div className="flex items-center gap-[8px]">
                    {pageNumbers.map((pageNum, index) =>
                      pageNum === "..." ? (
                        <span key={`ellipsis-${index}`} className="px-[8px] font-mono">
                          ...
                        </span>
                      ) : (
                        <button
                          key={`desktop-page-${pageNum}`}
                          onClick={() => handlePageChange(pageNum as number)}
                          className={`flex items-center justify-center w-[40px] h-[40px] rounded-full transition-all font-mono font-semibold text-[18px] ${
                            currentPage === pageNum
                              ? "bg-[var(--foreground-primary)] text-[var(--background-main)]"
                              : "bg-transparent text-[var(--foreground-primary)] border border-[var(--color-border-warm)] hover:bg-[var(--foreground-primary)] hover:text-[var(--background-main)]"
                          }`}
                        >
                          {pageNum}
                        </button>
                      ),
                    )}
                  </div>
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center justify-center w-[40px] h-[40px] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-xl"
                    aria-label={t("catalog.nextPageAria")}
                  >
                    →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="max-w-[1220px] mx-auto px-[16px] lg:px-0 pt-[120px]">
              <div className="text-center py-[100px] relative z-20 bg-[color-mix(in_srgb,var(--background-elevated)_70%,transparent)] rounded-3xl border border-[var(--color-border-warm)]">
                <h2 className="text-[24px] font-bold text-[var(--foreground-primary)] mb-[16px]">
                  {t("catalog.noProductsTitle")}
                </h2>
                <p className="text-[16px] text-[var(--color-muted-fg)] mb-6">
                  {t("catalog.noProductsText")}
                </p>
                {Array.from(searchParams.entries()).length > 0 && (
                  <button
                    onClick={() => {
                      window.history.replaceState({}, "", lp("/products"));
                    }}
                    className="px-6 py-2.5 rounded-full bg-[var(--color-green)] text-white font-semibold text-[15px] shadow-sm hover:bg-[color-mix(in_srgb,var(--color-green)_85%,black)] transition-colors"
                  >
                    {t("catalog.clearAllFilters")}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
