"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";

const formatAssets = [
    {
        background: "/images/main_page/format/format-bg-book.svg",
        image: "/images/main_page/format/format-book.png",
    },
    {
        background: "/images/main_page/format/format-bg-tablet.svg",
        image: "/images/main_page/format/format-tablet.png",
    },
    {
        background: "/images/main_page/format/format-bg-headphones.svg",
        image: "/images/main_page/format/format-headphones.png",
    },
];

export default function FormatSection() {
    const { dictionary } = useLocale();
    const formats = dictionary.home.formats;

    return (
        <section className="relative z-20 w-full overflow-visible pt-10 pb-0">
            <div className="mx-auto max-w-[1220px] px-4 lg:px-0">
                <div className="flex flex-wrap justify-around text-center font-sans text-[20px] font-semibold text-[var(--foreground-primary)] mb-12">
                    {formats.items.map((item) => (
                        <span key={item.label} className="w-[260px]">{item.label}</span>
                    ))}
                </div>

                <h2 className="text-center font-mono text-[40px] font-bold text-[var(--foreground-primary)] md:text-[56px] mb-8">
                    {formats.heading}
                </h2>

                <div className="flex flex-wrap justify-around text-center font-sans text-[16px] font-medium text-[var(--foreground-primary)] mb-8 gap-4">
                    {formats.items.map((item) => (
                        <p key={item.title} className="w-[260px]">{item.title}</p>
                    ))}
                </div>

                <div className="flex flex-wrap items-end justify-around gap-8 pb-0 -mb-[50px]">
                    {formats.items.map((item, index) => {
                        const assets = formatAssets[index] ?? formatAssets[0];
                        const imageOffsets = [
                            { container: "h-[266px] w-[190px]", bg: "left-[14.5px] top-0 h-[200px] w-[175px]", img: "left-0 top-[114px] h-[152px] w-[159px]" },
                            { container: "h-[259px] w-[156px]", bg: "left-[9px] top-0 h-[200px] w-[137px]", img: "left-0 top-[109px] h-[150px] w-[156px]" },
                            { container: "h-[246px] w-[200px]", bg: "left-0 top-0 h-[175px] w-[200px]", img: "left-[18px] top-[79px] h-[167px] w-[163px]" },
                        ][index];

                        return (
                            <div key={item.label} className={`relative transition-transform hover:scale-105 ${imageOffsets.container}`}>
                                <img
                                    alt=""
                                    className={`absolute ${imageOffsets.bg}`}
                                    src={assets.background}
                                />
                                <img
                                    alt={item.imageAlt}
                                    className={`absolute ${imageOffsets.img}`}
                                    src={assets.image}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
