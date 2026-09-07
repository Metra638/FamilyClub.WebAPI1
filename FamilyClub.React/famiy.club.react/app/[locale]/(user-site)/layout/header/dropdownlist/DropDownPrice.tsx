"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocalizedPath, useTranslations } from "@/lib/i18n/LocaleProvider";

export default function DropDownPrice() {
  const t = useTranslations();
  const lp = useLocalizedPath();
  const [open, setOpen] = useState(false);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [promotionOnly, setPromotionOnly] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
  function applyFilters() {
    const params = new URLSearchParams();

    if (from) params.set("minPrice", from);
    if (to) params.set("maxPrice", to);

    if (promotionOnly) {
      router.push(lp("/promotions"));
    } else {
      const qs = params.toString();
      router.push(lp(qs ? `/products?${qs}` : "/products"));
    }

    setFrom("");
    setTo("");
    setPromotionOnly(false);
    setOpen(false);
  }
  function goToPromotions() {
    setPromotionOnly((v) => !v);
  }
  return (
    <div ref={containerRef} className="relative w-[110px]">
      <div
        className={`
          relative w-[110px] h-[360px]
          transition-transform duration-300
          ${open ? "translate-y-0" : "-translate-y-[232px]"}
        `}
      >
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
          className="absolute pointer-events-auto inset-0 flex justify-center items-end mb-[56px] z-10"
        >
          <span className="text-[#F5F3EE]">{t("header.price")}</span>
        </button>

        {open && (
          <div className="absolute pointer-events-auto z-20 top-[42px] w-full flex justify-center text-[var(--color-white)]">
            {/* MAIN CONTAINER */}
            <div className="mt-[40px] w-[100px] flex flex-col items-center gap-3">
              {/* FROM */}
              <div className="relative w-full h-[40px] flex justify-center">
                <Image
                  src="/images/header/Rectangle 58.svg"
                  alt="bg"
                  fill
                  className="object-cover"
                />
                <input
                  type="number"
                  aria-label={t("header.priceFromAria")}
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="absolute inset-0 w-full h-full bg-transparent px-4 text-[#272727] text-[12px]"
                />
              </div>

              {/* TO */}
              <div className="relative w-full h-[40px] flex justify-center">
                <Image
                  src="/images/header/Rectangle 58.svg"
                  alt="bg"
                  fill
                  className="object-cover"
                />
                <input
                  type="number"
                  aria-label={t("header.priceToAria")}
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="absolute inset-0 w-full h-full bg-transparent px-4 text-[#272727] text-[12px]"
                />
              </div>

              {/* PROMO */}
              <div className="flex items-center justify-center gap-2 mt-1">
                <button
                  onClick={() => setPromotionOnly((v) => !v)}
                  className="w-[22px] h-[22px]"
                >
                  <Image
                    src={
                      promotionOnly
                        ? "/images/header/check2.svg"
                        : "/images/header/icon.svg"
                    }
                    alt=""
                    width={22}
                    height={22}
                    className={`
    object-contain
    transition-transform duration-300
    ${promotionOnly ? "scale-125 -mt-[6px] ml-[3px]" : "scale-90"}
  `}
                  />
                </button>

                <span className="text-[13px] text-white"
                  onClick={goToPromotions}
                >{t("header.promos")}
                </span>
              </div>

              {/* APPLY */}
              <button
                onClick={applyFilters}
                className="text-[13px] mt-1 opacity-80 hover:opacity-100"
              >
                {t("header.apply")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
