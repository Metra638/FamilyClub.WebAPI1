"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CategoryDto } from "@/lib/api/generated";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocalizedPath, useTranslations } from "@/lib/i18n/LocaleProvider";

type Props = {
  categories: CategoryDto[];
  ebookSelected?: boolean;
  audioSelected?: boolean;
  onClose: () => void;
};

const ITEMS_PER_PAGE = 5;

export default function FilterDropdown({
  categories, ebookSelected, audioSelected, onClose,
}: Props) {
  const t = useTranslations();
  const lp = useLocalizedPath();
  const router = useRouter();
  const searchParams = useSearchParams();
  const visibleCategories = categories.slice(0, ITEMS_PER_PAGE);

  const currentIds = typeof window !== "undefined"
    ? (new URLSearchParams(window.location.search).get("categories") ?? "")
      .split(",").filter(Boolean).map(Number)
    : [];

  const handleCategoryToggle = (id: number) => {
    const params = new URLSearchParams(searchParams.toString());
    const updated = currentIds.includes(id)
      ? currentIds.filter((x) => x !== id)
      : [...currentIds, id];

    if (updated.length === 0) {
      params.delete("categories");
    } else {
      params.set("categories", updated.join(","));
    }
    router.push(`${lp("/userProfile")}?${params.toString()}`);
  };

  const updateParam = (key: string, active: boolean) => {
    const params = new URLSearchParams(window.location.search);
    if (active) {
      params.delete(key);
    } else {
      params.set(key, "true");
    }
    router.push(`${lp("/userProfile")}?${params.toString()}`);
  };

  return (
    <div
      className="
      absolute top-[25px] left-[25px]
      w-[680px]
      h-[440px]
      rounded-[0px_26px_26px_26px]
      bg-white
      p-6
      z-50
      shadow-[0px_0px_15px_0px_#24242433]
      animate-fadeIn
    "
    >

      {/* Жанри */}
      <div className="text-center mb-4">
        <Link href={lp("/products")} onClick={onClose} className="text-[22px] font-semibold text-[var(--color-black)]">
          {t("header.genres")}
        </Link>
      </div>

      {/* Категорії */}
      <div className="grid grid-cols-4 gap-x-2 gap-y-0">
        {visibleCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryToggle(category.id!)}
            className={`text-left rounded-full transition-all duration-200 border text-[15px] w-fit font-source-sans ${currentIds.includes(category.id!)
              ? "border-[#242424] text-[#242424] bg-[#F5F3EE]"
              : "border-transparent text-[#242424] hover:border-[#D9D4C7] hover:bg-[#F5F3EE]"
              }`}
            style={{ padding: "1px 2px" }}
          >
            {category.categoryName}
          </button>
        ))}
      </div>
      <div className="flex flex-col relative mt-[130px] w-full">
        <div className="flex flex-row items-center justify-around">
          {/* Рік публікації */}
          <YearSearch onClose={onClose} />

          {/* По алфавіту */}
          <AlphabetSort onClose={onClose} />
        </div>

        {/* Формати */}
        <div className="flex flex-row items-center justify-around mt-4">
          {[
            { label: t("profile.filter.ebookOnly"), key: "ebook", active: ebookSelected },
            { label: t("profile.filter.audioOnly"), key: "audio", active: audioSelected },
          ].map(({ label, key, active }) => (
            <div key={key} className="flex flex-row gap-4 items-center justify-center w-[48%]">
              <p className="font-semibold text-[19px]">{label}</p>
              <button
                type="button"
                onClick={() => updateParam(key, !!active)}
                className="relative w-[26px] h-[26px] flex items-center justify-center"
              >
                <Image src="/images/addProducts/icon.svg" alt="circle" width={26} height={26} className="object-contain" />
                {active && (
                  <Image src="/images/addProducts/check_24px.svg" alt="check" width={26} height={26} className="absolute ml-2 -mt-2" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── вкладені під-компоненти ──────────────────────────────

function YearSearch({ onClose }: { onClose: () => void }) {
  const t = useTranslations();
  const lp = useLocalizedPath();
  const router = useRouter();
  const [searchYear, setSearchYear] = useState("");

  const go = () => {
    if (!searchYear.trim()) return;
    router.push(`${lp("/userProfile")}?year=${encodeURIComponent(searchYear.trim())}`);
    onClose();
  };

  return (
    <div className="flex flex-col items-center w-[48%]">
      <p className="font-semibold text-[19px]">{t("header.publicationYear")}</p>
      <div className="flex items-center bg-[var(--color-white)] rounded-[10px] px-2 h-[40px] w-[280px] shadow-[0px_0px_10px_0px_#24242466] hover:shadow-[0px_0px_15px_0px_#242424CC] transition-all duration-300">
        <input
          type="number"
          value={searchYear}
          onChange={(e) => setSearchYear(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && go()}
          onClick={(e) => e.stopPropagation()}
          className="w-full h-full bg-transparent text-[18px] text-[#272727] outline-none px-2"
        />
        <button onClick={(e) => { e.stopPropagation(); go(); }} className="w-[22px] h-[22px] flex items-center justify-center flex-shrink-0">
          <Image src="/images/header/zoom_out_24px.png" alt="search" width={22} height={22} className="object-contain cursor-pointer" priority />
        </button>
      </div>
    </div>
  );
}

function AlphabetSort({ onClose }: { onClose: () => void }) {
  const t = useTranslations();
  const lp = useLocalizedPath();
  const router = useRouter();
  const [sortNameProduct, setSortNameProduct] = useState<"name-asc" | "name-desc" | null>(null);

  const handleSort = (dir: "name-asc" | "name-desc") => {
    setSortNameProduct(dir);
    setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      params.set("sort", dir);
      router.push(`${lp("/userProfile")}?${params.toString()}`);
      onClose();
    }, 800);
  };

  return (
    <div className="flex flex-col items-center w-[48%]">
      <p className="font-semibold text-[19px]">{t("profile.filter.alphabet")}</p>
      <div className="flex flex-row gap-4 justify-around w-[280px]">
        {(["name-asc", "name-desc"] as const).map((dir) => (
          <button
            key={dir}
            className={`text-left text-[22px] rounded-full transition-all duration-200 border-2 w-fit font-source-sans ${sortNameProduct === dir
              ? "border-[#242424] text-[#242424] bg-[#F5F3EE]"
              : "border-transparent text-[#242424] hover:border-[#D9D4C7] hover:bg-[#F5F3EE]"
              }`}
            style={{ padding: "3px 4px" }}
            onClick={() => handleSort(dir)}
          >
            {dir === "name-asc" ? t("profile.filter.az") : t("profile.filter.za")}
          </button>
        ))}
      </div>
    </div>
  );
}
