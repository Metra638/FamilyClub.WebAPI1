"use client";

import { useEffect } from "react";
import Link from "next/link";
import BookCard from "./BookCard";
import ShelfCat from "./ShelfCat";
import { useLocalizedPath, useTranslations } from "@/lib/i18n/LocaleProvider";
import { useMascotShelf } from "@/lib/mascot/MascotShelfContext";

type Book = {
    title: string;
    author?: string | null;
    price: string;
    image?: string | null;
    rating?: number | null;
    href?: string;
    formatTags?: Array<"paper" | "ebook" | "audio">;
    productId?: number;
};

type BookSectionProps = {
    title: string;
    books: Book[];
    showMore?: boolean;
    showMoreHref?: string;
    pillWidth?: number;
    isFav?: (id?: number) => boolean;
    onToggleFavorite?: (productId: number) => void;
    shelfIndex?: number;
};

export default function BookSection({
    title,
    books,
    showMore = false,
    showMoreHref,
    pillWidth,
    isFav,
    onToggleFavorite,
    shelfIndex,
}: BookSectionProps) {
    const t = useTranslations();
    const lp = useLocalizedPath();
    const moreHref = showMoreHref ?? lp("/pick-book");

    const { isCatOnShelf, activeShelfIndex, registerShelf } = useMascotShelf();

    useEffect(() => {
        if (shelfIndex !== undefined) {
            return registerShelf(shelfIndex);
        }
    }, [shelfIndex, registerShelf]);

    const hasCat = isCatOnShelf && shelfIndex !== undefined && activeShelfIndex === shelfIndex;

    return (
        <section
            className="relative w-full overflow-visible pt-0 pb-0"
            style={{
                backgroundImage:
                    "linear-gradient(180.074deg, color-mix(in srgb, var(--foreground-primary) 12%, transparent) 0.24409%, transparent 17.892%), linear-gradient(180.074deg, color-mix(in srgb, var(--foreground-primary) 22%, transparent) 9.5072%, transparent 49.996%), linear-gradient(90deg, var(--background-main) 0%, var(--background-main) 100%)",
            }}
        >
            {/* Акуратна дерев'яна поличка з дизайну (Group 187.png з userProfile) */}
            <div
                id={shelfIndex !== undefined ? `book-shelf-${shelfIndex}` : undefined}
                data-shelf-index={shelfIndex}
                className="relative h-[85px] md:h-[95px] w-full overflow-visible"
            >
                <img
                    src="/images/userProfile/Group 187.png"
                    alt=""
                    aria-hidden
                    className="absolute inset-0 z-10 w-full h-full object-fill pointer-events-none"
                />

                {/* Кіт Інк на поличці */}
                {hasCat && (
                    <div className="pointer-events-none absolute inset-0 z-50 mx-auto max-w-[1220px] px-4 lg:px-0">
                        <div className="relative h-full w-full" id="shelf-cat-anchor" data-shelf-cat="true">
                            <ShelfCat />
                        </div>
                    </div>
                )}
            </div>

            {/* Контейнер книг та плашки назви */}
            <div className="relative mx-auto max-w-[1220px] px-4 lg:px-0">
                <div className="absolute top-[36px] md:top-[14px] left-0 right-0 z-30 flex flex-wrap items-start justify-between gap-4 pointer-events-none px-4 lg:px-0">
                    <div
                        className="pointer-events-auto flex h-[57px] max-w-full items-center justify-center rounded-t-none rounded-b-[30px] bg-[var(--background-elevated)] px-6 md:px-8 shadow-[0px_8px_8.5px_0px_rgba(0,0,0,0.5)] w-fit"
                        style={pillWidth ? { minWidth: `${pillWidth}px` } : undefined}
                    >
                        <h2 className="font-serif text-[28px] sm:text-[32px] md:text-[40px] font-bold text-[var(--foreground-primary)] whitespace-nowrap leading-none">
                            {title}
                        </h2>
                    </div>
                    {showMore && (
                        <Link
                            href={moreHref}
                            className="pointer-events-auto h-[55px] w-[150px] rounded-t-none rounded-b-[25px] bg-[var(--background-elevated)] text-[24px] font-medium text-[var(--foreground-primary)] shadow-[0px_6px_8px_0px_rgba(0,0,0,0.3)] transition-transform hover:scale-105 flex items-center justify-center"
                        >
                            {t("home.sections.more")}
                        </Link>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-[60px] pb-12 -mt-[50px]">
                    {books.map((book, index) => (
                        <BookCard
                            key={`${book.title}-${index}`}
                            {...book}
                            isFavorite={isFav?.(book.productId)}
                            onToggleFavorite={onToggleFavorite}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
