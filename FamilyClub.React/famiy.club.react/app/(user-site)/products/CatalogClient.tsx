"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import BookCard from "@/app/(user-site)/main_page/BookCard";
import MobileBookCard from "@/app/(user-site)/main_page/mobile/MobileBookCard";
import { ProductDto } from "@/lib/api/generated";
import { productService } from "@/lib/api/services";
import { getProductCoverUrl } from "@/lib/products/productCoverUrl";

interface CatalogClientProps {
  initialProducts?: ProductDto[];
}

const PRODUCTS_PER_PAGE = 12; // 4 columns × 3 rows

export default function CatalogClient({ initialProducts = [] }: CatalogClientProps) {
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [allProducts, setAllProducts] = useState<ProductDto[]>(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const [loadError, setLoadError] = useState(false);

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

  // Reset pagination to page 1 when search filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchParams]);

  // Apply filters when search params or catalog data change
  const filteredProducts = useMemo(() => {
    let products = [...allProducts];

    // Filter by category
    const categoryIds = searchParams.getAll("categoryId").flatMap(v => v.split(',')).map(id => parseInt(id)).filter(id => !isNaN(id));
    if (categoryIds.length > 0) {
      products = products.filter(
        (p) => p.categoryIds?.some(id => categoryIds.includes(id))
      );
    }

    // Filter by author
    const authorIds = searchParams.getAll("authorId").flatMap(v => v.split(',')).map(id => parseInt(id)).filter(id => !isNaN(id));
    if (authorIds.length > 0) {
      products = products.filter(
        (p) => p.authorIds?.some(id => authorIds.includes(id))
      );
    }

    // Filter by language
    const languageIds = searchParams.getAll("languageId").flatMap(v => v.split(',')).map(id => parseInt(id)).filter(id => !isNaN(id));
    if (languageIds.length > 0) {
      products = products.filter(
        (p) => p.languageIds?.some(id => languageIds.includes(id))
      );
    }

    // Filter by format
    const formatIds = searchParams.getAll("formatId").flatMap(v => v.split(',')).map(id => parseInt(id)).filter(id => !isNaN(id));
    if (formatIds.length > 0) {
      products = products.filter(
        (p) => p.formatIds?.some(id => formatIds.includes(id))
      );
    }

    // Filter by price range
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

    // Filter by age restriction
    const ageRestrictionIds = searchParams.getAll("ageRestrictionId").flatMap(v => v.split(',')).map(id => parseInt(id)).filter(id => !isNaN(id));
    if (ageRestrictionIds.length > 0) {
      products = products.filter(
        (p) => p.ageRestrictionIds?.some(id => ageRestrictionIds.includes(id))
      );
    }

    // Filter by year
    const year = searchParams.get("year");
    if (year) {
      const yearNum = parseInt(year);
      products = products.filter((p) => {
        if (!p.publishingDate) return false;
        const pubYear = new Date(p.publishingDate).getFullYear();
        return pubYear === yearNum;
      });
    }

    // Filter by year range (e.g. yearFrom=2000&yearTo=2010 or yearFrom=0&yearTo=1999)
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

    // Filter by search query
    const search = searchParams.get("search") || searchParams.get("q");
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      products = products.filter(
        (p) =>
          p.productName?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    // Filter by promotion only
    const promoOnly = searchParams.get("promo");
    if (promoOnly === "true") {
      products = products.filter((p) => p.discountPrice != null);
    }

    return products;
  }, [allProducts, searchParams]);

  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getProductPrice = (p: ProductDto) => {
    const price = p.discountPrice ?? p.price ?? 0;
    return `${price.toLocaleString("uk-UA")} грн`;
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

  // Formatted user-friendly active filter chips
  const activeFilterChips = useMemo(() => {
    const chips: { id: string; label: string; removeKeys: string[] }[] = [];

    const yearFrom = searchParams.get("yearFrom");
    const yearTo = searchParams.get("yearTo");
    const year = searchParams.get("year");

    if (yearFrom || yearTo) {
      let label = "Рік видання: ";
      if (yearFrom === "0" && yearTo === "1999") label += "до 2000";
      else if (yearFrom === "2000" && yearTo === "2010") label += "2000–2010";
      else if (yearFrom === "2010" && yearTo === "2020") label += "2010–2020";
      else if (yearFrom === "2020" && (yearTo === "3000" || yearTo === "9999")) label += "з 2020";
      else if (yearFrom && yearTo) label += `${yearFrom}–${yearTo}`;
      else if (yearFrom) label += `від ${yearFrom}`;
      else if (yearTo) label += `до ${yearTo}`;

      chips.push({ id: "year-range", label, removeKeys: ["yearFrom", "yearTo"] });
    } else if (year) {
      chips.push({ id: "year-exact", label: `Рік видання: ${year}`, removeKeys: ["year"] });
    }

    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    if (minPrice || maxPrice) {
      let label = "Ціна: ";
      if (minPrice && maxPrice) label += `${minPrice}–${maxPrice} грн`;
      else if (minPrice) label += `від ${minPrice} грн`;
      else if (maxPrice) label += `до ${maxPrice} грн`;

      chips.push({ id: "price-range", label, removeKeys: ["minPrice", "maxPrice"] });
    }

    const categoryIds = searchParams.getAll("categoryId").flatMap(v => v.split(',')).filter(Boolean);
    if (categoryIds.length > 0) {
      chips.push({ id: "categories", label: `Обрано категорій: ${categoryIds.length}`, removeKeys: ["categoryId"] });
    }

    const authorIds = searchParams.getAll("authorId").flatMap(v => v.split(',')).filter(Boolean);
    if (authorIds.length > 0) {
      chips.push({ id: "authors", label: `Обрано авторів: ${authorIds.length}`, removeKeys: ["authorId"] });
    }

    const languageIds = searchParams.getAll("languageId").flatMap(v => v.split(',')).filter(Boolean);
    if (languageIds.length > 0) {
      chips.push({ id: "languages", label: `Обрано мов: ${languageIds.length}`, removeKeys: ["languageId"] });
    }

    const formatIds = searchParams.getAll("formatId").flatMap(v => v.split(',')).filter(Boolean);
    if (formatIds.length > 0) {
      chips.push({ id: "formats", label: `Обрано форматів: ${formatIds.length}`, removeKeys: ["formatId"] });
    }

    const ageIds = searchParams.getAll("ageRestrictionId").flatMap(v => v.split(',')).filter(Boolean);
    if (ageIds.length > 0) {
      chips.push({ id: "age-restrictions", label: `Вікові категорії: ${ageIds.length}`, removeKeys: ["ageRestrictionId"] });
    }

    const search = searchParams.get("search") || searchParams.get("q");
    if (search && search.trim()) {
      chips.push({ id: "search-q", label: `Пошук: «${search.trim()}»`, removeKeys: ["search", "q"] });
    }

    const promo = searchParams.get("promo");
    if (promo === "true") {
      chips.push({ id: "promo-tag", label: "Акційні товари", removeKeys: ["promo"] });
    }

    return chips;
  }, [searchParams]);

  const handleRemoveFilterChip = (keysToRemove: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    keysToRemove.forEach((key) => params.delete(key));
    const newUrl = params.toString() ? `/products?${params.toString()}` : "/products";
    window.history.replaceState({}, "", newUrl);
  };

  return (
    <div className="w-full min-h-screen bg-[#f5f3ee] font-sans text-[#242424] overflow-x-hidden">
      {/* MOBILE CATALOG VIEW (Figma Node 2199:3603 "Пошук" 1-to-1 spec) */}
      <div className="block md:hidden pt-[75px] pb-[100px] px-3 sm:px-4">
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h1 className="font-mono text-[28px] font-bold text-[#242424] leading-tight">
              Каталог
            </h1>
            <p className="text-[14px] text-[#242424]/70 font-medium">
              {loading ? "Завантаження..." : `Знайдено ${totalProducts} товарів`}
            </p>
          </div>
          <Link
            href="/categories"
            className="px-3.5 py-1.5 rounded-full bg-[#005B33] text-white font-sans text-[13px] font-semibold shadow-sm hover:bg-[#004e2b] transition-colors flex items-center gap-1"
          >
            <span>Фільтри</span>
            <span>⚙️</span>
          </Link>
        </div>

        {/* Mobile Active Filter Chips */}
        {activeFilterChips.length > 0 && (
          <div className="mb-4 flex flex-col gap-2 bg-white/90 p-3 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-[#242424]">
                Активні фільтри:
              </span>
              <button
                type="button"
                onClick={() => {
                  window.history.replaceState({}, "", "/products");
                }}
                className="text-[12px] font-bold text-[#005B33] hover:underline"
              >
                Очистити все ✕
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {activeFilterChips.map((chip) => (
                <div
                  key={`mobile-${chip.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#005B33]/10 border border-[#005B33]/20 rounded-full text-[12px] font-semibold text-[#005B33]"
                >
                  <span>{chip.label}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFilterChip(chip.removeKeys)}
                    className="text-[#005B33] hover:text-black font-bold ml-1"
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
            <p className="text-[16px] text-[#242424]/70 font-mono">Завантаження книг…</p>
          </div>
        ) : loadError ? (
          <div className="text-center py-16 px-4 bg-white/60 rounded-2xl border border-gray-200">
            <h2 className="text-[20px] font-bold text-[#242424] mb-2">Не вдалося завантажити каталог</h2>
            <p className="text-[14px] text-gray-600">Спробуйте пізніше або оновіть сторінку.</p>
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
                            title={product.productName || "Без назви"}
                            author={product.authorIds?.length ? "Автор" : null}
                            price={getProductPrice(product)}
                            image={getProductImage(product)}
                            rating={0}
                            href={`/products/${product.id}`}
                            formatTags={["paper"]}
                          />
                        </div>
                      ))}
                      {rowProducts.length === 1 && <div className="w-full max-w-[186px] h-[258px]" />}
                    </div>

                    {/* 3D Wooden Bookshelf Bar (Figma Node 2199:3605 / Rectangle 194) */}
                    <div className="relative z-0 h-[28px] w-[calc(100%+24px)] -mx-3 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] bg-[#7e4d1e] mt-[-6px] rounded-sm overflow-hidden">
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
                  className="px-3.5 py-1.5 rounded-lg bg-white border border-gray-300 text-[14px] font-medium shadow-sm disabled:opacity-40"
                >
                  ← Назад
                </button>
                <span className="text-[14px] font-semibold text-[#242424] px-2">
                  {currentPage} з {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3.5 py-1.5 rounded-lg bg-white border border-gray-300 text-[14px] font-medium shadow-sm disabled:opacity-40"
                >
                  Вперед →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 px-4 bg-white/60 rounded-2xl border border-gray-200">
            <h2 className="text-[20px] font-bold text-[#242424] mb-2">Товарів не знайдено</h2>
            <p className="text-[14px] text-gray-600 mb-4">Спробуйте змінити або очистити критерії пошуку.</p>
            {activeFilterChips.length > 0 && (
              <button
                onClick={() => {
                  window.history.replaceState({}, "", "/products");
                }}
                className="px-4 py-2 rounded-full bg-[#005B33] text-white font-semibold text-[14px] shadow-sm"
              >
                Очистити всі фільтри
              </button>
            )}
          </div>
        )}
      </div>

      {/* DESKTOP CATALOG VIEW */}
      <div className="hidden md:block">
        <div className="w-full pt-[140px] pb-[60px] relative">
          <div className="max-w-[1220px] mx-auto px-[16px] lg:px-0 relative">
            <img 
              src="/images/catalog/arrow.svg" 
              alt="Вказівник" 
              className="absolute left-[80px] -top-[120px] w-[120px] h-[72px] -rotate-90 pointer-events-none hidden md:block"
            />
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 md:gap-0">
              <div className="max-w-[590px] font-mono font-semibold text-[16px] tracking-[-0.176px] leading-[1.5]">
                <p className="text-[rgba(36,36,36,0.8)] whitespace-pre-wrap">
                  <span className="text-[#242424]">Обери, що тебе цікавить</span>
                  <br />
                  Скористайся закладками у хедері — натисни на потрібний параметр, щоб швидко знайти книгу за жанром, автором, мовою або настроєм.
                </p>
              </div>

              <div className="text-[#242424] font-mono font-semibold text-[24px] md:text-[32px] text-right tracking-[-0.352px] leading-[1.5]">
                {loading
                  ? "Завантаження…"
                  : `Знайдено ${totalProducts.toLocaleString("uk-UA")} збігів`}
              </div>
            </div>

            {/* Desktop Active Filter Chips */}
            {activeFilterChips.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-2 bg-white/90 p-3 rounded-2xl border border-[#e5ded4] shadow-sm">
                <span className="text-sm font-semibold text-[#242424] mr-1">
                  Активні фільтри:
                </span>
                {activeFilterChips.map((chip) => (
                  <div
                    key={chip.id}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#005B33]/10 border border-[#005B33]/20 rounded-full text-xs font-semibold text-[#005B33]"
                  >
                    <span>{chip.label}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFilterChip(chip.removeKeys)}
                      className="text-[#005B33] hover:text-black font-bold ml-1 transition-colors"
                      aria-label={`Видалити фільтр ${chip.label}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    window.history.replaceState({}, "", "/products");
                  }}
                  className="ml-auto text-xs font-bold text-[#005B33] hover:underline"
                >
                  Очистити все ✕
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Products Grid on Wooden Shelves */}
        <div className="relative w-full overflow-hidden">
          {/* Background Wooden Shelf Layer */}
          <div className="absolute inset-0 pointer-events-none z-0 flex flex-col">
            {Array.from({ length: Math.max(1, Math.ceil(paginatedProducts.length / 4)) }).map((_, rowIndex) => (
              <div key={`shelf-desktop-${rowIndex}`} className="relative w-full h-[605px] flex-shrink-0">
                <div 
                  className="absolute inset-0"
                  style={{ 
                    backgroundImage: "linear-gradient(180.074deg, rgba(36, 36, 36, 0.2) 0.24409%, rgba(36, 36, 36, 0) 17.892%), linear-gradient(180.074deg, rgba(36, 36, 36, 0.5) 9.5072%, rgba(36, 36, 36, 0) 49.996%), linear-gradient(90deg, rgb(245, 243, 238) 0%, rgb(245, 243, 238) 100%)" 
                  }} 
                />
                <div className="absolute left-0 right-0 top-0 h-[105px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] bg-[#7e4d1e]">
                  <img src="/images/catalog/shelf_tex1.png" className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-50" alt="" />
                  <div className="absolute inset-0 bg-[rgba(0,0,0,0.27)]" />
                </div>
                <div className="absolute left-0 right-0 top-[35px] h-[70px] bg-[#7e4d1e]">
                  <img src="/images/catalog/shelf_tex2.png" className="absolute inset-0 w-full h-full object-cover mix-blend-multiply" alt="" />
                  <img src="/images/catalog/shelf_tex3.png" className="absolute inset-0 w-full h-full object-cover" alt="" />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Decorations Layer */}
          <div className="absolute inset-0 pointer-events-none z-10 hidden xl:block mx-auto max-w-[1920px]">
             <img src="/images/catalog/lilies.png" className="absolute left-0 top-[260px] w-[304px] h-[137px]" alt="" />
             <img src="/images/catalog/pillows.png" className="absolute right-[0px] top-[200px] w-[314px] h-[251px]" alt="" />
             <img src="/images/catalog/train.png" className="absolute left-0 top-[660px] w-[306px] h-[210px]" alt="" />
             <img src="/images/catalog/plaid.png" className="absolute right-[0px] top-[710px] w-[295px] h-[286px]" alt="" />
             <img src="/images/catalog/hunger_games.png" className="absolute left-0 top-[1210px] w-[336px] h-[128px]" alt="" />
          </div>

          <div className="max-w-[1220px] mx-auto px-[16px] lg:px-0 pt-[180px] pb-[100px] relative z-20">
            {loading ? (
              <div className="text-center py-[100px] relative z-20">
                <p className="text-[18px] text-gray-600 font-mono">Завантаження книг…</p>
              </div>
            ) : loadError ? (
              <div className="text-center py-[100px] relative z-20">
                <h2 className="text-[24px] font-bold text-[#242424] mb-[16px]">
                  Не вдалося завантажити каталог
                </h2>
                <p className="text-[16px] text-gray-600">
                  Не вдалося завантажити товари. Спробуйте пізніше або оновіть сторінку.
                </p>
              </div>
            ) : paginatedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-[60px] gap-y-[205px] mb-[60px]">
                  {paginatedProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="flex justify-center"
                    >
                      <BookCard
                        title={product.productName || "Без назви"}
                        price={getProductPrice(product)}
                        image={getProductImage(product)}
                        rating={0}
                      />
                    </Link>
                  ))}
                </div>

                {/* Desktop Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-[20px] py-[40px]">
                    <button
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center justify-center w-[40px] h-[40px] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-xl"
                      aria-label="Попередня сторінка"
                    >
                      ←
                    </button>
                    <div className="flex items-center gap-[8px]">
                      {pageNumbers.map((pageNum, index) => (
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
                                ? "bg-[#242424] text-white"
                                : "bg-transparent text-[#242424] border border-[#e0e0e0] hover:bg-[#242424] hover:text-white"
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      ))}
                    </div>
                    <button
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center justify-center w-[40px] h-[40px] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-xl"
                      aria-label="Наступна сторінка"
                    >
                      →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-[100px] relative z-20 bg-white/60 rounded-3xl border border-gray-200">
                <h2 className="text-[24px] font-bold text-[#242424] mb-[16px]">
                  Товарів не знайдено
                </h2>
                <p className="text-[16px] text-gray-600 mb-6">
                  За вашим запитом або фільтром товарів не знайдено. Спробуйте скинути фільтри.
                </p>
                {Array.from(searchParams.entries()).length > 0 && (
                  <button
                    onClick={() => {
                      window.history.replaceState({}, "", "/products");
                    }}
                    className="px-6 py-2.5 rounded-full bg-[#005B33] text-white font-semibold text-[15px] shadow-sm hover:bg-[#004e2b] transition-colors"
                  >
                    Очистити всі фільтри
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
