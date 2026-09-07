"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getNestedString } from "@/lib/i18n/nested";
import { getLocaleFromPathname, localizedPath } from "@/lib/i18n/localized-path";
import type { Dictionary } from "@/lib/i18n/types";
import ukDictionary from "@/messages/uk.json";
import enDictionary from "@/messages/en.json";

// ── Assets from /public/images/not-found/ ──
const imgPageTexture = "/images/not-found/page-texture.svg";
const imgTornBookmark = "/images/not-found/torn-bookmark.svg";
const imgNotebookLines = "/images/not-found/notebook-lines.svg";
const imgEllipseDeco = "/images/not-found/ellipse-deco.svg";

export default function MobileNotFoundView() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const locale = getLocaleFromPathname(pathname) ?? "uk";
  const dictionary = (locale === "en" ? enDictionary : ukDictionary) as Dictionary;
  const t = (key: string) => getNestedString(dictionary, key);
  const lp = (path: string) => localizedPath(path, locale);

  return (
    <div className="relative w-full min-h-screen bg-[#F5F3EE] flex flex-col justify-between pt-[75px] pb-[90px] px-4 overflow-x-hidden font-sans text-[#242424]">
      {/* ── Decorative Background Ellipses ── */}
      <div className="absolute -top-[60px] -left-[120px] w-[320px] h-[320px] pointer-events-none opacity-45 z-0">
        <img alt="" src={imgEllipseDeco} className="w-full h-full object-contain" />
      </div>
      <div className="absolute bottom-[80px] -right-[120px] w-[360px] h-[360px] pointer-events-none opacity-45 z-0">
        <img alt="" src={imgEllipseDeco} className="w-full h-full object-contain" />
      </div>

      {/* ── Top Bar: Back Button ── */}
      <div className="relative z-10 w-full max-w-[440px] mx-auto flex items-center justify-between py-1">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/70 hover:bg-white text-[#242424] text-[15px] font-medium border border-black/5 shadow-sm transition-all duration-200 active:scale-95"
          aria-label={t("notFound.backAria")}
        >
          <svg className="w-4 h-4 text-[#242424]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span>{t("notFound.back")}</span>
        </button>
      </div>

      {/* ── Main Content Area ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center my-4 w-full max-w-[440px] mx-auto">
        {/* Title "Помилка" */}
        <h1 className="font-mono font-bold text-[40px] sm:text-[48px] text-[#242424] tracking-tight leading-none mb-6 select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.06)] text-center">
          {t("notFound.error")}
        </h1>

        {/* ═══ Responsive Book Illustration (Aspect Ratio 568 / 388) ═══ */}
        <div className="relative w-full max-w-[350px] sm:max-w-[400px] aspect-[568/388] mx-auto select-none transition-transform duration-300 hover:scale-[1.01]">
          {/* Dark green back cover */}
          <div
            className="absolute top-[6.9%] left-0 w-full h-[93.1%] rounded-[4px] shadow-[0_8px_20px_rgba(3,47,27,0.35)]"
            style={{ background: "#032f1b" }}
          />
          {/* Green front cover */}
          <div
            className="absolute top-[5.1%] left-[1.8%] w-[96.5%] h-[93.3%] rounded-[4px]"
            style={{ background: "#005B33" }}
          />
          {/* White / Cream book pages */}
          <div
            className="absolute top-[9.5%] left-[4.4%] w-[91.2%] h-[89.4%] rounded-[3px] overflow-hidden flex border border-[#9b9b9b]"
            style={{ background: "#E1E1E1" }}
          >
            {/* Left page */}
            <div className="relative w-1/2 h-full overflow-hidden">
              <img
                alt=""
                src={imgPageTexture}
                className="absolute inset-0 w-full h-full object-cover opacity-70 pointer-events-none"
              />
              <img
                alt=""
                src={imgNotebookLines}
                className="absolute left-[14%] top-[16%] w-[72%] h-[74%] opacity-75 pointer-events-none"
              />
            </div>

            {/* Right page (404 Content) */}
            <div className="relative w-1/2 h-full overflow-hidden flex flex-col items-center justify-center px-1 text-center">
              <img
                alt=""
                src={imgPageTexture}
                className="absolute inset-0 w-full h-full object-cover opacity-70 pointer-events-none"
              />
              <div className="relative z-10 flex flex-col items-center justify-center -mt-1 sm:-mt-2">
                <span
                  className="text-[#005B33] font-bold text-[48px] sm:text-[60px] leading-none tracking-tight select-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.08)] font-sans"
                >
                  404
                </span>
                <span
                  className="text-[#9396a8] font-medium text-[11px] sm:text-[13px] leading-tight mt-1 sm:mt-1.5 select-none font-sans"
                >
                  {t("notFound.pageNotFound")}
                </span>
              </div>
            </div>

            {/* Central spine dividing line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-[#9b9b9b] shadow-[0_0_3px_rgba(0,0,0,0.2)]" />
          </div>

          {/* Torn bookmark overlay */}
          <div className="absolute -top-[2%] left-[46.2%] w-[11.4%] h-[96%] z-10 pointer-events-none drop-shadow-md">
            <img alt="" src={imgTornBookmark} className="w-full h-full object-contain" />
          </div>
        </div>

        {/* ═══ Text description & CTA buttons ═══ */}
        <div className="flex flex-col items-center text-center mt-7 sm:mt-9 w-full max-w-[360px] gap-6">
          <div className="flex flex-col gap-2 px-2">
            <h2 className="text-[#242424] font-semibold text-[26px] sm:text-[28px] leading-tight tracking-tight font-sans">
              {t("notFound.title")}
            </h2>
            <p className="text-[#242424]/75 text-[15px] sm:text-[16px] leading-normal font-sans">
              {t("notFound.description")}
            </p>
          </div>

          {/* Buttons container */}
          <div className="flex flex-col sm:flex-row items-center justify-center w-full gap-3 pt-1">
            <Link
              href={lp("/")}
              className="w-full inline-flex items-center justify-center text-[#F5F3EE] bg-[#005B33] hover:bg-[#00452a] active:scale-[0.98] transition-all duration-200 rounded-full py-3.5 px-6 font-medium text-[17px] shadow-[0_6px_16px_rgba(0,91,51,0.28)] font-sans"
            >
              {t("notFound.goHome")}
            </Link>
            <Link
              href={lp("/categories")}
              className="w-full inline-flex items-center justify-center text-[#005B33] bg-white/60 hover:bg-white active:scale-[0.98] border border-[#005B33]/40 transition-all duration-200 rounded-full py-3.5 px-6 font-medium text-[16px] shadow-sm font-sans"
            >
              {t("notFound.catalog")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
