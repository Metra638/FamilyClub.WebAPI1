"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";

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
    className?: string;
};

function AdvantageCard({ title, description, icon, className }: AdvantageCardProps) {
    return (
        <div className={`relative h-[325px] w-[250px] text-center text-[#f5f3ee] transition-transform hover:-translate-y-2 ${className ?? ""}`}>
            <img alt="" className="absolute inset-0 h-full w-full" src="/images/main_page/advantages/advantages-card-bg.png" />
            <img
                alt=""
                className="absolute left-1/2 top-[20px] h-[197px] w-[197px] -translate-x-1/2 object-contain"
                src={icon}
            />
            <p className="absolute left-1/2 top-[15px] w-[210px] -translate-x-1/2 text-[14px] leading-[1.3] text-[#f5f3ee] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {description}
            </p>
            <p className="absolute bottom-[40px] left-1/2 w-[200px] -translate-x-1/2 whitespace-pre-line font-mono text-[22px] font-semibold leading-[1.2] text-[#f5f3ee] drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                {title}
            </p>
        </div>
    );
}

export default function AdvantagesSection() {
    const { dictionary } = useLocale();
    const advantages = dictionary.home.advantages;

    return (
        <section className="relative z-10 pb-16 pt-8">
            <div className="mx-auto max-w-[1260px] px-4">
                <div className="relative rounded-[15px] bg-gradient-to-r from-[#b7895e] via-[#c7a381] to-[#b7895e] py-8 text-center shadow-[0px_8px_20px_rgba(0,0,0,0.4)] border-[3px] border-[#a0744c]">
                    <h2 className="font-mono text-[40px] font-bold text-[#242424] md:text-[56px]">
                        {advantages.title}
                    </h2>
                </div>

                <div className="mt-[-20px] flex flex-wrap justify-center gap-6 md:gap-8 pt-4">
                    {advantages.items.map((item, index) => (
                        <AdvantageCard
                            key={item.title}
                            title={item.title}
                            description={item.description}
                            icon={advantageIcons[index] ?? advantageIcons[0]}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
