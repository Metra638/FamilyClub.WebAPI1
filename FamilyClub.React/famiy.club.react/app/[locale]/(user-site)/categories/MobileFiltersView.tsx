"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  categoriesService,
  authorService,
  languageService,
  formatService,
  ageRestrictionService,
} from "@/lib/api/services";
import {
  CategoryDto,
  AuthorDTO,
  LanguageDto,
  FormatDto,
  AgeRestrictionDto,
} from "@/lib/api/generated";
import { useLocalizedPath, useTranslations } from "@/lib/i18n/LocaleProvider";

const FALLBACK_CATEGORY_KEYS = [
  "romance",
  "thriller",
  "detective",
  "biography",
  "poetry",
  "children",
  "contemporary",
  "education",
  "fantasy",
  "scienceFiction",
  "youngAdult",
  "comics",
  "psychology",
  "adventure",
  "historical",
];

const FALLBACK_AUTHORS: AuthorDTO[] = [
  { id: 1, authorName: "С. Кінг" },
  { id: 2, authorName: "Д. Роулінг" },
  { id: 3, authorName: "Д. Орвелл" },
  { id: 4, authorName: "А. Крісті" },
];

const FALLBACK_LANGUAGES: LanguageDto[] = [
  { id: 1, languageName: "UA" },
  { id: 2, languageName: "EN" },
  { id: 3, languageName: "PL" },
  { id: 4, languageName: "DE" },
];

const FALLBACK_AGE_RESTRICTIONS: AgeRestrictionDto[] = [
  { id: 1, name: "0" },
  { id: 2, name: "6+" },
  { id: 3, name: "12+" },
  { id: 4, name: "16+" },
  { id: 5, name: "18+" },
];

const YEAR_RANGES = [
  { id: "before2000", labelKey: "header.before2000", from: 0, to: 1999 },
  { id: "2000_2010", labelKey: "header.year2000_2010", from: 2000, to: 2010 },
  { id: "2010_2020", labelKey: "header.year2010_2020", from: 2010, to: 2020 },
  { id: "from2020", labelKey: "header.from2020", from: 2020, to: 3000 },
];

type SectionId =
  | "genres"
  | "authors"
  | "language"
  | "format"
  | "price"
  | "year"
  | "rating"
  | null;

