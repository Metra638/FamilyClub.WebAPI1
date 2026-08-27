"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useReviews from "./hooks/useReviews";
import { setReviewApproved, deleteReview } from "./api/ActionReviews";
import ReviewsFilterBar from "./section/ReviewsFilterBar";
import ReviewsList from "./section/ReviewsList";
import ReviewDetail from "./section/ReviewDetail";
import { Review } from "./types";
import { getReviewProductCoverUrl } from "@/lib/reviews/reviewCoverUrl";

export default function Page() {
    const { reviews, loadingReviews, refetch } = useReviews();
    const shelfRef = useRef<HTMLDivElement>(null);

    // тільки підсвітка
    const [selectedId, setSelectedId] = useState<number | null>(null);

    // відгук, який відкритий справа
    // const [openedReview, setOpenedReview] = useState<Review | null>(null);

    const [search, setSearch] = useState("");
    const [book, setBook] = useState("all");
    const [rating, setRating] = useState("all");

    const bookOptions = useMemo(() => {
        const map = new Map<number, string>();

        reviews.forEach((r) => {
            if (r.productName) {
                map.set(r.productId, r.productName);
            }
        });

        return Array.from(map, ([id, title]) => ({
            id: String(id),
            title,
        }));
    }, [reviews]);

    const filtered = useMemo(() => {
        return reviews.filter((r) => {
            if (
                search &&
                !(r.comment ?? "").toLowerCase().includes(search.toLowerCase())
            ) {
                return false;
            }

            if (book !== "all" && String(r.productId) !== book) {
                return false;
            }

            if (rating !== "all" && r.rating !== Number(rating)) {
                return false;
            }

            return true;
        });
    }, [reviews, search, book, rating]);

    const openedReview = useMemo(() => {
        if (selectedId == null) return filtered[0] ?? null;
        return filtered.find((r) => r.id === selectedId) ?? filtered[0] ?? null;
    }, [filtered, selectedId]);

    // // Якщо відкритого відгуку немає або він зник після фільтрації
    // useEffect(() => {
    //     if (
    //         !openedReview ||
    //         !filtered.some((r) => r.id === openedReview.id)
    //     ) {
    //         setOpenedReview(filtered[0] ?? null);
    //     }
    // }, [filtered]);

    const handleToggleApprove = async () => {
        if (!openedReview) return;

        await setReviewApproved(
            openedReview,
            !openedReview.approved
        );

        await refetch();
    };

    const handleDelete = async () => {
        if (!openedReview) return;

        await deleteReview(openedReview.id);

        setSelectedId(null);

        await refetch();
    };

    const resetFilters = () => {
        setSearch("");
        setBook("all");
        setRating("all");
    };

    const getImageSrc = (review: Review) => getReviewProductCoverUrl(review);

    return (
        <div
            ref={shelfRef}
            className="w-full min-h-screen overflow-hidden relative m-0 p-0"
        >
            <div className="w-[100vw] min-h-screen relative">
                <img
                    src="/images/usersPageAdmin/Rectangle 675.png"
                    className="absolute"
                    style={{
                        width: "100vw",
                        height: "auto",
                        top: "40px",
                        left: "-20px",
                    }}
                    alt=""
                />

                <div className="relative pt-20 px-2 flex flex-col gap-4">
                    <ReviewsFilterBar
                        search={search}
                        book={book}
                        rating={rating}
                        onSearchChange={setSearch}
                        onBookChange={setBook}
                        onRatingChange={setRating}
                        onReset={resetFilters}
                        bookOptions={bookOptions}
                    />

                    <div className="flex gap-4 items-center px-5 -mt-4">
                        {loadingReviews ? (
                            <p>Завантаження...</p>
                        ) : (
                            <ReviewsList
                                reviews={filtered}
                                getImageSrc={getImageSrc}
                                selectedId={selectedId ?? undefined}
                                onSelect={(r) => {
                                    if (!r) {
                                        setSelectedId(null);
                                        return;
                                    }

                                    // setOpenedReview(r);
                                    setSelectedId(r.id);
                                }}
                            />
                        )}

                        {openedReview && (
                            <ReviewDetail
                                review={openedReview}
                                getImageSrc={getImageSrc}
                                onToggleApprove={handleToggleApprove}
                                onDelete={handleDelete}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}