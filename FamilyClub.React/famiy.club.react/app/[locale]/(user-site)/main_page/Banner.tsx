"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";

const BANNER_IMAGES = {
    uk: "/images/body/Banner-uk.webp",
    en: "/images/body/Banner-en.webp",
} as const;

const BANNER_TEXT = {
    uk: "Нові книги вже тут",
    en: "New books are here",
} as const;

export default function Banner() {
    const { locale } = useLocale();
    const bannerSrc = BANNER_IMAGES[locale];

    return (
        <section className="px-8 py-10">
            <div
                className="bg-cover rounded-2xl h-[200px] flex items-center justify-center text-white text-2xl font-bold"
                style={{ backgroundImage: `url('${bannerSrc}')` }}
            >
                {BANNER_TEXT[locale]}
            </div>
        </section>
    );
}
