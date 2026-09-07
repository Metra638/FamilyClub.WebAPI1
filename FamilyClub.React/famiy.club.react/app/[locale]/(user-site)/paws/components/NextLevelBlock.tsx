"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "@/lib/i18n/LocaleProvider";

const LEVEL_MAX = 300;

const GROUP_727_IMAGES = {
  uk: "/images/pawsUser/Group 727-uk.png",
  en: "/images/pawsUser/Group 727-en.png",
} as const;

type Props = {
  paws: number;
};

export default function NextLevelBlock({ paws }: Props) {
  const { locale } = useLocale();
  const t = useTranslations();
  const group727Src = GROUP_727_IMAGES[locale];
  const progressPercent = Math.min(100, (paws / LEVEL_MAX) * 100);

  return (
    <div className="w-full flex flex-col gap-4">
      <div
        className="relative px-5 py-4"
        style={{
          backgroundImage: "url('/images/pawsUser/Rectangle 510.png')",
          backgroundSize: "100% 100%",
        }}
      >
        <div className="flex items-center gap-2 text-[14px] font-semibold mb-3">
          {t("paws.nextLevel")}
          <Image src="/images/userProfile/circle-info-solid-full 1.png" width={15} height={15} alt="" />
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex flex-col items-center shrink-0 w-[60px]">
            <Image src="/images/userProfile/Лапка.png" width={30} height={30} alt="" />
            <span className="text-xs mt-1">{t("paws.level").replace("{n}", "1")}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between text-xs text-black/60 mb-1">
              <span>{t("paws.pawsCount").replace("{count}", String(paws))}</span>
              <span>{t("paws.pawsCount").replace("{count}", String(LEVEL_MAX))}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#F5F0E7" }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${progressPercent}%`, backgroundColor: "#006C45" }}
              />
            </div>
          </div>

          <div className="flex flex-col items-center shrink-0 w-[70px]">
            <Image src="/images/userProfile/Лапка.png" width={30} height={30} alt="" />
            <span className="text-xs mt-1">{t("paws.level").replace("{n}", "2")}</span>
            <span className="text-xs font-semibold whitespace-nowrap">
              {t("paws.bonusPaws").replace("{count}", "100")}
            </span>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-row gap-1 items-center -mt-4">
        <button
          type="button"
          className="relative flex-1 flex items-center justify-center w-[340px] h-[142px] p-0 text-left overflow-hidden bg-transparent border-0 cursor-pointer"
        >
          <Image
            src={group727Src}
            width={355}
            height={189}
            alt={t("paws.exchangeAlt")}
            className="object-contain max-h-full w-auto"
            priority
          />
        </button>

        <button
          className="relative flex-1 flex items-center gap-2 bg-cover w-[340px] h-[142px] p-2 text-left overflow-hidden"
          style={{
            backgroundImage: "url('/images/pawsUser/Rectangle 471.png')",
            backgroundSize: "cover",
            width: "340px",
            height: "142px",
          }}
        >
          <Image
            src="/images/userProfile/Tags.png"
            width={50}
            height={50}
            alt=""
            className="ml-5"
          />
          <div>
            <p className="font-bold text-[14px] leading-tight">{t("paws.applyToPurchase")}</p>
            <p className="text-black/60 text-xs w-[150px] mt-1.5 leading-snug">
              {t("paws.applyHint")}
            </p>
          </div>
        </button>
      </div>

      <div
        className="relative w-[560px] h-[152px] -mt-8 bg-cover p-2 sm:p-5 text-[15px] sm:text-[16px]"
        style={{
          backgroundImage: "url('/images/pawsUser/Rectangle 471.svg')",
          backgroundSize: "cover",
          width: "560px",
          height: "152px",
        }}
      >
        <ul className="relative mt-5 space-y-4 sm:space-y-6 list-disc pl-8">
          <li>{t("paws.ruleCheckout")}</li>
          <li>{t("paws.ruleDeduct")}</li>
        </ul>
      </div>
    </div>
  );
}
