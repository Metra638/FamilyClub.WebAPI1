"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";

const ABOUT_ATMOSPHERE_IMAGES = {
    uk: "/images/body/Rectangle%20296-uk.webp",
    en: "/images/body/Rectangle%20296-en.webp",
} as const;

const ABOUT_READING_HALL_IMAGES = {
    uk: "/images/body/Rectangle%20295-uk.webp",
    en: "/images/body/Rectangle%20295-en.webp",
} as const;

const advantageIcons = [
    "/images/main_page/advantages/advantages-icon-1.png",
    "/images/main_page/advantages/advantages-icon-2.png",
    "/images/main_page/advantages/advantages-icon-3.png",
    "/images/main_page/advantages/advantages-icon-4.png",
];

type AdvantageCardProps = {
    title: string;
    description: string;
    icon: string;
};

function AdvantageCard({ title, description, icon }: AdvantageCardProps) {
    return (
        /*
          Whole card slides as one unit on hover (same speed).
          Description sits in the top zone tucked under the brown band when collapsed;
          icon stays fully visible below that tuck — no separate icon animation.
        */
        <div className="advantage-card group relative h-[420px] w-[250px] text-center text-[var(--color-cream)] transition-transform duration-300 ease-out will-change-transform hover:translate-y-16">
            <img
                alt=""
                className="absolute inset-0 h-full w-full object-fill"
                src="/images/main_page/advantages/advantages-card-bg.png"
            />

            <div className="relative z-[1] flex h-full flex-col items-center px-3 pt-5 pb-12">
                <p className="w-[210px] shrink-0 text-[14px] leading-[1.35] text-[var(--color-cream)] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    {description}
                </p>

                {/* Extra gap so the drawing isn’t cramped / clipped under the brown edge */}
                <img
                    alt=""
                    className="mt-8 h-[170px] w-[170px] shrink-0 object-contain"
                    src={icon}
                />

                <p className="mt-auto w-[200px] whitespace-pre-line font-mono text-[22px] font-semibold leading-[1.2] text-[var(--color-cream)] drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                    {title}
                </p>
            </div>
        </div>
    );
}

export default function AdvantagesSection() {
    const { locale, dictionary } = useLocale();
    const advantages = dictionary.home.advantages;
    const about = dictionary.home.about;
    const atmosphereImageSrc = ABOUT_ATMOSPHERE_IMAGES[locale];
    const readingHallImageSrc = ABOUT_READING_HALL_IMAGES[locale];

    return (
        <section className="relative z-[5] overflow-visible pb-24 pt-0">
            {/*
              Brown under papyrus (About is z-20). Polaroids ~10% tucked under it;
              slide down on hover.
            */}
            <div className="relative z-[5] mx-auto max-w-[1140px] -mt-28 overflow-visible rounded-[18px] bg-[var(--color-wood)] px-6 pb-10 pt-6 md:px-10">
                <div className="relative z-[15] -mt-[48px] mb-6 flex flex-wrap items-start justify-center gap-6 md:-mt-[56px] md:mb-8 md:gap-14">
                    <img
                        alt={about.readingHallAlt}
                        className="advantages-polaroid h-auto w-[350px] max-w-[48%] origin-center rotate-[16deg] object-contain transition-transform duration-500 ease-out will-change-transform hover:z-20 hover:translate-y-6 md:w-[476px] md:max-w-none md:hover:translate-y-8"
                        src={readingHallImageSrc}
                    />
                    <img
                        alt={about.libraryAtmosphereAlt}
                        className="advantages-polaroid h-auto w-[322px] max-w-[46%] origin-center rotate-[-7deg] object-contain transition-transform duration-500 ease-out will-change-transform hover:z-20 hover:translate-y-6 md:w-[448px] md:max-w-none md:hover:translate-y-8"
                        src={atmosphereImageSrc}
                    />
                </div>

                <h2 className="relative z-[6] mt-4 text-center font-mono text-[40px] font-bold text-[var(--foreground-primary)] md:mt-8 md:text-[56px]">
                    {advantages.title}
                </h2>
            </div>

            {/* Slightly tighter card gap so side insets read clearly */}
            <div className="relative z-0 mx-auto mt-[-78px] flex max-w-[1260px] flex-wrap justify-center gap-4 px-8 md:gap-8 md:px-14">
                {advantages.items.map((item, index) => (
                    <AdvantageCard
                        key={item.title}
                        title={item.title}
                        description={item.description}
                        icon={advantageIcons[index] ?? advantageIcons[0]}
                    />
                ))}
            </div>
        </section>
    );
}
