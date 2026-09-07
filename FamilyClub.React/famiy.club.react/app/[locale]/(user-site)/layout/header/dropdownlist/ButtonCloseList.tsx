"use client";

import Image from "next/image";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

interface ButtonCloseListProps {
    isOpen: boolean;
    onToggle: () => void;
}

export default function ButtonCloseList({ isOpen, onToggle }: ButtonCloseListProps) {
    const t = useTranslations();

    return (
        <div
            className="flex relative z-10 pointer-events-none"
            style={{ width: 60, top: 160 }}
        >
            <div
                className="relative transition-transform duration-300 pointer-events-none"
                style={{
                    width: 60,
                    height: 360,
                    transform: isOpen ? "translateY(-300px)" : "translateY(-298px)",
                }}
            >
                <Image
                    src="/images/header/Rectangle 144.svg"
                    alt=""
                    fill
                    className="object-contain pointer-events-none"
                />

                <button
                    onClick={onToggle}
                    className="absolute left-0 right-0 flex justify-center items-center z-10 pointer-events-auto"
                    style={{ bottom: 115, height: 40 }}
                    aria-label={isOpen ? t("header.collapseListAria") : t("header.expandListAria")}
                >
                    <Image
                        src="/images/header/Ellipse 9.png"
                        alt=""
                        width={28}
                        height={28}
                        className="pointer-events-none"
                    />
                    <Image
                        src="/images/header/angle-down-solid-full 1.png"
                        alt=""
                        width={24}
                        height={24}
                        className={`absolute transition-transform duration-300 pointer-events-none ${
                            isOpen ? "rotate-0" : "rotate-180"
                        }`}
                    />
                </button>
            </div>
        </div>
    );
}
