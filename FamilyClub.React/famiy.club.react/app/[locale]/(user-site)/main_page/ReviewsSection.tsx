"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const REVIEWS_BOOK_IMAGES = {
    uk: "/images/main_page/reviews/reviews-book-uk.png",
    en: "/images/main_page/reviews/reviews-book-en.png",
} as const;

const DESKTOP_SLOT_COUNT = 8;
const INITIAL_VISIBLE_COUNT = 4;
const APPEND_INTERVAL_MS = 2200;
const ROTATE_INTERVAL_MS = 3800;

type ReviewCardData = {
    id: number | string;
    author: string;
    text: string;
    timeLabel: string;
    avatar?: string | null;
    bookImage?: string | null;
    rating?: number | null;
    productId?: number | null;
    href?: string;
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

function shuffle<T>(items: T[]): T[] {
    const next = [...items];
    for (let i = next.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [next[i], next[j]] = [next[j], next[i]];
    }
    return next;
}

function pickRandomIndex(indices: number[]): number | null {
    if (!indices.length) return null;
    return indices[Math.floor(Math.random() * indices.length)] ?? null;
}

function ReviewCard({
    author,
    text,
    timeLabel,
    avatar,
    bookImage,
    rating,
    href,
    className,
    style,
    fallbackBookSrc,
}: ReviewCardProps) {
    const coverSrc = bookImage || fallbackBookSrc;

    const body = (
        <>
            <div className="flex gap-4">
                {avatar ? (
                    <img alt="" className="h-[80px] w-[80px] rounded-full object-cover" src={avatar} />
                ) : (
                    <div className="h-[80px] w-[80px]" />
                )}
                <div className="flex-1">
                    {author ? (
                        <p className="font-mono text-[24px] font-medium text-[var(--foreground-primary)]">{author}</p>
                    ) : null}
                    <p className="mt-2 max-h-[120px] overflow-hidden text-[14px] text-[var(--foreground-primary)]">{text}</p>
                </div>
                <img
                    alt=""
                    className="h-[108px] w-[77px] rounded-[9px] object-cover"
                    src={coverSrc}
                />
            </div>
            <div className="flex items-center justify-between">
                {timeLabel ? (
                    <span className="text-[14px] font-medium text-[var(--foreground-primary)]">{timeLabel}</span>
                ) : (
                    <span />
                )}
                {rating != null ? (
                    <div className="flex items-center gap-2">
                        <span className="text-[16px] text-[var(--foreground-primary)]">{formatRating(rating)}</span>
                        <img alt="" className="h-[22px] w-[22px]" src="/images/main_page/icons/reviews-heart.svg" />
                    </div>
                ) : null}
            </div>
        </>
    );

    const sharedClassName = `flex h-full flex-col gap-3 rounded-[21px] bg-[var(--background-elevated)] p-4 shadow-[0px_0px_15px_0px_rgba(0,0,0,0.6)] ${
        href ? "cursor-pointer transition-transform duration-300 hover:scale-[1.02] hover:shadow-[0px_0px_22px_0px_rgba(0,0,0,0.75)]" : ""
    } ${className ?? ""}`;

    if (href) {
        return (
            <Link href={href} className={sharedClassName} style={style}>
                {body}
            </Link>
        );
    }

    return (
        <div className={sharedClassName} style={style}>
            {body}
        </div>
    );
}

type ReviewsSectionProps = {
    reviews: ReviewCardData[];
};

export default function ReviewsSection({ reviews }: ReviewsSectionProps) {
    const { locale } = useLocale();
    const reviewsBookSrc = REVIEWS_BOOK_IMAGES[locale];
    const poolRef = useRef<ReviewCardData[]>([]);
    const nextIndexRef = useRef(0);
    const [slots, setSlots] = useState<Array<ReviewCardData | null>>(
        () => Array.from({ length: DESKTOP_SLOT_COUNT }, () => null),
    );
    const [reduceMotion, setReduceMotion] = useState(false);

    const desktopLayout = useMemo(
        () => [
            { left: -84, top: 22, height: 217 },
            { left: -84, top: 259, height: 168 },
            { left: 443, top: 22, height: 168 },
            { left: 443, top: 210, height: 217 },
            { left: 970, top: 22, height: 183 },
            { left: 970, top: 225, height: 168 },
            { left: 1497, top: 22, height: 168 },
            { left: 1497, top: 210, height: 183 },
        ],
        [],
    );

    const expandedReviews = useMemo(() => {
        if (!reviews.length) return [] as ReviewCardData[];
        return [...reviews, ...reviews];
    }, [reviews]);

    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const sync = () => setReduceMotion(mq.matches);
        sync();
        mq.addEventListener("change", sync);
        return () => mq.removeEventListener("change", sync);
    }, []);

    useEffect(() => {
        if (!reviews.length) {
            poolRef.current = [];
            nextIndexRef.current = 0;
            setSlots(Array.from({ length: DESKTOP_SLOT_COUNT }, () => null));
            return;
        }

        const pool = shuffle(expandedReviews);
        poolRef.current = pool;
        nextIndexRef.current = 0;

        if (reduceMotion) {
            setSlots(
                Array.from({ length: DESKTOP_SLOT_COUNT }, (_, index) => pool[index] ?? null),
            );
            return;
        }

        const initialCount = Math.min(INITIAL_VISIBLE_COUNT, pool.length, DESKTOP_SLOT_COUNT);
        const initialSlots: Array<ReviewCardData | null> = Array.from(
            { length: DESKTOP_SLOT_COUNT },
            () => null,
        );
        const slotOrder = shuffle(
            Array.from({ length: DESKTOP_SLOT_COUNT }, (_, index) => index),
        );

        for (let i = 0; i < initialCount; i += 1) {
            const slotIndex = slotOrder[i]!;
            initialSlots[slotIndex] = pool[nextIndexRef.current]!;
            nextIndexRef.current += 1;
        }
        setSlots(initialSlots);

        const appendTimer = window.setInterval(() => {
            setSlots((prev) => {
                const emptyIndices = prev
                    .map((item, index) => (item == null ? index : -1))
                    .filter((index) => index >= 0);
                const target = pickRandomIndex(emptyIndices);
                if (target == null) return prev;

                const poolNow = poolRef.current;
                if (!poolNow.length) return prev;

                if (nextIndexRef.current >= poolNow.length) {
                    nextIndexRef.current = 0;
                }

                const next = [...prev];
                next[target] = poolNow[nextIndexRef.current]!;
                nextIndexRef.current += 1;
                return next;
            });
        }, APPEND_INTERVAL_MS);

        const rotateTimer = window.setInterval(() => {
            setSlots((prev) => {
                const filledIndices = prev
                    .map((item, index) => (item != null ? index : -1))
                    .filter((index) => index >= 0);
                if (filledIndices.length < DESKTOP_SLOT_COUNT) return prev;

                const target = pickRandomIndex(filledIndices);
                if (target == null) return prev;

                const poolNow = poolRef.current;
                if (!poolNow.length) return prev;

                if (nextIndexRef.current >= poolNow.length) {
                    nextIndexRef.current = 0;
                }

                const next = [...prev];
                next[target] = poolNow[nextIndexRef.current]!;
                nextIndexRef.current += 1;
                return next;
            });
        }, ROTATE_INTERVAL_MS);

        return () => {
            window.clearInterval(appendTimer);
            window.clearInterval(rotateTimer);
        };
    }, [expandedReviews, reduceMotion, reviews.length]);

    if (!reviews.length) return null;

    return (
        <section className="group/reviews relative w-full overflow-hidden pb-4 pt-8">
            {/* Desktop only */}
            <div className="relative mx-auto hidden h-[550px] w-full min-[1600px]:block">
                <img
                    alt=""
                    aria-hidden
                    className="reviews-papyrus-sheet pointer-events-none absolute inset-0 z-0 h-full w-full object-fill"
                    src="/images/body/Rectangle2871.png"
                />

                <div className="relative z-10 flex h-full w-full items-center justify-center">
                    <div
                        className={`reviews-marquee relative h-[450px] w-[1920px] max-w-full ${
                            reduceMotion ? "" : "reviews-marquee-animate"
                        }`}
                    >
                        {desktopLayout.map((layout, index) => {
                            const review = slots[index];
                            if (!review) return null;

                            return (
                                <ReviewCard
                                    key={`${review.id}-${index}-${review.timeLabel}`}
                                    className="reviews-card-enter absolute w-[507px]"
                                    style={{
                                        left: layout.left,
                                        top: layout.top,
                                        height: layout.height,
                                    }}
                                    {...review}
                                    fallbackBookSrc={reviewsBookSrc}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="relative mx-auto max-w-[1920px] px-4 min-[1600px]:hidden">
                <div className="relative border-[20px] border-[var(--background-elevated)] shadow-[0px_0px_40px_0px_rgba(0,0,0,0.7)]">
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
            <div className="relative z-20 mt-8 h-[50px] w-full bg-gradient-to-b from-[var(--color-wood-gradient-from)] via-[var(--color-shelf)] to-[#3E220A] shadow-[0px_8px_15px_rgba(0,0,0,0.5)] border-t-[3px] border-[var(--color-border-warm)] border-b-[4px] border-[#3E220A]" />
        </section>
    );
}
