"use client";

import { AuthorDTO } from "@/lib/api/generated";
import { authorService } from "@/lib/api/services";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLocalizedPath, useTranslations } from "@/lib/i18n/LocaleProvider";

const ITEMS_PER_PAGE = 3;

export default function DropDownAuthors() {
  const t = useTranslations();
  const lp = useLocalizedPath();
  const router = useRouter();
  const [authors, setAuthors] = useState<AuthorDTO[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    authorService.apiAuthorsGet().then(setAuthors).catch(console.error);
  }, []);

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

  const displayedAuthors =
    search.trim() === ""
      ? authors.slice(0, ITEMS_PER_PAGE)
      : authors.filter((a) =>
        a.authorName?.toLowerCase().includes(search.toLowerCase())
      );

  function formatAuthorName(fullName?: string) {
    if (!fullName) return "";

    const parts = fullName.trim().split(" ").filter(Boolean);

    const firstName = parts[0];
    const lastName = parts.slice(1).join(" ");

    if (!firstName) return "";

    const initial = firstName[0]?.toUpperCase() + ".";

    return lastName ? `${initial} ${lastName}` : initial;
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
          className="object-contain"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();

            if (open) {
              router.push(lp("/authors"));
              return;
            }

            setOpen(true);
            setSearch("");
          }}
          className="absolute pointer-events-auto inset-0 flex justify-center items-end mb-[56px] z-10 focus:outline-none"
        >
          <span className="text-[#F5F3EE]">{t("header.authors")}</span>
        </button>

        {open && (
          <div className="absolute pointer-events-auto z-20 top-[42px] w-full flex flex-col 
          items-center gap-2 text-[var(--color-white)]">
            <div className="relative top-[40px] w-[90px] h-[30px]">
              <Image
                src="/images/header/Rectangle 58.svg"
                alt="search bg"
                fill
                className="object-cover"
              />

              <div className="relative p-3 inset-0 flex items-center px-5">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder=""
                  className="
                      w-full
                      bg-transparent
                      outline-none
                      text-[#272727]
                      text-xs
                      pr-5
                      -mt-1
                    "
                />
                <div className="absolute right-4 mt-2 -translate-y-1/2">
                  <Image
                    src="/images/header/zoom_out_24px.svg"
                    alt="search"
                    width={14}
                    height={14}
                  />
                </div>
              </div>
            </div>

            <div className="relative mt-[50px] max-h-[130px] custom-scrollbar overflow-y-auto flex flex-col items-center justify-center gap-4">
              {displayedAuthors.length === 0 ? (
                <div className="text-[13px]">{t("header.notFound")}</div>
              ) : (
                displayedAuthors.map((a) => (
                  <Link
                    key={a.id}
                    href={lp(`/authors/${a.id}`)}
                    onClick={() => setOpen(false)}
                    className={`
    flex
    items-center
    justify-center
    text-center
    text-[13px]
    w-[80px]
    h-[30px]
    rounded-[15px]
    border-[2px]
    border-transparent
    hover:border-[#27272780]
    transition-all
    duration-200
  `}
                  >
                    {formatAuthorName(a.authorName ?? undefined)}
                  </Link>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
