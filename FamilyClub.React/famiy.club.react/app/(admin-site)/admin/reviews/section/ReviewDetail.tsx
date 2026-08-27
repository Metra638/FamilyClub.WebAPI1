"use client";

import { showConfirm } from "@/lib/ui/sweetAlert";
import { getReviewProductCoverUrl } from "@/lib/reviews/reviewCoverUrl";
import { Review } from "../types";
import StarRating from "../ui/StarRating";

interface Props {
    review: Review;
    onToggleApprove: () => void;
    onDelete: () => void;
    getImageSrc?: (review: Review) => string | null;
}

export default function ReviewDetail({
    review,
    onToggleApprove,
    onDelete,
    getImageSrc,
}: Props) {
    // Отримуємо головну обкладинку книги
    const mainImage = getImageSrc ? getImageSrc(review) : null;
    const productName = review.productName ?? `Товар #${review.productId}`;
    return (
        <div
            style={{
                backgroundImage: "url('/images/reviewsAdmin/Rectangle 676.png')",
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
            }}
            className="w-[640px] h-[740px] p-10 flex flex-col justify-between shrink-0 select-none box-border"
        >
            <div className="flex flex-col gap-5 overflow-y-auto pr-1">
                <h3 className="font-bold text-[20px] text-gray-900">Деталі відгуку</h3>

                {/* Обкладинка + Інформація про книгу */}
                <div className="flex gap-4 items-start">
                    <div className="w-[100px] h-[140px] shrink-0 bg-gray-200 rounded-md overflow-hidden shadow-sm">
                        {mainImage ? (
                            <img
                                src={mainImage}
                                alt={productName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 p-2 text-center">
                                {productName}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col justify-between h-[140px] flex-1 min-w-0">
                        <div>
                            <h2
                                className="font-bold text-lg text-gray-900 leading-tight line-clamp-2"
                                title={productName}
                            >
                                {productName}
                            </h2>
                            <p className="text-sm text-gray-500 font-medium mt-1 truncate">
                                {review.authors}
                            </p>
                        </div>

                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-sm font-medium text-gray-800 truncate max-w-[120px]">
                                    {review.userName ?? "Анонім"}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {new Date(review.createdAt).toLocaleString("uk-UA", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            </div>

                            <div className="flex flex-col items-start gap-1">
                                <span className="text-xs font-semibold text-gray-800">
                                    Оцінка
                                </span>
                                <StarRating rating={review.rating} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <h4 className="font-semibold text-sm text-gray-900">Текст відгуку</h4>
                    <p className="text-xs text-gray-700 leading-relaxed break-words">
                        {review.comment ?? "Текст відсутній"}
                    </p>
                </div>
                <div className="mt-6">
                    {(() => {
                        const coverUrl = getReviewProductCoverUrl(review);
                        if (!coverUrl) return null;

                        return (
                        <div className="flex flex-col gap-1.5">
                            <h4 className="font-semibold text-sm text-gray-900">Обкладинка книги</h4>
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                    <div className="w-[80px] h-[80px] shrink-0 rounded-md overflow-hidden bg-gray-200 border border-gray-200">
                                        <img
                                            src={coverUrl}
                                            alt={review.productName ?? "Обкладинка"}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    </div>
                            </div>
                        </div>
                        );
                    })()}
                </div>
            </div>

            {/* 2. Нижня частина: Метадані та Кнопки*/}
            <div className="flex flex-col gap-3 pt-3 shrink-0">
                {/* IP та Пристрій */}
                <div className="text-[11px] text-gray-400 flex items-center gap-2">
                    <span>IP адреса: 192.168.1.45</span>
                    <span>|</span>
                    <span>Пристрій: Windows/Chrome</span>
                </div>

                {/* Кнопки дій */}
                {/* <div className="flex items-center gap-3 w-full">
                    <button
                        type="button"
                        onClick={onToggleApprove}
                        className={`flex-1 h-[40px] rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors ${review.approved
                                ? "bg-amber-600 hover:bg-amber-700 text-white"
                                : "bg-[#005B33] hover:bg-[#004728] text-white"
                            }`}
                    >
                        {review.approved ? "Зняти з публікації" : "Погодити"}
                    </button>

                    <button
                        type="button"
                        onClick={onDelete}
                        className="flex-1 h-[40px] rounded-lg font-medium text-sm border border-[#005B33] text-[#005B33] hover:bg-red-50 hover:border-red-600 hover:text-red-600 flex items-center justify-center gap-2 transition-colors bg-transparent"
                    >
                        Відхилити
                    </button>
                </div> */}
                {/* Кнопки дій */}
                <div className="flex items-center gap-3 w-full">
                    <button
                        type="button"
                        onClick={onToggleApprove}
                        className={`flex-1 h-[40px] rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors ${review.approved
                            ? "bg-amber-600 hover:bg-amber-700 text-white"
                            : "bg-[#005B33] hover:bg-[#004728] text-white"
                            }`}
                    >
                        {review.approved ? "Зняти з публікації" : "Погодити"}
                    </button>

                    <button
                        type="button"
                        onClick={async () => {
                            if (await showConfirm("Видалити цей відгук назавжди? Дію не можна скасувати.")) {
                                onDelete();
                            }
                        }}
                        className="flex-1 h-[40px] rounded-lg font-medium text-sm border border-red-600 text-red-600 hover:bg-red-50 flex items-center justify-center gap-2 transition-colors bg-transparent"
                    >
                        Видалити
                    </button>
                </div>
            </div>
        </div>
    );
}