"use client";


import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import ellipse from "@/public/images/userProfile/Ellipse 36.png";
import plus from "@/public/images/userProfile/plus-solid-full 1.png";
import { Menu, MenuButton, MenuItems, MenuItem, Transition } from "@headlessui/react";
import { Fragment, useEffect, useRef, useState } from "react";
import { AuthorDTO, CategoryDto, FormatDto, ProductDto } from "@/lib/api/generated";
import { authorService, formatService, productService } from "@/lib/api/services";
import SearchBar from "./SearchBar";
import FilterDropdown from "./FilterDropdown";
import ebookIcon from "@/public/images/userProfile/mobile-button-solid-full 1.png";
import audioIcon from "@/public/images/userProfile/volume-solid-full 1.png";
import printIcon from "@/public/images/userProfile/Паперова.svg";
import { useFavorites } from "../../../../../lib/hooks/useFavorites";
import { useMyBooks } from "../hooks/useMyBooks";
import Paws from "../../paws/Paws";
import { useLocalizedPath, useTranslations } from "@/lib/i18n/LocaleProvider";

type Props = {
  onLibrary?: () => void;
  subscriptions?: () => void;
  community?: () => void;
  categories: CategoryDto[];
  selectedIds: number[];
  ebookSelected?: boolean;
  audioSelected?: boolean;
  userId?: string;
};

type MenuKey = "library" | "subscriptions" | "communities";

