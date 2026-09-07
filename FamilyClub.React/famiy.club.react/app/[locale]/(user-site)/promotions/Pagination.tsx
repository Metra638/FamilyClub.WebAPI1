"use client";

import { useTranslations } from "@/lib/i18n/LocaleProvider";

type Props = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
};

type PageItem = number | "ellipsis-left" | "ellipsis-right";

function getPageItems(currentPage: number, totalPages: number): PageItem[] {
  const items: PageItem[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) items.push(i);
    return items;
  }

  const siblings = 1;

  const left = Math.max(2, currentPage - siblings);
  const right = Math.min(totalPages - 1, currentPage + siblings);

  items.push(1);

  if (left > 2) {
    items.push("ellipsis-left");
  } else {
    for (let i = 2; i < left; i++) items.push(i);
  }

  for (let i = left; i <= right; i++) items.push(i);

  if (right < totalPages - 1) {
    items.push("ellipsis-right");
  } else {
    for (let i = right + 1; i < totalPages; i++) items.push(i);
  }

  items.push(totalPages);

  return items;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}: Props) {
  const t = useTranslations();

  if (totalPages <= 1) return null;

  const pageItems = getPageItems(currentPage, totalPages);

  const hasCountInfo = totalItems != null && itemsPerPage != null;
  const startIndex = hasCountInfo ? (currentPage - 1) * itemsPerPage! + 1 : null;
  const endIndex = hasCountInfo
    ? Math.min(currentPage * itemsPerPage!, totalItems!)
    : null;

  return (
    <div className="w-full flex items-center justify-between gap-4 flex-wrap">
      {hasCountInfo && (
        <p className="font-['Source_Sans_Pro'] text-[16px] text-[#4b4b4b]">
          {t("promotions.shownRange")
            .replace("{start}", String(startIndex))
            .replace("{end}", String(endIndex))
            .replace("{total}", String(totalItems))}
        </p>
      )}

      <ul className="flex items-center gap-2 mx-auto">
        <li>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="
                            w-10 h-10
                            flex items-center justify-center
                            text-[var(--color-white)]
                            disabled:opacity-40
                        "
            aria-label={t("catalog.previousPageAria")}
          >
            ‹
          </button>
        </li>

        {pageItems.map((item, idx) =>
          item === "ellipsis-left" || item === "ellipsis-right" ? (
            <li key={item + idx}>
              <span
                className="
                                    w-10 h-10
                                    flex items-center justify-center
                                    text-[18px]
                                    font-['Source_Sans_Pro']
                                    text-[#a3a19e]
                                "
              >
                …
              </span>
            </li>
          ) : (
            <li key={item}>
              <button
                onClick={() => onPageChange(item)}
                className={`
                                    w-10 h-10
                                    flex items-center justify-center
                                    rounded-[10px]
                                    text-[18px]
                                    font-['Source_Sans_Pro']
                                    transition
                                    ${
                                      item === currentPage
                                        ? "bg-[var(--color-brand-green,#1f4d3d)] text-[var(--color-white)]"
                                        : "bg-transparent text-[var(--color-white)] hover:bg-[#ececec] hover:text-[var(--color-black)]"
                                    }
                                `}
              >
                {item}
              </button>
            </li>
          ),
        )}

        <li>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="
                            w-10 h-10
                            flex items-center justify-center
                            text-[var(--color-white)]
                            disabled:opacity-40
                        "
            aria-label={t("catalog.nextPageAria")}
          >
            ›
          </button>
        </li>
      </ul>

      {hasCountInfo && <div className="invisible hidden sm:block w-[160px]" aria-hidden />}
    </div>
  );
}
