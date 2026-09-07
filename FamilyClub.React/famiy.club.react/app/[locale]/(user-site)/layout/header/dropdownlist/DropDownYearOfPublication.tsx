"use client";

import Image from "next/image";
import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLocalizedPath, useTranslations } from "@/lib/i18n/LocaleProvider";

type YearFilterId = "before2000" | "year2000_2010" | "year2010_2020" | "from2020";

const yearRanges: { id: YearFilterId; from: number; to: number }[] = [
  { id: "before2000", from: 0, to: 1999 },
  { id: "year2000_2010", from: 2000, to: 2010 },
  { id: "year2010_2020", from: 2010, to: 2020 },
  { id: "from2020", from: 2020, to: 3000 },
];

export default function DropDownYearOfPublication() {
  const t = useTranslations();
  const lp = useLocalizedPath();
  const [open, setOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<YearFilterId | null>(null);
  const [search, setSearch] = useState<string>("");

  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const yearFilters = useMemo(
    () =>
      yearRanges.map((range) => ({
        ...range,
        label: t(`header.${range.id}`),
      })),
    [t],
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    }

    document.addEventListener("click", handleClickOutside);

    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  function selectYear(f: (typeof yearFilters)[number]) {
    setSelectedYear(f.id);

    setTimeout(() => {
      const params = new URLSearchParams();

      params.set("yearFrom", String(f.from));
      params.set("yearTo", String(f.to));

      router.push(lp(`/products?${params.toString()}`));

      setOpen(false);
    }, 450);
  }

  const displayedYears =
    search.trim() === ""
      ? yearFilters
      : yearFilters.filter((y) => {
          const searchYear = Number(search);

          if (isNaN(searchYear)) {
            return y.label.toLowerCase().includes(search.toLowerCase());
          }

          return searchYear >= y.from && searchYear <= y.to;
        });
  return (
    <div ref={containerRef} className="relative w-[120px]">
      <div
        className={`
          relative w-[120px] h-[360px]
          transition-transform duration-300
          ${open ? "translate-y-0" : "-translate-y-[242px]"}
        `}
      >
        {/* BACKGROUND */}
        <Image
          src="/images/header/Rectangle 144.svg"
          alt="bg"
          fill
          className="object-contain pointer-events-none"
        />

        {/* BUTTON */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          className="absolute pointer-events-auto inset-0 flex justify-center items-end mb-[46px] z-10"
        >
          <span className="text-white">{t("header.publicationYear")}</span>
        </button>

        {/* DROPDOWN */}
        {open && (
          <div className="absolute ml-2 pointer-events-auto z-20 top-[42px] w-full flex flex-col items-start text-[var(--color-white)]">
            {/* SEARCH */}
            <div className="relative mt-[40px] ml-2 w-[90px] h-[40px]">
              <Image
                src="/images/header/Rectangle 58.svg"
                alt="search bg"
                fill
                className="object-cover"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                aria-label={t("header.yearSearchAria")}
                className="
                  absolute inset-0
                  w-full h-full
                  bg-transparent
                  outline-none
                  text-[#272727]
                  text-xs
                  px-4 pr-7
                "
              />

              <div className="absolute right-2 top-1/2 -translate-y-1/2 px-2">
                <Image
                  src="/images/header/zoom_out_24px.svg"
                  alt="search"
                  width={14}
                  height={14}
                />
              </div>
            </div>

            {/* YEARS */}
            <div className="relative mt-[16px] ml-[6px] w-[160px] flex flex-col gap-2">
              {displayedYears.length === 0 ? (
                <div className="text-[13px] ml-4">{t("header.notFound")}</div>
              ) : (
                displayedYears.map((y) => {
                  const isSelected = selectedYear === y.id;

                  return (
                    <div key={y.id} className="flex items-center gap-1">
                      {/* RADIO */}
                      <div className="w-[28px] h-[28px] flex justify-center shrink-0">
                        <button
                          onClick={() => selectYear(y)}
                          className="w-[20px] h-[20px] flex items-center justify-center"
                        >
                          <Image
                            src={
                              isSelected
                                ? "/images/header/check2.svg"
                                : "/images/header/icon.svg"
                            }
                            alt=""
                            width={18}
                            height={18}
                            className={`
                              object-contain
                              transition-transform duration-200
                              ${isSelected ? "ml-[6px] scale-125" : "scale-90"}
                            `}
                          />
                        </button>
                      </div>

                      {/* TEXT */}
                      <button
                        onClick={() => selectYear(y)}
                        className="text-[11px] text-left -mt-2"
                      >
                        {y.label}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
