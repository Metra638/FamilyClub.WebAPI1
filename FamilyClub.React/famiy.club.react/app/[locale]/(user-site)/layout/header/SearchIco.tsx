"use client";

import {
  AuthorDTO,
  ProductDto,
} from "@/lib/api/generated";
import { productService, authorService } from "@/lib/api/services";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useLocalizedPath, useTranslations } from "@/lib/i18n/LocaleProvider";

export default function SearchIco() {
  const t = useTranslations();
  const lp = useLocalizedPath();
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [authors, setAuthors] = useState<AuthorDTO[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    productService.apiProductsGet().then(setProducts).catch(console.error);
    authorService.apiAuthorsGet().then(setAuthors).catch(console.error);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  function getProductAuthors(product: ProductDto): AuthorDTO[] {
    if (!product.authorIds?.length) return [];
    return authors.filter((a) => product.authorIds!.includes(a.id!));
  }

  function authorFullName(a: AuthorDTO): string {
    return a.authorName ?? "";
  }

  const q = search.toLowerCase();

  const filteredAuthors =
    search.trim() === ""
      ? []
      : authors.filter((a) => a.authorName?.toLowerCase().includes(q));

  const filteredProducts =
    search.trim() === ""
      ? []
      : products.filter((p) => p.productName?.toLowerCase().includes(q));

  const hasResults = filteredAuthors.length > 0 || filteredProducts.length > 0;

  return (
    <div ref={containerRef} className="relative flex items-center">
      {/* INPUT */}
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setOpen(true);
        }}
        onClick={(e) => e.stopPropagation()}
        placeholder=""
        className="
          w-[268px]
          px-4
          h-[36px]
          bg-[var(--color-white)]
          rounded-full
          text-[15px]
          text-[#272727]
          outline-none
        "
      />

      {/* ICON */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="
          relative
          right-[1vw]
          w-[22px]
          h-[22px]
          flex
          items-center
          justify-center
        "
      >
        <Image
          src="/images/header/zoom_out_24px.png"
          alt="search"
          width={22}
          height={22}
          className="object-contain"
          priority
        />
      </button>

      {/* RESULTS */}
      {open && hasResults && (
        <div className="absolute top-[45px] left-0 w-[calc(100%-20px)] max-h-[260px] 
  rounded-[20px] bg-[#F5F3EE] shadow-[0px_0px_15px_0px_#24242433] overflow-hidden z-50">
          <div className="custom-scrollbar max-h-[260px] overflow-y-auto p-2">

            {/* АВТОРИ */}
            {filteredAuthors.length > 0 && (
              <>
                <p className="text-[11px] text-[#272727]/40 px-3 pt-1 pb-1">{t("header.authors")}</p>
                {filteredAuthors.map((a) => (
                  <Link
                    key={a.id}
                    href={lp(`/authors/${a.id}`)}
                    onClick={() => { setOpen(false); setSearch(""); }}
                    className="flex items-center px-3 py-2 rounded-[14px] text-[13px] text-[#272727] hover:bg-white transition-all"
                  >
                    {a.authorName}
                  </Link>
                ))}
              </>
            )}

            {/* РОЗДІЛЮВАЧ */}
            {filteredAuthors.length > 0 && filteredProducts.length > 0 && (
              <div className="border-t border-[#272727]/10 my-1" />
            )}

            {/* КНИГИ */}
            {filteredProducts.length > 0 && (
              <>
                <p className="text-[11px] text-[#272727]/40 px-3 pt-1 pb-1">{t("header.books")}</p>
                {filteredProducts.map((p) => {
                  const productAuthors = getProductAuthors(p);
                  return (
                    <Link
                      key={p.id}
                      href={lp(`/products/${p.id}`)}
                      onClick={() => { setOpen(false); setSearch(""); }}
                      className="flex flex-col px-3 py-2 rounded-[14px] hover:bg-white transition-all"
                    >
                      <span className="text-[13px] text-[#272727]">{p.productName}</span>
                      {productAuthors.length > 0 && (
                        <span className="text-[11px] text-[#272727]/50">
                          {productAuthors.map(authorFullName).join(", ")}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}

      {/* EMPTY */}
      {open && search.trim() !== "" && !hasResults && (
        <div className="absolute top-[45px] left-0 w-[220px] rounded-[20px] bg-[#F5F3EE] shadow-[0px_0px_15px_0px_#24242433] p-4 text-[13px] text-[#272727] z-50">
          {t("header.notFound")}
        </div>
      )}
    </div>
  );
}
