"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import type { NotificationDTO } from "@/lib/api/generated/models";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

type NotificationThreadProps = {
    open: boolean;
    onClose: () => void;
    messages: NotificationDTO[];
    currentUserId?: string;
    threadOwnerId?: string;

    title?: string;

    avatarSrc?: string;
    avatarFallback?: string;

    formatDate: (date?: Date) => string;

    onSend: (text: string) => Promise<void> | void;
};

function Avatar({
    src,
    fallback,
}: {
    src?: string;
    fallback?: string;
}) {
    return src ? (
        <img
            src={src}
            alt=""
            className="w-8 h-8 rounded-full object-cover shrink-0"
        />
    ) : (
        <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center text-sm shrink-0">
            {fallback ?? "👤"}
        </div>
    );
}

export default function NotificationThread({
    open,
    onClose,
    messages,
    currentUserId,
    threadOwnerId,
    title,
    avatarSrc,
    avatarFallback,
    formatDate,
    onSend,
}: NotificationThreadProps) {
    const t = useTranslations();
    const [draft, setDraft] = useState("");
    const [sending, setSending] = useState(false);

    const resolvedTitle = title ?? t("notifications.threadTitle");

    const sorted = [...messages].sort(
        (a, b) =>
            new Date(a.createdAt ?? 0).getTime() -
            new Date(b.createdAt ?? 0).getTime()
    );

    const handleSend = async () => {
        if (!draft.trim() || sending) return;

        setSending(true);

        try {
            await onSend(draft);
            setDraft("");
        } finally {
            setSending(false);
        }
    };

    function resolveLabel(
        senderId: string | null | undefined,
        currentUserId?: string,
        threadOwnerId?: string
    ) {
        if (!senderId || senderId === currentUserId) {
            return null;
        }

        if (senderId === threadOwnerId) {
            return t("notifications.userLabel");
        }

        return t("notifications.adminLabel");
    }

    return (
        <Transition show={open} as={Fragment}>
            <Dialog onClose={onClose} className="relative z-50">

                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-150"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div
                        className="fixed inset-0 bg-black/30"
                        aria-hidden="true"
                    />
                </Transition.Child>

                <div className="fixed inset-0 flex items-center justify-center p-4">

                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-150"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-100"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <Dialog.Panel
                            className="
                                w-full
                                max-w-[520px]
                                h-[600px]
                                max-h-[80vh]
                                flex
                                flex-col
                                bg-[#F5F3EE]
                                rounded-[26px]
                                shadow-[0px_0px_15px_0px_#242424CC]
                                overflow-hidden
                            "
                        >

                            {/* HEADER */}
                            <div className="flex items-center gap-3 px-5 py-4 border-b border-black/10 shrink-0">

                                <Avatar
                                    src={avatarSrc}
                                    fallback={avatarFallback}
                                />

                                <Dialog.Title className="font-bold text-[16px]">
                                    {resolvedTitle}
                                </Dialog.Title>

                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="
                                        ml-auto
                                        text-black/50
                                        hover:text-black
                                        text-xl
                                        leading-none
                                        px-2
                                    "
                                    aria-label={t("notifications.closeAria")}
                                >
                                    ×
                                </button>
                            </div>

                            {/* MESSAGES */}
                            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">

                                {sorted.length === 0 ? (
                                    <p className="text-black/50 text-sm text-center py-6">
                                        {t("notifications.threadEmpty")}
                                    </p>
                                ) : (
                                    sorted.map((m) => {

                                        const isMine =
                                            m.senderId === currentUserId;

                                        const label =
                                            resolveLabel(
                                                m.senderId,
                                                currentUserId,
                                                threadOwnerId
                                            );

                                        return (
                                            <div
                                                key={m.id}
                                                className={`
                                                    flex
                                                    flex-col
                                                    max-w-[85%]
                                                    ${
                                                        isMine
                                                            ? "self-end items-end"
                                                            : "self-start items-start"
                                                    }
                                                `}
                                            >

                                                {label && (
                                                    <span className="text-xs font-medium text-black/50 mb-1 px-1">
                                                        {label}
                                                    </span>
                                                )}

                                                <div
                                                    className={`
                                                        flex
                                                        items-end
                                                        gap-2
                                                        ${
                                                            isMine
                                                                ? "flex-row-reverse"
                                                                : ""
                                                        }
                                                    `}
                                                >

                                                    {isMine ? (
                                                        <Avatar
                                                            src={avatarSrc}
                                                            fallback={avatarFallback}
                                                        />
                                                    ) : (
                                                        <div className="
                                                            w-8
                                                            h-8
                                                            rounded-full
                                                            bg-[#1e5631]/10
                                                            flex
                                                            items-center
                                                            justify-center
                                                            text-sm
                                                            shrink-0
                                                        ">
                                                            🛎️
                                                        </div>
                                                    )}

                                                    <div
                                                        className={`
                                                            px-4
                                                            py-2
                                                            shadow-sm
                                                            rounded-2xl
                                                            ${
                                                                isMine
                                                                    ? "bg-[#1e5631] text-white rounded-br-sm"
                                                                    : "bg-white text-black/80 rounded-tl-sm"
                                                            }
                                                        `}
                                                    >
                                                        <p className="text-sm">
                                                            {m.text}
                                                        </p>

                                                        <span
                                                            className={`
                                                                text-[11px]
                                                                block
                                                                mt-1
                                                                ${
                                                                    isMine
                                                                        ? "text-white/70"
                                                                        : "text-black/40"
                                                                }
                                                            `}
                                                        >
                                                            {formatDate(
                                                                m.createdAt
                                                            )}
                                                        </span>
                                                    </div>

                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* INPUT */}
                            <div className="flex items-center gap-2 px-4 py-3 border-t border-black/10 shrink-0">

                                <input
                                    type="text"
                                    value={draft}
                                    onChange={(e) =>
                                        setDraft(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                        if (
                                            e.key === "Enter" &&
                                            !e.shiftKey
                                        ) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    placeholder={t("notifications.threadPlaceholder")}
                                    className="
                                        flex-1
                                        rounded-full
                                        bg-white
                                        px-4
                                        py-2
                                        text-sm
                                        outline-none
                                        border
                                        border-black/10
                                        focus:border-[#1e5631]
                                    "
                                />

                                <button
                                    type="button"
                                    onClick={handleSend}
                                    disabled={
                                        !draft.trim() || sending
                                    }
                                    className="
                                        shrink-0
                                        rounded-full
                                        bg-[#1e5631]
                                        text-white
                                        px-4
                                        py-2
                                        text-sm
                                        font-medium
                                        disabled:opacity-40
                                    "
                                >
                                    {sending
                                        ? t("notifications.sending")
                                        : t("notifications.send")}
                                </button>

                            </div>

                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
}
