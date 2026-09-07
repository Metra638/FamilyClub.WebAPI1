"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { LanguageDto } from "@/lib/api/generated";
import { languageService } from "@/lib/api/services";
import Link from "next/link";
import { useLocalizedPath, useTranslations } from "@/lib/i18n/LocaleProvider";


export default function DropDownLanguage() {
  const t = useTranslations();
  const lp = useLocalizedPath();
  const [languages, setLanguages] = useState<LanguageDto[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    languageService
      .apiLanguagesGet()
      .then(setLanguages)
      .catch(console.error);
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
          className="object-contain"
        />

        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          className="absolute pointer-events-auto inset-0 flex justify-center items-end mb-[56px] z-10 focus:outline-none"
        >
          <span className="text-[var(--color-white)]">{t("header.languages")}</span>
        </button>

        {open && (
          <div className="absolute pointer-events-auto z-20 top-[12px] w-full flex flex-col items-center gap-2 text-[var(--color-white)]">
            <div className="relative top-[40px] w-[110px] h-[40px]">
              <div
                className="custom-scrollbar relative mt-[50px] flex flex-col items-center gap-4"
                style={{
                  maxHeight: "130px",
                  overflowY: "auto",
                  paddingLeft: "4px",
                  paddingRight: "4px",
                }}
              >
                {languages.length === 0 ? (
                  <div className="text-[13px]">{t("header.notFound")}</div>
                ) : (
                  languages.map((l) => (
                    <Link
                      key={l.id}
                      href={lp(`/products?languageId=${l.id}`)}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-center text-center text-[13px] rounded-[15px] border-[2px] border-transparent hover:border-[#27272780] transition-all duration-200"
                      style={{ width: "80px", height: "30px", flexShrink: 0 }}
                    >
                      {l.languageName}
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
