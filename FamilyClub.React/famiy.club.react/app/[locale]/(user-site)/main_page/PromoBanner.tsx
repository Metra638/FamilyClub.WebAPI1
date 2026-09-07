"use client";

import Link from "next/link";
import { useLocale, useLocalizedPath } from "@/lib/i18n/LocaleProvider";

type BannerItem = {
    title: string;
    subtitle?: string;
    href: string;
    backgroundImage: string;
};

type PromoBannerProps = {
    banners?: BannerItem[];
    title?: string;
    subtitle?: string;
    href?: string;
    backgroundImage?: string;
};

const BANNER_IMAGES = {
    uk: [
        "/images/body/banner-left-uk.webp",
        "/images/body/banner-middle-uk.webp",
        "/images/body/banner-right-uk.webp",
    ],
    en: [
        "/images/body/banner-left-en.webp",
        "/images/body/banner-middle-en.webp",
        "/images/body/banner-right-en.webp",
    ],
} as const;

const BANNER_SINGLE = {
    uk: "/images/body/banner-single-uk.webp",
    en: "/images/body/banner-single-en.webp",
} as const;

export default function PromoBanner({
    banners,
    title,
    subtitle,
    href,
    backgroundImage,
}: PromoBannerProps) {
    const { dictionary, locale } = useLocale();
    const lp = useLocalizedPath();
    const bannerImages = BANNER_IMAGES[locale];
    const singleBackground = backgroundImage ?? BANNER_SINGLE[locale];

    const defaultBanners: BannerItem[] = dictionary.home.promo.items.map((item, index) => ({
        title: item.title,
        subtitle: item.subtitle,
        href: lp("/categories"),
        backgroundImage: bannerImages[index] ?? bannerImages[0],
    }));

    const itemsToRender = title
        ? [{ title, subtitle, href: href ? lp(href) : lp("/categories"), backgroundImage: singleBackground }]
        : (banners ?? defaultBanners);

    return (
        <section className="py-12">
            <div className="mx-auto max-w-[1920px] px-4 min-[1600px]:px-[100px]">
                <div className={`grid gap-6 ${itemsToRender.length === 3 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1"}`}>
                    {itemsToRender.map((banner, idx) => (
                        <Link
                            key={idx}
                            href={banner.href}
                            className="group relative block h-[320px] md:h-[400px] overflow-hidden rounded-[25px] shadow-[0px_8px_25px_rgba(0,0,0,0.35)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0px_15px_35px_rgba(0,0,0,0.5)] border-[3px] border-[#d4b595]"
                        >
                            <img
                                alt={banner.title}
                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                src={banner.backgroundImage}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.8)] via-[rgba(0,0,0,0.3)] to-transparent" />
                            <div className="absolute bottom-[30px] left-[30px] right-[30px] md:bottom-[40px] md:left-[40px]">
                                <h3
                                    className="font-mono text-[28px] font-bold text-[#f5f3ee] md:text-[36px] lg:text-[42px] leading-tight"
                                    style={{ textShadow: "0px 2px 10px rgba(0,0,0,0.8)" }}
                                >
                                    {banner.title}
                                </h3>
                                {banner.subtitle ? (
                                    <p
                                        className="mt-2 text-[16px] text-[#f5f3ee] md:text-[18px] opacity-90 font-sans"
                                        style={{ textShadow: "0px 2px 10px rgba(0,0,0,0.8)" }}
                                    >
                                        {banner.subtitle}
                                    </p>
                                ) : null}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
