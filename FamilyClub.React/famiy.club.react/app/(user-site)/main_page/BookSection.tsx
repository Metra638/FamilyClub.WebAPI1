import Link from "next/link";
import BookCard from "./BookCard";

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
};

export default function BookSection({ title, books, showMore = false, showMoreHref = "/pick-book", pillWidth, isFav, onToggleFavorite }: BookSectionProps) {
    return (
        <section
            className="relative w-full overflow-hidden pt-0 pb-0"
            style={{
                backgroundImage: "linear-gradient(180.074deg, rgba(36, 36, 36, 0.2) 0.24409%, rgba(36, 36, 36, 0) 17.892%), linear-gradient(180.074deg, rgba(36, 36, 36, 0.5) 9.5072%, rgba(36, 36, 36, 0) 49.996%), linear-gradient(90deg, rgb(245, 243, 238) 0%, rgb(245, 243, 238) 100%)"
            }}
        >
            {/* Top Full-Width Wooden Bookshelf Bar (on which books and pill hang) */}
            <div className="relative z-10 h-[105px] w-full shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] bg-[#7e4d1e]">
                <img src="/images/catalog/shelf_tex1.png" className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-50 pointer-events-none" alt="" />
                <div className="absolute inset-0 bg-[rgba(0,0,0,0.27)] pointer-events-none" />
                <div className="absolute left-0 right-0 bottom-0 h-[70px]">
                    <img src="/images/catalog/shelf_tex2.png" className="absolute inset-0 w-full h-full object-cover mix-blend-multiply pointer-events-none" alt="" />
                    <img src="/images/catalog/shelf_tex3.png" className="absolute inset-0 w-full h-full object-cover pointer-events-none" alt="" />
                </div>
            </div>

            {/* Hanging Title Pill & Book Cards Container */}
            <div className="relative z-10 mx-auto max-w-[1220px] px-4 lg:px-0">
                {/* Hanging Title Pill & Show More Button */}
                <div className="absolute top-0 left-0 right-0 z-30 flex flex-wrap items-start justify-between gap-4 pointer-events-none px-4 lg:px-0">
                    <div
                        className="pointer-events-auto flex h-[57px] max-w-full items-center justify-center rounded-t-none rounded-b-[30px] bg-[#f5f3ee] px-6 md:px-8 shadow-[0px_8px_8.5px_0px_rgba(0,0,0,0.5)] w-fit"
                        style={pillWidth ? { minWidth: `${pillWidth}px` } : undefined}
                    >
                        <h2 className="font-serif text-[28px] sm:text-[32px] md:text-[40px] font-bold text-[#242424] whitespace-nowrap leading-none">
                            {title}
                        </h2>
                    </div>
                    {showMore && (
                        <Link
                            href={showMoreHref}
                            className="pointer-events-auto h-[55px] w-[150px] rounded-t-none rounded-b-[25px] bg-[#f5f3ee] text-[24px] font-medium text-[#242424] shadow-[0px_6px_8px_0px_rgba(0,0,0,0.3)] transition-transform hover:scale-105 flex items-center justify-center"
                        >
                            Більше
                        </Link>
                    )}
                </div>

                {/* Book Cards Grid - starting below hanging pill matching Figma */}
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-[60px] pb-12 pt-[75px]">
                    {books.map((book, index) => (
                        <BookCard key={`${book.title}-${index}`} {...book} isFavorite={isFav?.(book.productId)}
                            onToggleFavorite={onToggleFavorite} />
                    ))}
                </div>
            </div>
        </section>
    );
}