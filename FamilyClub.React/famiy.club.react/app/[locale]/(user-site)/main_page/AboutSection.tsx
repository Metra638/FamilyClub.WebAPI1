"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";

const ABOUT_HOME_IMAGES = {
    uk: "/images/body/Rectangle%20294-uk.webp",
    en: "/images/body/Rectangle%20294-en.webp",
} as const;

const ABOUT_ATMOSPHERE_IMAGES = {
    uk: "/images/body/Rectangle%20296-uk.webp",
    en: "/images/body/Rectangle%20296-en.webp",
} as const;

const ABOUT_READING_HALL_IMAGES = {
    uk: "/images/body/Rectangle%20295-uk.webp",
    en: "/images/body/Rectangle%20295-en.webp",
} as const;

export default function AboutSection() {
    const { locale, dictionary } = useLocale();
    const about = dictionary.home.about;
    const homeImageSrc = ABOUT_HOME_IMAGES[locale];
    const atmosphereImageSrc = ABOUT_ATMOSPHERE_IMAGES[locale];
    const readingHallImageSrc = ABOUT_READING_HALL_IMAGES[locale];

    return (
        <section className="relative z-10 pt-16 pb-0">
            <div className="mx-auto max-w-[1920px]">
                <div className="relative mx-auto w-full max-w-[1260px] overflow-hidden border-[15px] border-[#f5f3ee] bg-[#f5f3ee] shadow-[0px_0px_20px_0px_rgba(0,0,0,0.9)] rounded-[20px]">
                    <img
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover opacity-20"
                        src="/images/body/Rectangle%20287.webp"
                    />
                    <div className="relative px-6 py-10 md:px-[85px]">
                        <div className="grid gap-10 md:grid-cols-[460px_460px] md:gap-[170px]">
                            <div>
                                <h3 className="font-mono text-[36px] font-semibold text-[#242424]">{about.wideChoiceTitle}</h3>
                                <p className="mt-4 whitespace-pre-line text-[20px] leading-[1.6] text-left">
                                    {about.wideChoiceText}
                                </p>
                            </div>
                            <div>
                                <h3 className="font-mono text-[32px] font-semibold text-[#242424]">{about.promosTitle}</h3>
                                <p className="mt-4 whitespace-pre-line text-[20px] leading-[1.6] text-left">
                                    {about.promosText}
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-center">
                            <img
                                alt={about.homeImageAlt}
                                className="w-full max-w-[1472px] rotate-[-1.5deg] rounded-[30px] shadow-[0px_0px_15px_0px_rgba(0,0,0,0.95)]"
                                src={homeImageSrc}
                            />
                        </div>

                        <div className="mx-auto mt-10 max-w-[1090px] text-[20px] leading-[1.6] text-left">
                            {about.story.map((paragraph, index) => (
                                <p key={index} className={index > 0 ? "mt-6" : undefined}>
                                    {paragraph}
                                </p>
                            ))}
                        </div>

                        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 pb-6 md:gap-16">
                            <div className="relative h-[300px] w-[260px] rotate-[12deg] shadow-[0px_15px_25px_rgba(0,0,0,0.5)] transition-transform hover:z-20 hover:scale-105 md:h-[420px] md:w-[380px]">
                                <img
                                    alt={about.readingHallAlt}
                                    className="h-full w-full rounded-[4px] border-[16px] border-[#f5f3ee] object-cover shadow-inner md:border-[24px]"
                                    src={readingHallImageSrc}
                                />
                            </div>
                            <div className="relative h-[300px] w-[260px] rotate-[-5deg] shadow-[0px_15px_25px_rgba(0,0,0,0.5)] transition-transform hover:z-20 hover:scale-105 md:h-[400px] md:w-[360px]">
                                <img
                                    alt={about.libraryAtmosphereAlt}
                                    className="h-full w-full rounded-[4px] border-[16px] border-[#f5f3ee] object-cover shadow-inner md:border-[24px]"
                                    src={atmosphereImageSrc}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
