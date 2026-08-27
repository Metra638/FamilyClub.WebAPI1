"use client";

type ReviewCardProps = {
    reviewerName: string;
    reviewerAvatarSrc?: string;
    time: string;
    text: string;
    coverSrc?: string;
    bookTitle?: string;
    actionLabel?: string;
    onAction?: () => void;
};

export default function ReviewCard({
    reviewerName,
    reviewerAvatarSrc,
    time,
    text,
    coverSrc,
    bookTitle,
    actionLabel = "переглянути відгук",
    onAction,
}: ReviewCardProps) {
    return (
        <div
            className="w-full max-w-[420px] text-left drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex items-start gap-3 justify-between"
            style={{
                backgroundImage: "url('/images/notifications/Rectangle 431.png')",
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
                padding: "24px 24px 20px 24px",
                minHeight: "150px",
            }}
        >
            {reviewerAvatarSrc ? (
                <img
                    src={reviewerAvatarSrc}
                    alt={reviewerName}
                    className="w-9 h-9 rounded-full object-cover shrink-0 border border-[#d4cbbd]"
                />
            ) : (
                <div className="w-9 h-9 rounded-full bg-black/10 text-black/60 flex items-center justify-center text-xs font-bold shrink-0">
                    {reviewerName?.[0]?.toUpperCase() ?? "👤"}
                </div>
            )}

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-bold text-[15px] text-black truncate">
                        {reviewerName}
                    </h3>
                    <span className="text-[11px] font-medium text-black/50 shrink-0">
                        {time}
                    </span>
                </div>

                <p className="text-[13px] text-black/75 leading-snug line-clamp-3 mb-2 font-sans">
                    {text}
                </p>

                {actionLabel && (
                    <button
                        onClick={onAction}
                        className="text-[13px] font-medium text-[#1e5631] hover:underline"
                    >
                        {actionLabel}
                    </button>
                )}
            </div>

            {coverSrc && (
                <img
                    src={coverSrc}
                    alt={bookTitle ?? ""}
                    className="w-[44px] h-[62px] object-cover rounded shrink-0 shadow-sm border border-[#e5ded4]"
                />
            )}
        </div>
    );
}