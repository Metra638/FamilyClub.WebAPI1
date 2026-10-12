"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";

const TORN_PAPER_SRC = "/images/body/Rectangle287.png";

const ABOUT_HOME_IMAGES = {
    uk: "/images/body/Rectangle%20294-uk.webp",
    en: "/images/body/Rectangle%20294-en.webp",
} as const;

export default function AboutSection() {
    const { locale, dictionary } = useLocale();
    const about = dictionary.home.about;
    const homeImageSrc = ABOUT_HOME_IMAGES[locale];

    return (
        <section className="relative z-20 -mt-10 overflow-visible pt-16 pb-8">
            {/*
              Extra horizontal room: main uses overflow-x-hidden (which also clips
              vertical paint), so shadow + banner need space inside the clip box.
            */}
            <div className="relative mx-auto max-w-[1700px] overflow-visible px-6 md:px-10">
                <div className="about-papyrus relative mx-auto w-full max-w-[1260px] overflow-visible py-6">
                    {/*
                      Papyrus PNG already has alpha deckle edges — drop-shadow on the
                      <img> follows that silhouette (no luminance mask / no box frame).
                    */}
                    <img
                        src={TORN_PAPER_SRC}
                        alt=""
                        aria-hidden
                        className="about-papyrus-sheet pointer-events-none absolute inset-y-6 inset-x-0 z-0 h-[calc(100%-3rem)] w-full object-fill"
                    />

                    {/* pt: was 48px (py-12) → +30px = 78px */}
                    <div className="relative z-10 px-6 pt-[78px] pb-10 text-[var(--foreground-primary)] md:px-[85px]">
                        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16 2xl:gap-x-[170px]">
                            <div className="min-w-0 max-w-[460px]">
                                <h3 className="font-mono text-[36px] font-semibold text-[var(--foreground-primary)]">
                                    {about.wideChoiceTitle}
                                </h3>
                                <p className="mt-4 whitespace-pre-line text-left text-[20px] leading-[1.6]">
                                    {about.wideChoiceText}
                                </p>
                            </div>
                            <div className="min-w-0 max-w-[460px] lg:justify-self-end">
                                <h3 className="font-mono text-[32px] font-semibold text-[var(--foreground-primary)]">
                                    {about.promosTitle}
                                </h3>
                                <p className="mt-4 whitespace-pre-line text-left text-[20px] leading-[1.6]">
                                    {about.promosText}
                                </p>
                            </div>
                        </div>

                        {/*
                          Asset has ~13% transparent padding, so the box must be clearly
                          wider than the papyrus for the painted banner to stick out.
                        */}
                        <div className="relative z-20 mt-10 flex justify-center overflow-visible">
                            <img
                                alt={about.homeImageAlt}
                                className="about-home-banner h-auto w-[min(1580px,134%)] max-w-none shrink-0 rotate-[-2.5deg]"
                                src={homeImageSrc}
                            />
                        </div>

                        <div className="mx-auto mt-10 max-w-[1090px] text-left text-[20px] leading-[1.6]">
                            {about.story.map((paragraph, index) => (
                                <p key={index} className={index > 0 ? "mt-6" : undefined}>
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
