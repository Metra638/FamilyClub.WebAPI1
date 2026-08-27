"use client";

type NotificationThreadCardProps = {
    avatarSrc?: string;
    avatarFallback?: string;
    lastMessageText: string;
    lastMessageTime: string;
    unreadCount: number;
    onClick: () => void;
};

export default function NotificationThreadCard({
    avatarSrc,
    avatarFallback,
    lastMessageText,
    lastMessageTime,
    unreadCount,
    onClick,
}: NotificationThreadCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="w-full max-w-[420px] text-left transition-transform active:scale-[0.98] drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:drop-shadow-[0_6px_16px_rgba(0,0,0,0.15)] flex flex-col justify-between"
            style={{
                backgroundImage: "url('/images/notifications/Rectangle 431.png')",
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
                padding: "24px 24px 20px 24px",
                minHeight: "150px",
            }}
        >
            {/* Top row: Avatar, Title, Timestamp */}
            <div className="flex items-center justify-between gap-2 mb-1.5 w-full">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                        {avatarSrc ? (
                            <img
                                src={avatarSrc}
                                alt="Повідомлення"
                                className="w-9 h-9 rounded-full object-cover border border-[#d4cbbd]"
                            />
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center text-sm font-bold text-black/70">
                                {avatarFallback ?? "👤"}
                            </div>
                        )}
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[16px] h-[16px] rounded-full flex items-center justify-center px-1">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <h3 className="font-bold text-[16px] text-black truncate">
                        Повідомлення
                    </h3>
                </div>
                {lastMessageTime && (
                    <span className="text-[11px] font-medium text-black/50 shrink-0">
                        {lastMessageTime}
                    </span>
                )}
            </div>

            {/* Message preview text */}
            <p className="text-[13px] text-black/75 leading-snug my-1.5 line-clamp-2 w-full">
                {lastMessageText || "Немає вмісту повідомлення"}
            </p>

            {/* Bottom action link */}
            <div className="mt-1">
                <span className="text-[13px] font-medium text-[#1e5631] hover:underline">
                    переглянути
                </span>
            </div>
        </button>
    );
}