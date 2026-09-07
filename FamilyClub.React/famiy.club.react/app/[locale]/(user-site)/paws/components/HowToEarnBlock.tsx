"use client";

import HowToEarnItem from "../ui/HowToEarnItem";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

const EARN_ICONS = [
  "/images/userProfile/cart-shopping-solid-full.png",
  "/images/userProfile/comment-solid-full.png",
  "/images/userProfile/heart-solid-full.png",
  "/images/userProfile/cake-candles-solid-full.png",
  "/images/userProfile/bolt-solid-full.png",
] as const;

const EARN_KEYS = [
  "purchase",
  "review",
  "favorite",
  "birthday",
  "activity",
] as const;

export default function HowToEarnBlock() {
  const t = useTranslations();

  const howToEarn = EARN_KEYS.map((key, index) => ({
    icon: EARN_ICONS[index],
    title: t(`paws.earn.${key}Title`),
    desc: t(`paws.earn.${key}Desc`),
  }));

  return (
    <div
      className="relative w-[420px] h-[500px] bg-cover p-2 sm:p-5 text-[15px] sm:text-[16px]"
      style={{
        backgroundImage: "url('/images/pawsUser/Rectangle 512.png')",
        backgroundSize: "cover",
        width: "420px",
        height: "500px",
      }}
    >
      <div
        className="-ml-6 mt-4 text-[32px] relative flex items-center justify-left px-6 bg-cover bg-center
                 w-[370px] h-[66px] text-[var(--color-white)]"
        style={{
          backgroundImage: "url('/images/pawsUser/Rectangle 480.png')",
          width: "370px",
          height: "66px",
        }}
      >
        {t("paws.howToEarn")}
      </div>
      <ul className="flex flex-col gap-3 mt-4">
        {howToEarn.map((item) => (
          <HowToEarnItem key={item.title} {...item} />
        ))}
      </ul>
    </div>
  );
}
