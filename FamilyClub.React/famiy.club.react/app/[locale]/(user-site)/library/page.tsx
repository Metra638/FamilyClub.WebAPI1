"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import UserSideBArProfile from "../userProfile/userSideBar/UserSideBarItems";
import { CategoryDto, ProductDto } from "@/lib/api/generated";
import { categoriesService, productService } from "@/lib/api/services";
import BookGrid from "../userProfile/bookGrid/BookGrid";
import BtnSection from "../userProfile/section/BtnSection";
import InfoUserSection from "../userProfile/section/InfoUserSection";
import { useCurrentUser } from "../userProfile/hooks/useCurrentUser";
import { useFavorites } from "@/lib/hooks/useFavorites";
import { useMyBooks } from "../userProfile/hooks/useMyBooks";
import MobileLibraryView from "./MobileLibraryView";
import { TabType } from "../userProfile/page";
import { useLocale, useTranslations } from "@/lib/i18n/LocaleProvider";

function LibraryContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as TabType | null;
  const yearParam = searchParams.get("year");
  const sortParam = searchParams.get("sort");
  const ebookParam = searchParams.get("ebook");
  const audioParam = searchParams.get("audio");
  const { locale } = useLocale();

  const { user } = useCurrentUser();
  const { favorites, loadingFavorites, toggleFavorite } = useFavorites(user?.id);
  const { myBooks, loadingMyBooks } = useMyBooks(user?.id);

  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [activeTab, setActiveTab] = useState<TabType | null>(tabParam || "myBooks");
  const [products, setProducts] = useState<ProductDto[]>([]);

  useEffect(() => {
    if (tabParam === "favorite" || tabParam === "myBooks" || tabParam === "myPosts") {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const categoriesParam = searchParams.get("categories");
  const selectedIds = categoriesParam
    ? categoriesParam.split(",").filter(Boolean).map(Number)
    : [];

  useEffect(() => {
    categoriesService
      .apiCategoriesGet()
      .then(setCategories)
      .catch(console.error);
    productService
      .apiProductsGet()
      .then(setProducts)
      .catch(console.error);
  }, []);

  const EBOOK_FORMAT_ID = 1;
  const AUDIO_FORMAT_ID = 2;

  const ebookSelected = ebookParam === "true";
  const audioSelected = audioParam === "true";

  let filteredBooks = yearParam
    ? products.filter((p) => {
        if (!p.publishingDate) return false;
        const year = new Date(p.publishingDate).getFullYear().toString();
        return year.includes(yearParam);
      })
    : [...products];

  if (ebookSelected || audioSelected) {
    filteredBooks = filteredBooks.filter((book) => {
      const formats = book.formatIds ?? [];
      if (ebookSelected && audioSelected) {
        return formats.includes(EBOOK_FORMAT_ID) || formats.includes(AUDIO_FORMAT_ID);
      }
      if (ebookSelected) return formats.includes(EBOOK_FORMAT_ID);
      if (audioSelected) return formats.includes(AUDIO_FORMAT_ID);
      return true;
    });
  }

  if (selectedIds.length > 0) {
    filteredBooks = filteredBooks.filter((book) =>
      book.categoryIds?.some((id) => selectedIds.includes(id))
    );
  }

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (sortParam === "name-asc")
      return (a.productName ?? "").localeCompare(b.productName ?? "", locale);
    if (sortParam === "name-desc")
      return (b.productName ?? "").localeCompare(a.productName ?? "", locale);
    return 0;
  });

  const hasFilters =
    Boolean(yearParam) ||
    Boolean(sortParam) ||
    ebookSelected ||
    audioSelected ||
    selectedIds.length > 0;

  const getBooksForTab = (): ProductDto[] => {
    if (activeTab === "favorite") {
      const favoriteIds = new Set(favorites.map((f) => f.id));
      const favoriteBooks = products.filter((p) => favoriteIds.has(p.id ?? -1));
      if (favoriteBooks.length > 0) return favoriteBooks;
      return hasFilters ? sortedBooks : [];
    }

    if (activeTab === "myBooks") {
      return myBooks.length > 0 ? myBooks : sortedBooks;
    }

    if (activeTab === "myPosts") {
      return [];
    }

    return hasFilters ? sortedBooks : myBooks;
  };

  return (
    <>
      {/* Mobile view exactly from Figma */}
      <div className="block md:hidden">
        <MobileLibraryView
          user={user}
          userId={user?.id}
          favorites={favorites}
          loadingFavorites={loadingFavorites}
          toggleFavorite={toggleFavorite}
          myBooks={myBooks}
          loadingMyBooks={loadingMyBooks}
        />
      </div>

      {/* Desktop view */}
      <div
        className="hidden md:block relative min-h-screen"
        style={{
          backgroundImage: "url('/images/userProfile/Rectangle 326.png')",
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
        }}
      >
        <div className="w-[calc(100%-700px)] h-[200px] items-center ml-[400px] mt-[160px] flex absolute">
          <InfoUserSection member={user} userId={user?.id} />
        </div>
        <div className="flex relative items-start gap-0">
          <UserSideBArProfile
            categories={categories}
            selectedIds={selectedIds}
            ebookSelected={ebookSelected}
            audioSelected={audioSelected}
            userId={user?.id}
          />
        </div>
        <div
          className="relative h-[200px] w-full top-[41vh]"
          style={{
            backgroundImage: "url('/images/userProfile/Rectangle 194.png')",
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
          }}
        >
          <div className="flex items-center ml-[328px]">
            <BtnSection activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>

        <div className="relative w-full -mb-2 gap-0 items-center" style={{ marginTop: "360px" }}>
          <BookGrid
            books={activeTab === "favorite" && loadingFavorites ? [] : getBooksForTab()}
            userId={user?.id}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
          />
        </div>
      </div>
    </>
  );
}

function LibraryLoadingFallback() {
  const t = useTranslations();
  return (
    <div className="min-h-screen bg-[#f5f3ee] flex items-center justify-center">
      {t("common.loading")}
    </div>
  );
}

export default function LibraryPage() {
  return (
    <Suspense fallback={<LibraryLoadingFallback />}>
      <LibraryContent />
    </Suspense>
  );
}
