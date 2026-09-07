"use client";

import Image from "next/image";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

type NotificationState = {
    comments: boolean;
    likes: boolean;
    assistant: boolean;
    messages: boolean;
};

type Props = {
    notifications: NotificationState;
    setNotifications: (val: NotificationState) => void;
};

const ITEMS = [
    { key: "comments" as const, labelKey: "notifComments" as const, icon: "/images/userProfile/editUserProfile/comments-solid-full 1.png" },
    { key: "likes" as const, labelKey: "notifLikes" as const, icon: "/images/userProfile/editUserProfile/iconHeart.png" },
    { key: "assistant" as const, labelKey: "notifAssistant" as const, icon: "/images/userProfile/editUserProfile/paw-solid-full 1.png" },
    { key: "messages" as const, labelKey: "notifMessages" as const, icon: "/images/userProfile/editUserProfile/message-solid-full 1.png" },
];

export default function NotificationUser({ notifications, setNotifications }: Props) {
    const t = useTranslations();

    const toggle = (key: keyof NotificationState) => {
        setNotifications({ ...notifications, [key]: !notifications[key] });
    };

    return (
        <div className="flex flex-col gap-3">
            {ITEMS.map(({ key, labelKey, icon }) => {
                const name = t(`profileEdit.${labelKey}`);
                return (
                <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Image src={icon} alt={name} width={30} height={30} className="object-contain" />
                        <span className="text-[18px]">{name}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => toggle(key)}
                        className="flex-shrink-0"
                    >
                        <img
                            src={
                                notifications[key]
                                    ? "/images/userProfile/editUserProfile/radio_button_checked_24px.png"
                                    : "/images/userProfile/editUserProfile/iconSircle.png"
                            }
                            alt="toggle"
                            className={`w-[28px] h-[28px] object-contain transition-transform duration-200
        ${notifications[key] ? "scale-125 -mr-[6px] w-[30px] h-[30px]" : "scale-90 "}`}
                        />
                    </button>
                </div>
            )})}
        </div>
    );
}
