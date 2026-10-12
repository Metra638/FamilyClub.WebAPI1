"use client";

import Link from "next/link";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

type Props = {
    href: string;
};

export default function MoreShelfButton({ href }: Props) {
    const t = useTranslations();

    return (
        <Link
            href={href}
            className="
        hidden min-[900px]:flex
        group/more pointer-events-auto relative overflow-visible
        h-[55px] w-[150px] flex-col items-center justify-start
        rounded-t-none rounded-b-[36px]
        bg-[var(--background-elevated)] pt-4
        text-[24px] font-medium leading-none text-[var(--foreground-primary)]
        shadow-[0px_6px_8px_0px_rgba(0,0,0,0.3)]
        transition-[height,box-shadow] duration-200 ease-out
        hover:h-[80px] hover:shadow-[0px_10px_12px_0px_rgba(0,0,0,0.35)]
      "
        >
            {/* Площина на полиці */}
            <span
                aria-hidden
                className="
                    pointer-events-none absolute left-0 right-0 bottom-full z-0
                    h-[60px] w-full
                    origin-bottom
                    skew-x-[28deg]
                    bg-[var(--background-elevated)]
                    shadow-[0_-1px_0_rgba(0,0,0,0.06)]
                "
            />
            <span className="relative z-10">{t("home.sections.more")}</span>
            <span
                aria-hidden
                className="
                    mt-2 flex items-center justify-center
                    opacity-0 transition-opacity duration-200
                    group-hover/more:opacity-100
                    text-[color-mix(in_srgb,var(--color-muted-fg)_65%,white)]
                "
            >
                <svg
                    width="28"
                    height="20"
                    viewBox="0 0 28 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M2 10h20M16 4l6 6-6 6"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </span>
        </Link>
    );
}