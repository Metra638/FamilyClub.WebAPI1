"use client";


import { AgeRestrictionDto } from "@/lib/api/generated";
import { ageRestrictionService } from "@/lib/api/services";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLocalizedPath, useTranslations } from "@/lib/i18n/LocaleProvider";

export default function DropDownAgeRestrictions() {
  const t = useTranslations();
  const lp = useLocalizedPath();
  const [open, setOpen] = useState(false);
  const [ageFilters, setAgeFilters] = useState<AgeRestrictionDto[]>([]);
  const [selectedAge, setSelectedAge] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    ageRestrictionService.apiAgeRestrictionsGet().then(setAgeFilters).catch(console.error);
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

  function selectAge(f: AgeRestrictionDto) {
    setSelectedAge(f.id ?? null);

    setTimeout(() => {
      const params = new URLSearchParams();
      params.set("ageRestrictionId", String(f.id));
      router.push(lp(`/products?${params.toString()}`));
      setOpen(false);
    }, 600);
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
        {/* BG */}
        <Image
          src="/images/header/Rectangle 144.svg"
          alt="bg"
          fill
          className="object-fill pointer-events-none"
        />

        {/* BUTTON */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          className="pointer-events-auto absolute inset-0  flex justify-center items-end mb-[56px] z-10"
        >
          <span className="text-[var(--color-white)]">{t("header.age")}</span>
        </button>

        {/* DROPDOWN */}
        {open && (
          <div className="absolute pointer-events-auto z-20 top-[30px] w-full flex flex-col items-center text-[var(--color-white)]">
            <div className="relative mt-[50px] flex flex-col gap-2">
              {ageFilters.map((f) => {
                const isSelected = selectedAge === f.id;

                return (
                  <div key={f.id} className="flex items-center gap-1">
                    {/* RADIO */}
                    <div className="w-[28px] h-[28px] flex justify-center shrink-0">
                      <button
                        onClick={() => selectAge(f)}
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
                      onClick={() => selectAge(f)}
                      className="text-[13px] text-left -mt-2"
                    >
                      {f.name}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>

  );
}
