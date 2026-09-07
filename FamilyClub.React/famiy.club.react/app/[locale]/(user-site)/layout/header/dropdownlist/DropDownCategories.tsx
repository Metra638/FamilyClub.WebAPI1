"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { type CategoryDto } from "@/lib/api/generated";
import { categoriesService } from "@/lib/api/services";
import Link from "next/link";
import { useLocalizedPath, useTranslations } from "@/lib/i18n/LocaleProvider";

const ITEMS_PER_PAGE = 5;

export default function DropDownCategories() {
  const t = useTranslations();
  const lp = useLocalizedPath();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const visibleCategories = categories.slice(0, ITEMS_PER_PAGE);

  useEffect(() => {
    categoriesService.apiCategoriesGet().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="flex relative w-[100px] z-10">
      <div
        className={`
        relative w-[100px] h-[360px]
        transition-transform duration-300
        ${open ? "translate-y-0" : "-translate-y-[218px]"}
      `}
      >
        <Image
          src="/images/header/Rectangle 144.svg"
          alt="bg"
          fill
          className="object-contain"
        />

        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          className="absolute pointer-events-auto inset-0 flex justify-center items-end mb-[70px] z-10 focus:outline-none"
        >
          <span className="text-[var(--color-white)]">{t("header.genres")}</span>
        </button>

        {open && (
          <div className="absolute pointer-events-auto z-20 top-[38px] w-full flex flex-col items-center text-[var(--color-white)]">
            {/* RIGHT PANEL */}
            <div
              className="
        relative mt-[72px] ml-[146px]
        w-[210px]
        h-[150px]
        rounded-[12px]
        bg-[var(--color-green)]
        p-2 z-50
        pointer-events-auto
      "
            >
              {/* GRID 2 COLUMNS */}
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 w-full">
                {/* ALL ITEM */}
                <div className="flex items-center gap-1">
                  <div className="w-[18px] h-[18px] flex justify-center shrink-0">
                    <button
                      onClick={() => setSelectedCategoryId(null)}
                      className="w-[18px] h-[18px] flex items-center justify-center"
                    >
                      <Image
                        src={
                          selectedCategoryId === null
                            ? "/images/header/check2.svg"
                            : "/images/header/icon.svg"
                        }
                        alt=""
                        width={16}
                        height={16}
                        className={`
                  object-contain
                  transition-transform duration-200
                  ${selectedCategoryId === null ? "ml-[6px] scale-125" : "scale-90"}
                `}
                      />
                    </button>
                  </div>

                  <Link
                    href={lp("/products")}
                    onClick={() => {
                      setSelectedCategoryId(null);
                      setOpen(false);
                    }}
                    className="text-[11px] mt-2"
                  >
                    {t("header.allGenres")}
                  </Link>
                </div>

                {/* CATEGORIES */}
                {visibleCategories.map((c) => {
                  const isSelected = selectedCategoryId === c.id;

                  return (
                    <div key={c.id} className="flex items-center gap-0">
                      <div className="w-[18px] h-[18px] flex  justify-center shrink-0">
                        <button
                          onClick={() => setSelectedCategoryId(c.id!)}
                          className=" w-[18px] h-[18px] flex items-center justify-center"
                        >
                          <Image
                            src={
                              isSelected
                                ? "/images/header/check2.svg"
                                : "/images/header/icon.svg"
                            }
                            alt=""
                            width={16}
                            height={16}
                            className={`
                      object-contain
                      transition-transform duration-200
                      ${isSelected ? "ml-[6px] scale-125" : "scale-90"}
                    `}
                          />
                        </button>
                      </div>

                      <Link
                        href={lp(`/products?categoryId=${c.id}`)}
                        onClick={() => {
                          setSelectedCategoryId(c.id!);
                          setOpen(false);
                        }}
                        className="text-[11px] p-1"
                      >
                        {c.categoryName}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
