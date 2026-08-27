"use client";

import { useEffect, useMemo, useState } from "react";
import LeftBlock from "./components/LeftBlock";
import NotificationThreadCard from "./components/NotificationThreadCard";
import NotificationThread from "./components/NotificationThread";
import useReviews from "../../(admin-site)/admin/reviews/hooks/useReviews";
import useNotifications from "./hooks/useNotifications";
import { useCurrentUser } from "../userProfile/hooks/useCurrentUser";
import Image from "next/image";
import ReviewCard from "./components/ReviewCard";

const TABS = [
    { label: "Усі" },
    { label: "Відгуки" },
    { label: "Повідомлення" },
];

function formatDate(date?: Date) {
    if (!date) return "";
    return new Date(date).toLocaleString("uk-UA", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function NotificationsPage() {
    const [activeTab, setActiveTab] = useState("Усі");
    const [threadOpen, setThreadOpen] = useState(false);

    const { user } = useCurrentUser();
    const { reviews, loadingReviews } = useReviews();
    const {
        notifications,
        loadingNotifications,
        markAllAsRead,
        sendMessage } = useNotifications(user?.id);

    useEffect(() => {
        document.body.style.backgroundImage = "url('/images/authorsUserPage/Rectangle 326.png')";
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundAttachment = "fixed";
        document.body.style.backgroundPosition = "center";
        document.body.style.backgroundRepeat = "no-repeat";

        return () => {
            document.body.style.backgroundImage = "";
            document.body.style.backgroundSize = "";
            document.body.style.backgroundAttachment = "";
            document.body.style.backgroundPosition = "";
            document.body.style.backgroundRepeat = "";
        };
    }, []);

    const isLoading = loadingReviews || loadingNotifications;

    const reviewItems = useMemo(
        () =>
            reviews
        .filter((r) => r.userId === user?.id)
        .map((r) => {
                const coverImage = r.productImages?.[0]?.imageData;
                return {
                    key: `review-${r.id}`,
                    reviewerName: r.userName ?? "Користувач",
                    reviewerAvatarSrc: r.userAvatarData
                        ? r.userAvatarData.startsWith("data:")
                            ? r.userAvatarData
                            : `data:image/jpeg;base64,${r.userAvatarData}`
                        : undefined,
                    time: formatDate(new Date(r.createdAt)),
                    text: r.comment ?? "",
                    coverSrc: coverImage
                        ? coverImage.startsWith("data:")
                            ? coverImage
                            : `data:image/jpeg;base64,${coverImage}`
                        : undefined,
                    bookTitle: r.productName ?? undefined,
                    actionLabel: "переглянути відгук",
                };
            }),
        [reviews, user?.id]
    );

    const avatarSrc = user?.avatarData
        ? user.avatarData.startsWith("data:")
            ? user.avatarData
            : `data:image/jpeg;base64,${user.avatarData}`
        : undefined;

    const avatarFallback = !avatarSrc ? (user?.name?.[0] ?? "👤") : undefined;

    const unreadCount = notifications.filter(
        (n) => !n.isRead && n.senderId !== user?.id
    ).length;

    // останнє за часом повідомлення для прев'ю на картці
    const lastNotification = useMemo(() => {
        if (notifications.length === 0) return null;
        return [...notifications].sort(
            (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
        )[0];
    }, [notifications]);

    const handleOpenThread = () => {
        setThreadOpen(true);
        markAllAsRead();
    };

    const visibleItems = useMemo(() => {
        if (activeTab === "Відгуки") return reviewItems;
        if (activeTab === "Повідомлення") return [];
        return reviewItems;
    }, [activeTab, reviewItems]);

    const showThreadCard =
        (activeTab === "Усі" || activeTab === "Повідомлення");

    return (
        <div className="w-full min-h-screen bg-[#f5f3ee] text-[#242424] font-sans overflow-x-hidden">
            {/* MOBILE NOTIFICATIONS VIEW (Figma Node 2199:4838 "Сповіщення" 1-to-1 spec) */}
            <div className="block md:hidden pt-[75px] pb-[100px] px-3 sm:px-4 max-w-[480px] mx-auto">
                <h1 className="font-mono text-[28px] font-bold text-[#242424] mb-3 leading-tight">
                    Сповіщення
                </h1>

                {/* Mobile Ribbon / Pill Tabs */}
                <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
                    {TABS.map((tab) => (
                        <button
                            key={tab.label}
                            type="button"
                            onClick={() => setActiveTab(tab.label)}
                            className={`px-4 py-2 rounded-full font-sans text-[14px] font-semibold transition-all shrink-0 shadow-sm ${
                                activeTab === tab.label
                                    ? "bg-[#005B33] text-white shadow-md"
                                    : "bg-white/80 text-[#242424] border border-gray-300 hover:bg-white"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Mobile Notification Cards Stack */}
                {isLoading ? (
                    <div className="text-center py-12 text-black/60 font-mono">
                        Завантаження сповіщень...
                    </div>
                ) : (
                    <div className="flex flex-col gap-3.5 items-center w-full">
                        {showThreadCard && (
                            lastNotification ? (
                                <NotificationThreadCard
                                    avatarSrc={avatarSrc}
                                    avatarFallback={avatarFallback}
                                    lastMessageText={lastNotification.text ?? ""}
                                    lastMessageTime={formatDate(lastNotification.createdAt)}
                                    unreadCount={unreadCount}
                                    onClick={handleOpenThread}
                                />
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleOpenThread}
                                    className="w-full text-left p-4 rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.1)] hover:bg-gray-50 transition border border-gray-200"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">✉️</span>
                                        <div>
                                            <p className="font-bold text-[15px] text-[#242424]">Написати адміністратору</p>
                                            <p className="text-[12px] text-gray-500">Натисніть для відкриття діалогу</p>
                                        </div>
                                    </div>
                                </button>
                            )
                        )}

                        {visibleItems.map(({ key, ...item }) => (
                            <ReviewCard key={key} {...item} />
                        ))}

                        {!showThreadCard && visibleItems.length === 0 && (
                            <div className="text-center py-12 text-black/60 font-serif">
                                Поки що немає сповіщень
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* DESKTOP NOTIFICATIONS VIEW */}
            <div className="hidden md:block">
                <div className="relative h-[800px] w-[1700px] ml-0 flex flex-col">
                    <Image
                        src="/images/notifications/Rectangle 419.png"
                        alt=""
                        fill
                        className="object-cover object-right pointer-events-none"
                    />

                    <div className="relative flex gap-8 mt-52">
                        <div className="w-[310px] shrink-0 flex flex-col gap-3 -ml-8">
                            {TABS.map((tab) => (
                                <LeftBlock
                                    key={tab.label}
                                    label={tab.label}
                                    active={activeTab === tab.label}
                                    onClick={() => setActiveTab(tab.label)}
                                />
                            ))}
                        </div>

                        <div className="flex-1 ml-14">
                            {isLoading ? (
                                <div className="text-center py-8 text-black/60">
                                    Завантаження...
                                </div>
                            ) : activeTab === "Усі" ? (
                                <div className="grid grid-cols-2 gap-0 items-start">
                                    {/* ПОВІДОМЛЕННЯ */}
                                    <div className="flex flex-col gap-4">
                                        {lastNotification ? (
                                            <NotificationThreadCard
                                                avatarSrc={avatarSrc}
                                                avatarFallback={avatarFallback}
                                                lastMessageText={lastNotification.text ?? ""}
                                                lastMessageTime={formatDate(lastNotification.createdAt)}
                                                unreadCount={unreadCount}
                                                onClick={handleOpenThread}
                                            />
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleOpenThread}
                                                className="text-left w-[80%] p-4 rounded-2xl bg-white/70 hover:bg-white shadow-[0_0_20px_rgba(80,137,190,0.6)] transition text-black/70"
                                            >
                                                ✉️ Написати повідомлення адміну
                                            </button>
                                        )}
                                    </div>

                                    {/* ВІДГУКИ */}
                                    <div className="flex flex-col gap-4">
                                        {reviewItems.map(({ key, ...item }) => (
                                            <ReviewCard key={key} {...item} />
                                        ))}

                                        {reviewItems.length === 0 && (
                                            <div className="text-center py-8 text-black/60">
                                                Тут поки що порожньо
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4 ml-4">
                                    {showThreadCard && (
                                        lastNotification ? (
                                            <NotificationThreadCard
                                                avatarSrc={avatarSrc}
                                                avatarFallback={avatarFallback}
                                                lastMessageText={lastNotification.text ?? ""}
                                                lastMessageTime={formatDate(lastNotification.createdAt)}
                                                unreadCount={unreadCount}
                                                onClick={handleOpenThread}
                                            />
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleOpenThread}
                                                className="text-left w-[30%] p-4 rounded-2xl bg-white/70 hover:bg-white shadow-[0_0_20px_rgba(80,137,190,0.6)] transition text-black/70"
                                            >
                                                ✉️ Написати повідомлення адміну
                                            </button>
                                        )
                                    )}

                                    {visibleItems.map(({ key, ...item }) => (
                                        <ReviewCard key={key} {...item} />
                                    ))}

                                    {!showThreadCard && visibleItems.length === 0 && (
                                        <div className="text-center py-8 text-black/60">
                                            Тут поки що порожньо
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <NotificationThread
                open={threadOpen}
                onClose={() => setThreadOpen(false)}
                messages={notifications}
                currentUserId={user?.id}
                threadOwnerId={user?.id}
                avatarSrc={avatarSrc}
                avatarFallback={avatarFallback}
                formatDate={formatDate}
                onSend={(text) => sendMessage(text, user?.id ?? "", user?.id ?? "")}
            />
        </div>
    );
}