"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";

export type FormatKind = "paper" | "ebook" | "audio";

const FORMAT_KEYS: FormatKind[] = ["paper", "ebook", "audio"];

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

interface FormatSectionProps {
    selectedFormat?: FormatKind | null;
    onSelectFormat?: (format: FormatKind | null) => void;
}

export default function FormatSection({
    selectedFormat = null,
    onSelectFormat,
}: FormatSectionProps) {
    const { dictionary } = useLocale();
    const formats = dictionary.home.formats;

    const handleToggle = (kind: FormatKind) => {
        if (selectedFormat === kind) {
            onSelectFormat?.(null);
        } else {
            onSelectFormat?.(kind);
        }
    };

    return (
        <section className="relative z-40 w-full overflow-visible pt-10 pb-0">
            <div className="mx-auto max-w-[1220px] px-4 lg:px-0">
                <div className="flex flex-wrap justify-around text-center font-sans text-[20px] font-semibold text-[var(--foreground-primary)] mb-12">
                    {formats.items.map((item, index) => {
                        const kind = FORMAT_KEYS[index] ?? "paper";
                        const isSelected = selectedFormat === kind;
                        const isOtherSelected = Boolean(selectedFormat && !isSelected);

                        return (
                            <button
                                key={item.label}
                                type="button"
                                onClick={() => handleToggle(kind)}
                                className={`w-[260px] cursor-pointer transition-all duration-300 py-2 px-4 rounded-full font-sans font-semibold text-[18px] sm:text-[20px] bg-transparent border-0 ${
                                    isSelected
                                        ? "bg-[var(--color-green)] text-white shadow-[0_4px_12px_rgba(46,125,50,0.4)] scale-105"
                                        : isOtherSelected
                                        ? "opacity-50 hover:opacity-100 hover:text-[var(--color-green)]"
                                        : "hover:text-[var(--color-green)]"
                                }`}
                            >
                                {item.label}
                            </button>
                        );
                    })}
                </div>

                <h2 className="text-center font-mono text-[40px] font-bold text-[var(--foreground-primary)] md:text-[56px] mb-8">
                    {formats.heading}
                </h2>

                {selectedFormat && (
                    <div className="flex justify-center -mt-4 mb-6">
                        <button
                            type="button"
                            onClick={() => onSelectFormat?.(null)}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[var(--background-elevated)] border border-[var(--color-green)] text-[13px] font-sans font-semibold text-[var(--color-green)] shadow-sm hover:bg-[var(--color-green)] hover:text-white transition-all cursor-pointer"
                        >
                            <span>✕</span>
                            <span>{dictionary.catalog?.clearAll ?? "Скинути фільтр"}</span>
                        </button>
                    </div>
                )}

                <div className="flex flex-wrap justify-around text-center font-sans text-[16px] font-medium text-[var(--foreground-primary)] mb-8 gap-4">
                    {formats.items.map((item, index) => {
                        const kind = FORMAT_KEYS[index] ?? "paper";
                        const isSelected = selectedFormat === kind;
                        const isOtherSelected = Boolean(selectedFormat && !isSelected);

                        return (
                            <p
                                key={item.title}
                                className={`w-[260px] transition-opacity duration-300 ${
                                    isOtherSelected ? "opacity-50" : "opacity-100"
                                }`}
                            >
                                {item.title}
                            </p>
                        );
                    })}
                </div>

                <div className="flex flex-wrap items-end justify-around gap-8 pb-0 -mb-[50px]">
                    {formats.items.map((item, index) => {
                        const kind = FORMAT_KEYS[index] ?? "paper";
                        const isSelected = selectedFormat === kind;
                        const isOtherSelected = Boolean(selectedFormat && !isSelected);
                        const assets = formatAssets[index] ?? formatAssets[0];
                        const imageOffsets = [
                            { container: "h-[266px] w-[190px]", bg: "left-[14.5px] top-0 h-[200px] w-[175px]", img: "left-0 top-[114px] h-[152px] w-[159px]" },
                            { container: "h-[259px] w-[156px]", bg: "left-[9px] top-0 h-[200px] w-[137px]", img: "left-0 top-[109px] h-[150px] w-[156px]" },
                            { container: "h-[246px] w-[200px]", bg: "left-0 top-0 h-[175px] w-[200px]", img: "left-[18px] top-[79px] h-[167px] w-[163px]" },
                        ][index];

                        return (
                            <button
                                key={item.label}
                                type="button"
                                onClick={() => handleToggle(kind)}
                                aria-pressed={isSelected}
                                aria-label={`${item.label} - ${isSelected ? "скинути фільтр" : "фільтрувати книги"}`}
                                className={`group relative transition-all duration-300 cursor-pointer text-left focus:outline-none bg-transparent border-0 p-0 ${imageOffsets.container} ${
                                    isSelected
                                        ? "scale-110 -translate-y-3 z-30 filter drop-shadow-[0_0_24px_rgba(46,125,50,0.65)]"
                                        : isOtherSelected
                                        ? "opacity-50 hover:opacity-90 hover:scale-105"
                                        : "hover:scale-105"
                                }`}
                            >
                                <img
                                    alt=""
                                    className={`absolute transition-all duration-300 ${imageOffsets.bg} ${
                                        isSelected ? "scale-105 brightness-110" : ""
                                    }`}
                                    src={assets.background}
                                />
                                <img
                                    alt={item.imageAlt}
                                    className={`absolute transition-all duration-300 ${imageOffsets.img} ${
                                        isSelected ? "scale-105 drop-shadow-[0_12px_18px_rgba(0,0,0,0.5)]" : ""
                                    }`}
                                    src={assets.image}
                                />
                            </button>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