export default function MobileFiltersView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const lp = useLocalizedPath();

  // Active expanded accordion section
  const [activeSection, setActiveSection] = useState<SectionId>(null);

  // Loaded API options
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [authors, setAuthors] = useState<AuthorDTO[]>([]);
  const [languages, setLanguages] = useState<LanguageDto[]>([]);
  const [formats, setFormats] = useState<FormatDto[]>([]);
  const [ageRestrictions, setAgeRestrictions] = useState<AgeRestrictionDto[]>([]);

  // Search inside authors list
  const [authorSearch, setAuthorSearch] = useState("");

  // Selected filter states
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [selectedAuthorIds, setSelectedAuthorIds] = useState<number[]>([]);
  const [selectedLanguageIds, setSelectedLanguageIds] = useState<number[]>([]);
  const [selectedFormatIds, setSelectedFormatIds] = useState<number[]>([]);
  const [selectedAgeRestrictionIds, setSelectedAgeRestrictionIds] = useState<number[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [promo, setPromo] = useState(false);
  const [selectedYearRange, setSelectedYearRange] = useState<string | null>(null);
  const [customYear, setCustomYear] = useState("");

  // Load options from API
  useEffect(() => {
    categoriesService.apiCategoriesGet().then(setCategories).catch(console.error);
    authorService.apiAuthorsGet().then(setAuthors).catch(console.error);
    languageService.apiLanguagesGet().then(setLanguages).catch(console.error);
    formatService.apiFormatsGet().then(setFormats).catch(console.error);
    ageRestrictionService.apiAgeRestrictionsGet().then(setAgeRestrictions).catch(console.error);
  }, []);

  // Initialize selected filters from URL query string
  useEffect(() => {
    if (!searchParams) return;

    const parseIds = (key: string) =>
      searchParams
        .getAll(key)
        .flatMap((v) => v.split(","))
        .map((id) => parseInt(id))
        .filter((id) => !isNaN(id));

    // URL parameters are the external source of truth for this filter drawer.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedCategoryIds(parseIds("categoryId"));
    setSelectedAuthorIds(parseIds("authorId"));
    setSelectedLanguageIds(parseIds("languageId"));
    setSelectedFormatIds(parseIds("formatId"));
    setSelectedAgeRestrictionIds(parseIds("ageRestrictionId"));

    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
    setPromo(searchParams.get("promo") === "true");

    const yearFrom = searchParams.get("yearFrom");
    const yearTo = searchParams.get("yearTo");
    const yearSingle = searchParams.get("year");

    if (yearSingle) {
      setCustomYear(yearSingle);
      setSelectedYearRange(null);
    } else if (yearFrom && yearTo) {
      const match = YEAR_RANGES.find(
        (r) => r.from === parseInt(yearFrom) && r.to === parseInt(yearTo)
      );
      if (match) {
        setSelectedYearRange(match.id);
        setCustomYear("");
      } else {
        setCustomYear(yearFrom);
      }
    } else {
      setSelectedYearRange(null);
      setCustomYear("");
    }
  }, [searchParams]);

  // Toggle selection helpers
  const toggleId = (id: number, currentList: number[], setList: (list: number[]) => void) => {
    if (currentList.includes(id)) {
      setList(currentList.filter((item) => item !== id));
    } else {
      setList([...currentList, id]);
    }
  };

  const toggleSection = (section: SectionId) => {
    setActiveSection((prev) => (prev === section ? null : section));
  };

  // Apply button
  const applyAllFilters = () => {
    const params = new URLSearchParams();

    selectedCategoryIds.forEach((id) => params.append("categoryId", String(id)));
    selectedAuthorIds.forEach((id) => params.append("authorId", String(id)));
    selectedLanguageIds.forEach((id) => params.append("languageId", String(id)));
    selectedFormatIds.forEach((id) => params.append("formatId", String(id)));
    selectedAgeRestrictionIds.forEach((id) => params.append("ageRestrictionId", String(id)));

    if (minPrice.trim()) params.set("minPrice", minPrice.trim());
    if (maxPrice.trim()) params.set("maxPrice", maxPrice.trim());
    if (promo) params.set("promo", "true");

    if (selectedYearRange) {
      const range = YEAR_RANGES.find((r) => r.id === selectedYearRange);
      if (range) {
        params.set("yearFrom", String(range.from));
        params.set("yearTo", String(range.to));
      }
    } else if (customYear.trim()) {
      params.set("year", customYear.trim());
    }

    router.push(`${lp("/products")}?${params.toString()}`);
  };

  const resetAllFilters = () => {
    setSelectedCategoryIds([]);
    setSelectedAuthorIds([]);
    setSelectedLanguageIds([]);
    setSelectedFormatIds([]);
    setSelectedAgeRestrictionIds([]);
    setMinPrice("");
    setMaxPrice("");
    setPromo(false);
    setSelectedYearRange(null);
    setCustomYear("");
    router.push(lp("/products"));
  };

  const fallbackCategories: CategoryDto[] = FALLBACK_CATEGORY_KEYS.map((key, index) => ({
    id: index + 1,
    categoryName: t(`catalog.mobileFilters.categories.${key}`),
  }));
  const fallbackFormats: FormatDto[] = [
    { id: 1, name: t("product.formats.paper") },
    { id: 2, name: t("product.formats.ebook") },
    { id: 3, name: t("product.formats.audio") },
  ];
  const displayedCategories = categories.length > 0 ? categories : fallbackCategories;
  const displayedAuthors = (authors.length > 0 ? authors : FALLBACK_AUTHORS).filter((a) =>
    a.authorName?.toLowerCase().includes(authorSearch.toLowerCase())
  );
  const displayedLanguages = languages.length > 0 ? languages : FALLBACK_LANGUAGES;
  const displayedFormats = formats.length > 0 ? formats : fallbackFormats;
  const displayedAgeRestrictions = ageRestrictions.length > 0 ? ageRestrictions : FALLBACK_AGE_RESTRICTIONS;

  const clipPathRibbon = "polygon(0% 0%, 100% 0%, 100% calc(100% - 18px), 50% 100%, 0% calc(100% - 18px))";
  const clipPathCheckBadge = "polygon(0% 0%, 100% 0%, 100% calc(100% - 15px), 50% 100%, 0% calc(100% - 15px))";

  return (
    <div className="w-full min-h-screen bg-[#c7a381] pt-[65px] pb-[100px] relative select-none font-sans text-white overflow-x-hidden">
      {/* Wooden Shelves Horizontal Gradients Background */}
      <div className="absolute inset-0 pointer-events-none z-0 flex flex-col">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="w-full h-[140px] border-b border-[#7a5530]/40 shadow-[0_6px_12px_rgba(0,0,0,0.18)] flex-shrink-0"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(170, 140, 112, 0) 65%, rgba(74, 53, 33, 0.45) 100%), linear-gradient(90deg, rgb(199, 163, 129) 0%, rgb(199, 163, 129) 100%)",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-[500px] mx-auto px-2 sm:px-4 pt-2">
        {/* TOP BANNER: ЖАНРИ (Full width) */}
        <div className="w-full mb-3">
          <div
            onClick={() => toggleSection("genres")}
            className={`w-full bg-[#035b3c] transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.3)] relative cursor-pointer overflow-hidden ${
              activeSection === "genres" ? "pt-4 pb-7 min-h-[360px]" : "h-[110px] flex items-center justify-center pb-3"
            }`}
            style={{ clipPath: clipPathRibbon }}
          >
            {activeSection !== "genres" ? (
              <div className="w-full h-full flex items-center justify-center pb-2">
                <span className="font-mono font-medium text-[#f5f3ee] text-[30px] sm:text-[32px] tracking-[-0.35px]">
                  {t("header.genres")}
                </span>
              </div>
            ) : (
              <div className="w-full flex flex-col justify-between min-h-[340px]" onClick={(e) => e.stopPropagation()}>
                <div className="px-3 sm:px-4 pt-1 pb-4">
                  {/* All Genres option */}
                  <div className="flex items-center gap-2 mb-3 border-b border-white/15 pb-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCategoryIds([])}
                      className="flex items-center gap-2.5 text-left py-1"
                    >
                      <div className="w-[24px] h-[24px] flex items-center justify-center shrink-0">
                        <img
                          src={selectedCategoryIds.length === 0 ? "/images/header/check2.svg" : "/images/header/icon.svg"}
                          alt=""
                          className="w-[22px] h-[22px] object-contain"
                        />
                      </div>
                      <span className="font-sans font-semibold text-[18px] text-[#f5f3ee]">
                        {t("header.allGenres")}
                      </span>
                    </button>
                  </div>

                  {/* 2 columns grid of genres */}
                  <div className="grid grid-cols-2 gap-x-2 sm:gap-x-4 gap-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                    {displayedCategories.map((c) => {
                      const isSelected = c.id !== undefined && selectedCategoryIds.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => c.id !== undefined && toggleId(c.id, selectedCategoryIds, setSelectedCategoryIds)}
                          className="flex items-center gap-2 text-left py-1 hover:bg-white/10 rounded px-1 transition-colors"
                        >
                          <div className="w-[22px] h-[22px] flex items-center justify-center shrink-0">
                            <img
                              src={isSelected ? "/images/header/check2.svg" : "/images/header/icon.svg"}
                              alt=""
                              className="w-[20px] h-[20px] object-contain"
                            />
                          </div>
                          <span className="font-sans font-normal text-[16px] sm:text-[18px] text-[#f5f3ee] leading-tight truncate">
                            {c.categoryName}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom title inside expanded banner */}
                <div
                  onClick={() => setActiveSection(null)}
                  className="w-full flex justify-center items-center pt-3 pb-4 border-t border-white/10 cursor-pointer hover:bg-black/10 transition-colors"
                >
                  <span className="font-mono font-medium text-[#f5f3ee] text-[28px] sm:text-[32px] tracking-[-0.35px]">
                    {t("header.genres")}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2 COLUMNS GRID FOR THE REMAINING 6 BANNERS */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 items-start">
          {/* LEFT COLUMN: Автори, Формат, Рік видання */}
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* 1. АВТОРИ */}
            <div
              onClick={() => toggleSection("authors")}
              className={`w-full bg-[#035b3c] transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.3)] relative cursor-pointer overflow-hidden ${
                activeSection === "authors" ? "pt-3 pb-6 min-h-[360px]" : "h-[115px] flex items-center justify-center pb-3"
              }`}
              style={{ clipPath: clipPathRibbon }}
            >
              {activeSection !== "authors" ? (
                <div className="w-full h-full flex items-center justify-center pb-2">
                  <span className="font-mono font-medium text-[#f5f3ee] text-[26px] sm:text-[30px] tracking-[-0.35px]">
                    {t("header.authors")}
                  </span>
                </div>
              ) : (
                <div className="w-full flex flex-col justify-between min-h-[340px]" onClick={(e) => e.stopPropagation()}>
                  <div className="px-2 sm:px-3 pt-1 pb-4">
                    {/* Search inside authors */}
                    <div className="relative flex items-center bg-[#f5f3ee] rounded-full px-2.5 py-1 mb-3 shadow">
                      <input
                        type="text"
                        placeholder={t("catalog.mobileFilters.authorSearch")}
                        value={authorSearch}
                        onChange={(e) => setAuthorSearch(e.target.value)}
                        className="w-full bg-transparent text-[#242424] text-[14px] font-sans placeholder:text-[#242424]/50 focus:outline-none"
                      />
                      <img src="/images/header/zoom_out_24px.svg" alt={t("common.search")} className="w-[18px] h-[18px] shrink-0 opacity-70 ml-1" />
                    </div>

                    <div className="flex flex-col gap-2 max-h-[230px] overflow-y-auto pr-1">
                      {displayedAuthors.map((a) => {
                        const isSelected = a.id !== undefined && selectedAuthorIds.includes(a.id);
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => a.id !== undefined && toggleId(a.id, selectedAuthorIds, setSelectedAuthorIds)}
                            className="flex items-center gap-2 text-left py-1 px-1 hover:bg-white/10 rounded transition-colors"
                          >
                            <div className="w-[20px] h-[20px] flex items-center justify-center shrink-0">
                              <img
                                src={isSelected ? "/images/header/check2.svg" : "/images/header/icon.svg"}
                                alt=""
                                className="w-[18px] h-[18px] object-contain"
                              />
                            </div>
                            <span className="font-sans font-normal text-[16px] sm:text-[18px] text-[#f5f3ee] leading-tight truncate">
                              {a.authorName}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveSection(null)}
                    className="w-full flex justify-center items-center pt-2 pb-4 border-t border-white/10 cursor-pointer hover:bg-black/10 transition-colors"
                  >
                    <span className="font-mono font-medium text-[#f5f3ee] text-[26px] sm:text-[30px] tracking-[-0.35px]">
                      {t("header.authors")}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. ФОРМАТ */}
            <div
              onClick={() => toggleSection("format")}
              className={`w-full bg-[#035b3c] transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.3)] relative cursor-pointer overflow-hidden ${
                activeSection === "format" ? "pt-4 pb-6 min-h-[300px]" : "h-[128px] flex items-center justify-center pb-3"
              }`}
              style={{ clipPath: clipPathRibbon }}
            >
              {activeSection !== "format" ? (
                <div className="w-full h-full flex items-center justify-center pb-2">
                  <span className="font-mono font-medium text-[#f5f3ee] text-[26px] sm:text-[30px] tracking-[-0.35px]">
                    {t("header.formats")}
                  </span>
                </div>
              ) : (
                <div className="w-full flex flex-col justify-between min-h-[280px]" onClick={(e) => e.stopPropagation()}>
                  <div className="px-3 sm:px-4 pt-2 pb-4 flex flex-col gap-3">
                    {displayedFormats.map((f) => {
                      const isSelected = f.id !== undefined && selectedFormatIds.includes(f.id);
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => f.id !== undefined && toggleId(f.id, selectedFormatIds, setSelectedFormatIds)}
                          className="flex items-center gap-2.5 text-left py-1 hover:bg-white/10 rounded px-1 transition-colors"
                        >
                          <div className="w-[22px] h-[22px] flex items-center justify-center shrink-0">
                            <img
                              src={isSelected ? "/images/header/check2.svg" : "/images/header/icon.svg"}
                              alt=""
                              className="w-[20px] h-[20px] object-contain"
                            />
                          </div>
                          <span className="font-sans font-semibold text-[17px] sm:text-[19px] text-[#f5f3ee] leading-tight">
                            {f.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div
                    onClick={() => setActiveSection(null)}
                    className="w-full flex justify-center items-center pt-2 pb-4 border-t border-white/10 cursor-pointer hover:bg-black/10 transition-colors"
                  >
                    <span className="font-mono font-medium text-[#f5f3ee] text-[26px] sm:text-[30px] tracking-[-0.35px]">
                      {t("header.formats")}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 3. РІК ВИДАННЯ */}
            <div
              onClick={() => toggleSection("year")}
              className={`w-full bg-[#035b3c] transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.3)] relative cursor-pointer overflow-hidden ${
                activeSection === "year" ? "pt-4 pb-6 min-h-[380px]" : "h-[165px] flex items-center justify-center pb-3"
              }`}
              style={{ clipPath: clipPathRibbon }}
            >
              {activeSection !== "year" ? (
                <div className="w-full h-full flex items-center justify-center pb-2">
                  <span className="font-mono font-medium text-[#f5f3ee] text-[24px] sm:text-[28px] tracking-[-0.35px] text-center px-1">
                    {t("header.publicationYear")}
                  </span>
                </div>
              ) : (
                <div className="w-full flex flex-col justify-between min-h-[360px]" onClick={(e) => e.stopPropagation()}>
                  <div className="px-3 sm:px-4 pt-1 pb-4 flex flex-col gap-2.5">
                    {YEAR_RANGES.map((r) => {
                      const isSelected = selectedYearRange === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => {
                            setSelectedYearRange(isSelected ? null : r.id);
                            if (!isSelected) setCustomYear("");
                          }}
                          className="flex items-center gap-2.5 text-left py-1 hover:bg-white/10 rounded px-1 transition-colors"
                        >
                          <div className="w-[22px] h-[22px] flex items-center justify-center shrink-0">
                            <img
                              src={isSelected ? "/images/header/check2.svg" : "/images/header/icon.svg"}
                              alt=""
                              className="w-[20px] h-[20px] object-contain"
                            />
                          </div>
                          <span className="font-sans font-semibold text-[16px] sm:text-[18px] text-[#f5f3ee] leading-tight">
                            {t(r.labelKey)}
                          </span>
                        </button>
                      );
                    })}

                    <div className="mt-3 pt-2 border-t border-white/15">
                      <span className="font-sans text-xs text-[#f5f3ee]/80 block mb-1.5 text-center">{t("catalog.mobileFilters.exactYear")}</span>
                      <input
                        type="number"
                        placeholder="-"
                        value={customYear}
                        onChange={(e) => {
                          setCustomYear(e.target.value);
                          setSelectedYearRange(null);
                        }}
                        className="bg-[#f5f3ee] rounded-full h-[36px] w-[110px] sm:w-[130px] text-center text-[#242424] text-[15px] font-sans focus:outline-none placeholder:text-[#242424]/50 shadow mx-auto block"
                      />
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveSection(null)}
                    className="w-full flex justify-center items-center pt-2 pb-4 border-t border-white/10 cursor-pointer hover:bg-black/10 transition-colors"
                  >
                    <span className="font-mono font-medium text-[#f5f3ee] text-[24px] sm:text-[28px] tracking-[-0.35px]">
                      {t("header.publicationYear")}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Мова, Ціна, Рейтинг */}
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* 1. МОВА */}
            <div
              onClick={() => toggleSection("language")}
              className={`w-full bg-[#035b3c] transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.3)] relative cursor-pointer overflow-hidden ${
                activeSection === "language" ? "pt-4 pb-6 min-h-[300px]" : "h-[115px] flex items-center justify-center pb-3"
              }`}
              style={{ clipPath: clipPathRibbon }}
            >
              {activeSection !== "language" ? (
                <div className="w-full h-full flex items-center justify-center pb-2">
                  <span className="font-mono font-medium text-[#f5f3ee] text-[26px] sm:text-[30px] tracking-[-0.35px]">
                    {t("header.languages")}
                  </span>
                </div>
              ) : (
                <div className="w-full flex flex-col justify-between min-h-[280px]" onClick={(e) => e.stopPropagation()}>
                  <div className="px-3 sm:px-4 pt-2 pb-4 flex flex-col gap-3">
                    {displayedLanguages.map((l) => {
                      const isSelected = l.id !== undefined && selectedLanguageIds.includes(l.id);
                      return (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() => l.id !== undefined && toggleId(l.id, selectedLanguageIds, setSelectedLanguageIds)}
                          className="flex items-center gap-2.5 text-left py-1 hover:bg-white/10 rounded px-1 transition-colors"
                        >
                          <div className="w-[22px] h-[22px] flex items-center justify-center shrink-0">
                            <img
                              src={isSelected ? "/images/header/check2.svg" : "/images/header/icon.svg"}
                              alt=""
                              className="w-[20px] h-[20px] object-contain"
                            />
                          </div>
                          <span className="font-sans font-semibold text-[18px] sm:text-[20px] text-[#f5f3ee] leading-tight uppercase">
                            {l.languageName}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div
                    onClick={() => setActiveSection(null)}
                    className="w-full flex justify-center items-center pt-2 pb-4 border-t border-white/10 cursor-pointer hover:bg-black/10 transition-colors"
                  >
                    <span className="font-mono font-medium text-[#f5f3ee] text-[26px] sm:text-[30px] tracking-[-0.35px]">
                      {t("header.languages")}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. ЦІНА */}
            <div
              onClick={() => toggleSection("price")}
              className={`w-full bg-[#035b3c] transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.3)] relative cursor-pointer overflow-hidden ${
                activeSection === "price" ? "pt-4 pb-6 min-h-[340px]" : "h-[120px] flex items-center justify-center pb-3"
              }`}
              style={{ clipPath: clipPathRibbon }}
            >
              {activeSection !== "price" ? (
                <div className="w-full h-full flex items-center justify-center pb-2">
                  <span className="font-mono font-medium text-[#f5f3ee] text-[26px] sm:text-[30px] tracking-[-0.35px]">
                    {t("header.price")}
                  </span>
                </div>
              ) : (
                <div className="w-full flex flex-col justify-between min-h-[320px]" onClick={(e) => e.stopPropagation()}>
                  <div className="px-3 sm:px-4 pt-1 pb-4 flex flex-col gap-3">
                    <div>
                      <span className="font-sans font-semibold text-[15px] text-white block mb-1">{t("catalog.mobileFilters.from")}</span>
                      <input
                        type="number"
                        placeholder="-"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="bg-[#f5f3ee] rounded-full h-[36px] w-full text-center text-[#242424] font-sans focus:outline-none placeholder:text-[#242424]/50 shadow text-sm"
                      />
                    </div>

                    <div>
                      <span className="font-sans font-semibold text-[15px] text-white block mb-1">{t("catalog.mobileFilters.to")}</span>
                      <input
                        type="number"
                        placeholder="-"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="bg-[#f5f3ee] rounded-full h-[36px] w-full text-center text-[#242424] font-sans focus:outline-none placeholder:text-[#242424]/50 shadow text-sm"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setPromo(!promo)}
                      className="flex items-center gap-2.5 mt-2 pt-2 border-t border-white/15 w-full"
                    >
                      <div className="w-[22px] h-[22px] flex items-center justify-center shrink-0">
                        <img
                          src={promo ? "/images/header/check2.svg" : "/images/header/icon.svg"}
                          alt=""
                          className="w-[20px] h-[20px] object-contain"
                        />
                      </div>
                      <span className="font-sans font-semibold text-[17px] text-[#f5f3ee]">
                        {t("header.promos")}
                      </span>
                    </button>
                  </div>

                  <div
                    onClick={() => setActiveSection(null)}
                    className="w-full flex justify-center items-center pt-2 pb-4 border-t border-white/10 cursor-pointer hover:bg-black/10 transition-colors"
                  >
                    <span className="font-mono font-medium text-[#f5f3ee] text-[26px] sm:text-[30px] tracking-[-0.35px]">
                      {t("header.price")}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 3. РЕЙТИНГ */}
            <div
              onClick={() => toggleSection("rating")}
              className={`w-full bg-[#035b3c] transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.3)] relative cursor-pointer overflow-hidden ${
                activeSection === "rating" ? "pt-4 pb-6 min-h-[340px]" : "h-[135px] flex items-center justify-center pb-3"
              }`}
              style={{ clipPath: clipPathRibbon }}
            >
              {activeSection !== "rating" ? (
                <div className="w-full h-full flex items-center justify-center pb-2">
                  <span className="font-mono font-medium text-[#f5f3ee] text-[26px] sm:text-[30px] tracking-[-0.35px]">
                    {t("catalog.mobileFilters.rating")}
                  </span>
                </div>
              ) : (
                <div className="w-full flex flex-col justify-between min-h-[320px]" onClick={(e) => e.stopPropagation()}>
                  <div className="px-3 sm:px-4 pt-2 pb-4 flex flex-col gap-2.5">
                    {displayedAgeRestrictions.map((r) => {
                      const isSelected = r.id !== undefined && selectedAgeRestrictionIds.includes(r.id);
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => r.id !== undefined && toggleId(r.id, selectedAgeRestrictionIds, setSelectedAgeRestrictionIds)}
                          className="flex items-center gap-2.5 text-left py-1 hover:bg-white/10 rounded px-1 transition-colors"
                        >
                          <div className="w-[22px] h-[22px] flex items-center justify-center shrink-0">
                            <img
                              src={isSelected ? "/images/header/check2.svg" : "/images/header/icon.svg"}
                              alt=""
                              className="w-[20px] h-[20px] object-contain"
                            />
                          </div>
                          <span className="font-sans font-semibold text-[18px] sm:text-[20px] text-[#f5f3ee] leading-tight">
                            {r.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div
                    onClick={() => setActiveSection(null)}
                    className="w-full flex justify-center items-center pt-2 pb-4 border-t border-white/10 cursor-pointer hover:bg-black/10 transition-colors"
                  >
                    <span className="font-mono font-medium text-[#f5f3ee] text-[26px] sm:text-[30px] tracking-[-0.35px]">
                      {t("catalog.mobileFilters.rating")}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FLOATING APPLY BADGE BUTTON (Figma Group 818/Default) */}
        <div className="fixed bottom-[85px] right-[16px] sm:right-[24px] z-40 flex flex-col items-center">
          <button
            type="button"
            onClick={applyAllFilters}
            aria-label={t("catalog.mobileFilters.applyAria")}
            className="w-[85px] sm:w-[95px] h-[115px] sm:h-[125px] bg-[#035b3c] hover:bg-[#024a31] active:scale-95 transition-all duration-200 shadow-[0_6px_16px_rgba(0,0,0,0.35)] flex flex-col items-center justify-center pb-4 rounded-t-[10px] border-t border-white/15"
            style={{ clipPath: clipPathCheckBadge }}
          >
            <div className="w-[48px] h-[48px] sm:w-[54px] sm:h-[54px] rounded-full bg-[#367258] hover:bg-[#2e634c] flex items-center justify-center shadow-inner border border-white/20 transition-transform">
              <img
                src="/images/header/check_24px.svg"
                alt=""
                className="w-[26px] h-[26px] sm:w-[28px] sm:h-[28px] brightness-0 invert object-contain"
              />
            </div>
          </button>

          {(selectedCategoryIds.length > 0 ||
            selectedAuthorIds.length > 0 ||
            selectedLanguageIds.length > 0 ||
            selectedFormatIds.length > 0 ||
            selectedAgeRestrictionIds.length > 0 ||
            minPrice ||
            maxPrice ||
            promo ||
            selectedYearRange ||
            customYear) && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="mt-2 px-3 py-1 bg-black/70 backdrop-blur text-xs rounded-full text-[#f5f3ee] hover:bg-black/90 transition-colors shadow border border-white/10"
            >
              {t("catalog.clearAllFilters")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
