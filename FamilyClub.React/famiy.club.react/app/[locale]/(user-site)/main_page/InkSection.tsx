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
        <section className="py-16">
            <div className="mx-auto max-w-[1504px] px-4 lg:px-0">
                <div className="grid items-center gap-10 lg:grid-cols-[832px_590px] lg:gap-[82px]">
                    <div className="flex justify-center lg:justify-start">
                        <div className="rotate-[-2deg] border-[20px] border-[#f5f3ee] shadow-[0px_0px_15px_rgba(0,0,0,0.6)]">
                            <img
                                alt={ink.imageAlt}
                                className="h-[571px] w-[832px] object-cover"
                                src={catSrc}
                            />
                        </div>
                    </div>

                    <div className="max-w-[590px] text-[#242424] font-serif">
                        <p className="text-[32px] font-bold leading-[1.2] text-[#407b61]">
                            {ink.line1}
                        </p>
                        <p className="text-[32px] font-bold leading-[1.2] text-[#407b61]">
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
