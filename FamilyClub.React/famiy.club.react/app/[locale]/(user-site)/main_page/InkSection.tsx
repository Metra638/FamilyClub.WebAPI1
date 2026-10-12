"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";

const CAT_IMAGES = {
    uk: "/images/body/cat-uk.webp",
    en: "/images/body/cat-en.webp",
} as const;

export default function InkSection() {
    const { locale, dictionary } = useLocale();
    const ink = dictionary.home.ink;
    const catSrc = CAT_IMAGES[locale];

    return (
        <section className="relative z-[5] py-16 pb-6">
            <div className="mx-auto max-w-[1504px] px-4 lg:px-0">
                <div className="grid items-center gap-10 lg:grid-cols-[832px_590px] lg:gap-[82px]">
                    <div className="relative z-[1] flex justify-center overflow-visible lg:justify-start">
                        
                        <img
                            alt={ink.imageAlt}
                            className="ink-cat-photo h-auto w-full max-w-[832px] rotate-[-2.5deg] object-contain"
                            src={catSrc}
                        />
                    </div>

                    <div className="max-w-[590px] text-[var(--foreground-primary)] font-serif">
                        <p className="text-[32px] font-bold leading-[1.2] text-[var(--ink-section-accent)]">
                            {ink.line1}
                        </p>
                        <p className="text-[32px] font-bold leading-[1.2] text-[var(--ink-section-accent)]">
                            {ink.line2}
                        </p>
                        <p className="mt-4 text-[20px] leading-[1.6]">
                            {ink.intro}
                        </p>
                        <p className="mt-4 text-[20px] leading-[1.6]">
                            {ink.helperParagraph}
                        </p>
                        <p className="mt-4 text-[20px] leading-[1.6]">
                            {ink.bellParagraph}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
