"use client";

import type { CSSProperties } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const REVIEWS_BOOK_IMAGES = {
    uk: "/images/main_page/reviews/reviews-book-uk.png",
    en: "/images/main_page/reviews/reviews-book-en.png",
} as const;

type ReviewCardData = {
    id: number | string;
    author: string;
    text: string;
    timeLabel: string;
    avatar?: string | null;
    bookImage?: string | null;
    rating?: number | null;
};

type ReviewCardProps = ReviewCardData & {
    className?: string;
    style?: CSSProperties;
    fallbackBookSrc: string;
};

const formatRating = (value?: number | null) => {
    if (value == null) return "";
    return Number.isInteger(value) ? `${value}` : value.toFixed(1);
};

function ReviewCard({
    author,
    text,
    timeLabel,
    avatar,
    bookImage,
    rating,
    className,
    style,
    fallbackBookSrc,
}: ReviewCardProps) {
    const coverSrc = bookImage || fallbackBookSrc;

    return (
        <div
            className={`flex h-full flex-col gap-3 rounded-[21px] bg-[#f5f3ee] p-4 shadow-[0px_0px_15px_0px_rgba(0,0,0,0.6)] ${className ?? ""}`}
            style={style}
        >
            <div className="flex gap-4">
                {avatar ? (
                    <img alt="" className="h-[80px] w-[80px] rounded-full object-cover" src={avatar} />
                ) : (
                    <div className="h-[80px] w-[80px]" />
                )}
                <div className="flex-1">
                    {author ? (
                        <p className="font-mono text-[24px] font-medium text-[#242424]">{author}</p>
                    ) : null}
                    <p className="mt-2 max-h-[120px] overflow-hidden text-[14px] text-[#242424]">{text}</p>
                </div>
                <img
                    alt=""
                    className="h-[108px] w-[77px] rounded-[9px] object-cover"
                    src={coverSrc}
                />
            </div>
            <div className="flex items-center justify-between">
                {timeLabel ? (
                    <span className="text-[14px] font-medium text-[#242424]">{timeLabel}</span>
                ) : (
                    <span />
                )}
                {rating != null ? (
                    <div className="flex items-center gap-2">
                        <span className="text-[16px] text-[#242424]">{formatRating(rating)}</span>
                        <img alt="" className="h-[30px] w-[30px]" src="/images/main_page/icons/reviews-heart.svg" />
                    </div>
                ) : null}
            </div>
        </div>
    );
}

type ReviewsSectionProps = {
    reviews: ReviewCardData[];
};

export default function ReviewsSection({ reviews }: ReviewsSectionProps) {
    const { locale } = useLocale();
    const reviewsBookSrc = REVIEWS_BOOK_IMAGES[locale];

    if (!reviews.length) return null;
    const expandedReviews = [...reviews, ...reviews];
    const desktopLayout = [
        { left: -84, top: 22, height: 217 },
        { left: -84, top: 259, height: 168 },
        { left: 443, top: 22, height: 168 },
        { left: 443, top: 210, height: 217 },
        { left: 970, top: 22, height: 183 },
        { left: 970, top: 225, height: 168 },
        { left: 1497, top: 22, height: 168 },
        { left: 1497, top: 210, height: 183 },
    ];

    return (
        <section className="relative w-full overflow-hidden pb-4 pt-8">
            <div className="relative mx-auto hidden h-[450px] w-[1920px] max-w-full min-[1600px]:block">
                <div className="absolute inset-0 border-[20px] border-[#f5f3ee] shadow-[0px_0px_40px_0px_rgba(0,0,0,0.7)]">
                    <img
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover opacity-20"
                        src="/images/body/Rectangle%20287.webp"
                    />
                </div>
                {desktopLayout.map((layout, index) => (
                    <ReviewCard
                        key={`${expandedReviews[index]?.id}-${index}`}
                        className="absolute w-[507px]"
                        style={{ left: layout.left, top: layout.top, height: layout.height }}
                        {...expandedReviews[index]}
                        fallbackBookSrc={reviewsBookSrc}
                    />
                ))}
            </div>

            <div className="relative mx-auto max-w-[1920px] px-4 min-[1600px]:hidden">
                <div className="relative border-[20px] border-[#f5f3ee] shadow-[0px_0px_40px_0px_rgba(0,0,0,0.7)]">
                    <img
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover opacity-20"
                        src="/images/body/Rectangle%20287.webp"
                    />
                    <div className="relative grid gap-6 px-6 py-8 md:grid-cols-2">
                        {expandedReviews.map((review, index) => (
                            <ReviewCard
                                key={`${review.id}-${index}`}
                                {...review}
                                fallbackBookSrc={reviewsBookSrc}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Wooden Bookshelf Bar */}
            <div className="relative z-20 mt-8 h-[50px] w-full bg-gradient-to-b from-[#9A6028] via-[#7E4D1E] to-[#5C3613] shadow-[0px_8px_15px_rgba(0,0,0,0.5)] border-t-[3px] border-[#B87838] border-b-[4px] border-[#3E220A]" />
        </section>
    );
}
