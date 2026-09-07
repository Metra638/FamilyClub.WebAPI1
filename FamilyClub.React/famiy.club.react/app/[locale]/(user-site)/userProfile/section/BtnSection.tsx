"use client";

import { TabType } from "../page";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

type Props = {
    activeTab: TabType | null;
    onTabChange: (tab: TabType | null) => void;
};

export default function BtnSection({ activeTab, onTabChange }: Props) {
    const t = useTranslations();

    const buttons: { label: string; tab: TabType }[] = [
        { label: t("profile.tabs.myBooks"), tab: "myBooks" },
        { label: t("profile.tabs.favorite"), tab: "favorite" },
        { label: t("profile.tabs.myPosts"), tab: "myPosts" },
    ];

    return (
        <div className="flex flex-row -mt-[26px] w-[1300px] h-[150px] p-0 m-0">
            {buttons.map(({ label, tab }) => {
                const isSelected = activeTab === tab;
                return (
                    <button
                        key={tab}
                        onClick={() => {
                            if (activeTab === tab) {
                                onTabChange(null);
                            } else {
                                onTabChange(tab);
                            }
                        }}
                        type="button"
                        className="group relative w-[433px] h-[118px] -mr-[32px] p-0 cursor-pointer overflow-visible"
                    >
                        {/* Фон*/}
                        <div
                            className={`
                                absolute inset-0 origin-top bg-no-repeat
                                transition-transform duration-500
                                ease-[cubic-bezier(0.22,1,0.36,1)]
                                group-hover:scale-y-[1.27]
                                ${isSelected
                                    ? "scale-y-[1.27] bg-[url('/images/userProfile/Rectangle-389.png')]"
                                    : "bg-[url('/images/userProfile/Rectangle-389.png')] group-hover:bg-[url('/images/userProfile/Rectangle-389.png')]"
                                }
                            `}
                            style={{ backgroundSize: "100% 100%" }}
                        />

                        {/* Текст*/}
                        <div
                            className={`
                                absolute inset-0 z-10 flex items-end justify-center pb-[50px] pointer-events-none
                                transition-transform duration-500
                                ease-[cubic-bezier(0.22,1,0.36,1)]
                                group-hover:translate-y-[32px]
                                ${isSelected ? "translate-y-[32px]" : ""}
                            `}
                        >
                            <span className="text-[var(--color-white)] text-[22px] font-bold">
                                {label}
                            </span>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
