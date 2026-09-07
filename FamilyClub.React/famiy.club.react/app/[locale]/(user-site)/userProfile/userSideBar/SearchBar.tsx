"use client";

import Image from "next/image";
import Link from "next/link";
import { AuthorDTO, ProductDto } from "@/lib/api/generated";
import { useLocalizedPath, useTranslations } from "@/lib/i18n/LocaleProvider";

type Props = {
  search: string;
  open: boolean;
  authors: AuthorDTO[];
  products: ProductDto[];
  onChange: (val: string) => void;
  onToggleOpen: () => void;
  onClose: () => void;
};

export default function SearchBar({
  search, open, authors, products, onChange, onToggleOpen, onClose,
}: Props) {
  const t = useTranslations();
  const lp = useLocalizedPath();
  const q = search.toLowerCase();

  const filteredAuthors = search.trim() === ""
    ? []
    : authors.filter((a) => a.authorName?.toLowerCase().includes(q));

  const filteredProducts = search.trim() === ""
    ? []
    : products.filter((p) => p.productName?.toLowerCase().includes(q));

  const hasResults = filteredAuthors.length > 0 || filteredProducts.length > 0;

  return (
    <div className="relative">
      <div className="flex items-center bg-[var(--color-white)] rounded-[25px] px-2 h-[40px] w-[230px] shadow-[0px_0px_10px_0px_#24242466] hover:shadow-[0px_0px_15px_0px_#242424CC] transition-all duration-300">
        <input
          type="text"
          value={search}
          onChange={(e) => { onChange(e.target.value); }}
          onClick={(e) => e.stopPropagation()}
          placeholder={t("profile.searchPlaceholder")}
          className="w-full h-full bg-transparent text-[12px] text-[#272727] outline-none px-2"
        />
        <button
          onClick={(e) => { e.stopPropagation(); onToggleOpen(); }}
          className="w-[22px] h-[22px] flex items-center justify-center flex-shrink-0"
        >
          <Image src="/images/header/zoom_out_24px.png" alt="search" width={22} height={22} className="object-contain" priority />
        </button>
      </div>

      {open && hasResults && (
        <div className="absolute top-[38px] left-0 w-[220px] max-h-[260px] overflow-y-auto rounded-[20px] bg-[#F5F3EE] shadow-[0px_0px_15px_0px_#24242433] p-2 z-50">
          {filteredAuthors.length > 0 && (
            <>
              <p className="text-[11px] text-[#272727]/40 px-3 pt-1 pb-1">{t("header.authors")}</p>
              {filteredAuthors.map((a) => (
                <Link key={a.id} href={lp(`/authors/${a.id}`)} onClick={onClose}
                  className="flex items-center px-3 py-2 rounded-[14px] text-[13px] text-[#272727] hover:bg-white transition-all">
                  {a.authorName}
                </Link>
              ))}
            </>
          )}
          {filteredAuthors.length > 0 && filteredProducts.length > 0 && (
            <div className="border-t border-[#272727]/10 my-1" />
          )}
          {filteredProducts.length > 0 && (
            <>
              <p className="text-[11px] text-[#272727]/40 px-3 pt-1 pb-1">{t("header.books")}</p>
              {filteredProducts.map((p) => (
                <Link key={p.id} href={lp(`/products/${p.id}`)} onClick={onClose}
                  className="flex flex-col px-3 py-2 rounded-[14px] hover:bg-white transition-all">
                  <span className="text-[13px] text-[#272727]">{p.productName}</span>
                </Link>
              ))}
            </>
          )}
        </div>
      )}

      {open && search.trim() !== "" && !hasResults && (
        <div className="absolute top-[38px] left-0 w-[220px] rounded-[20px] bg-[#F5F3EE] shadow-[0px_0px_15px_0px_#24242433] p-4 text-[13px] text-[#272727] z-50">
          {t("header.notFound")}
        </div>
      )}
    </div>
  );
}