export default function UserSideBArProfile({
  subscriptions, community, categories, selectedIds, ebookSelected, audioSelected, userId,
}: Props) {
  const t = useTranslations();
  const lp = useLocalizedPath();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const { favorites, loadingFavorites } = useFavorites(userId);
  const [selected, setSelected] = useState<MenuKey>("library");
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [authors, setAuthors] = useState<AuthorDTO[]>([]);
  const [formats, setFormats] = useState<FormatDto[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [clickBtn, setClickBtn] = useState(false);
  const { myBooks, setLoadingMyBooks } = useMyBooks(userId);
  const visibleBooks = myBooks.slice(0, 8);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasEbook = (book: ProductDto) =>
    book.formatIds?.includes(1) ?? false;

  const hasAudio = (book: ProductDto) =>
    book.formatIds?.includes(2) ?? false;
  const hasPrinted = (book: ProductDto) =>
    book.formatIds?.includes(3) ?? false;

  const colors = [
    "#325747",
    "#51381E",
    "#2A2A2A",
    "#034359",
    "#521A1B",
    "#555555",
    "#245841",
    "#592A2B",
  ];

  const lines = clickBtn
    ? ["Group 515.png", "Group 516.png", "Group 513.png"]
    : ["Group 513.png", "Group 516.png", "Group 515.png"];

  useEffect(() => {
    productService.apiProductsGet().then(setProducts).catch(console.error);
    authorService.apiAuthorsGet().then(setAuthors).catch(console.error);
    formatService.apiFormatsGet().then(setFormats).catch(console.error);
  }, []);
  const filteredProducts = selectedFormat
    ? products.filter((p) => p.formatIds?.includes(selectedFormat))
    : products;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
        setClickBtn(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSelect = (value: MenuKey, action?: () => void) => {
    setSelected(value);
    action?.();
  };

  const sidebar = (
    <div
      className="hidden md:flex fixed flex-col"
      style={{
        width: "370px", height: "900px",
        position: "fixed",
        top: "20px",
        left: "0px",
        zIndex: 10,
        backgroundImage: "url('/images/userProfile/Rectangle 360.png')",
        backgroundSize: "100% 100%", backgroundPosition: "center",
      }}
    >
      <Link href={lp("/paws")} className="w-[240px] h-[40px] relative ml-12 mt-14">
        <Paws userId={userId}/>
      </Link>
      {/* Верхній блок */}
      <div
        className="w-[248px] left-0 -mt-20 relative"
        style={{
          top: "90px", width: "340px", height: "250px",
          backgroundImage: "url('/images/userProfile/Rectangle 313.png')",
          backgroundSize: "100% 100%", backgroundPosition: "center",
        }}
      >
        <div className="relative flex flex-col top-[30px] items-center justify-center">
          <p className="font-source-sans font-semibold text-[16px] leading-[150%] tracking-[-0.011em] text-center">
            {t("profile.addNewspaper")}
          </p>
          <div className="relative flex z-50 items-center justify-center mt-2">
            <Image src={ellipse} alt="ellipse" className="w-[50px] h-[50px]" />
            <Image src={plus} alt="plus" className="absolute w-[36px] h-[36px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="w-[260px] relative top-[30px] z-30" style={{ width: "100%", left: "-8px" }}>
          <Menu as="div" className="relative w-[99%]">
            {({ open: menuOpen }) => (
              <div className="w-full bg-[#F5F3EE] rounded-2xl overflow-hidden transition-all duration-300 ease-in-out">
                <MenuButton style={{ paddingLeft: "128px" }} className="w-[90%] flex items-center justify-between px-4 py-3 text-[22px] font-semibold text-black outline-none">
                  <span>{t(`profile.menu.${selected}`)}</span>
                  <img src="/images/header/Vector.svg" alt="arrow" className={`w-[14px] h-[8px] transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`} />
                </MenuButton>
                <Transition as={Fragment} enter="transition ease-out duration-150" enterFrom="opacity-0 -translate-y-1" enterTo="opacity-100 translate-y-0" leave="transition ease-in duration-100" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 -translate-y-1">
                  <MenuItems className="outline-none pb-4">
                    {[
                      { key: "subscriptions" as const, action: subscriptions },
                      { key: "communities" as const, action: community },
                    ].map(({ key, action }) => (
                      <MenuItem key={key}>
                        {({ active }) => (
                          <button
                            onClick={() => handleSelect(key, action)}
                            className={`w-full px-4 py-4 text-center text-[16px] font-semibold ${active ? "bg-[#ECE7DF]" : ""} ${selected === key ? "font-bold text-[#A87E52]" : ""}`}
                          >
                            {t(`profile.menu.${key}`)}
                          </button>
                        )}
                      </MenuItem>
                    ))}
                  </MenuItems>
                </Transition>
              </div>
            )}
          </Menu>
        </div>
      </div>

      {/* Пошук + Фільтр */}
      <div ref={containerRef} className="relative flex items-center" style={{ top: "10px", left: "38px" }}>
        <SearchBar
          search={search}
          open={open}
          authors={authors}
          products={products}
          onChange={(val) => { setSearch(val); setOpen(true); }}
          onToggleOpen={() => setOpen((v) => !v)}
          onClose={() => { setOpen(false); setSearch(""); }}
        />

        <div className="relative w-[100px] z-20 overflow-visible">
          <div
            onClick={() => setClickBtn((v) => !v)}
            className="w-[60px] h-[60px] flex flex-col relative cursor-pointer transition-all duration-300 z-60 relative"
            style={{
              backgroundImage: "url('/images/userProfile/Rectangle 393.png')",
              backgroundSize: "100% 100%", backgroundPosition: "center",
            }}
          >
            <div className="flex flex-col items-center gap-1 mt-4.5">
              {lines.map((img, index) => (
                <div key={index} className="transition-all duration-300 ease-in-out"
                  style={{ width: "23px", height: "5px", backgroundImage: `url('/images/userProfile/${img}')`, backgroundSize: "100% 100%", backgroundPosition: "center" }}
                />
              ))}
            </div>
          </div>

          {clickBtn && (
            <FilterDropdown
              categories={categories}
              ebookSelected={ebookSelected}
              audioSelected={audioSelected}
              onClose={() => setClickBtn(false)}
            />
          )}
        </div>
      </div>

      <div
        className="relative w-[280px] h-[400px] ml-[38px] mt-[40px]"
        style={{
          backgroundImage: "url('/images/userProfile/Rectangle 404.png')",
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
        }}
      >
        {myBooks.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <img
              className="w-[166px] h-[170px] object-contain"
              src="/images/userProfile/imgIko.png"
              alt=""
            />
          </div>
        ) : (
          <div className="absolute bottom-[10px] left-[0px] w-[256px] flex flex-col top-[10px] gap-2">
            {visibleBooks.map((book, index) => (
              <div
                key={book.id}

                className="h-[40px] px-4 flex items-center justify-between rounded-tr-[5px] rounded-br-[5px]
shadow-[2px_2px_5px_0px_rgba(0,0,0,0.5)]
transition-transform duration-300 ease-in-out
hover:translate-x-[8px]  hover:scale-x-[1.05] transform-gpu"
                style={{ backgroundColor: colors[index % colors.length] }}
              >
                <p className="text-[var(--color-white)] text-[15px] w-[200px] truncate">{book.productName}</p>
                <div className="flex gap-2">
                  {hasAudio(book) && (
                    <Image src={audioIcon} alt="audio" width={24} height={28} />
                  )}

                  {hasEbook(book) && (
                    <Image src={ebookIcon} alt="ebook" width={24} height={28} />
                  )}
                  {hasPrinted(book) && (
                    <Image src={printIcon} alt="printbook" width={24} height={28} />
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
  if (!mounted) return null;
  return createPortal(sidebar, document.body);
}
