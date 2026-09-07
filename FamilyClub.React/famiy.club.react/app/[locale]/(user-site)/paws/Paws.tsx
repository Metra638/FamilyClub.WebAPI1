"use client";

import { usePaws } from "./hooks/usePaws";
import Image from "next/image";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

export default function Paws({ userId }: { userId?: string }) {
  const t = useTranslations();
  const { paws, discountInUah } = usePaws(userId);

  return (
    <div className="w-[240px] items-center justify-center gap-2 flex flex-row h-[42px] bg-[#A97E56] rounded-[25px]">
      <Image src="/images/userProfile/Лапка.png" width={36} height={26} alt="" />
      <p className="text-[13px]">
        {t("paws.widgetPaws").replace("{count}", String(paws))}
      </p>
      <Image src="/images/userProfile/trending_flat_24px.png" width={20} height={20} alt="" />
      <p className="text-[13px]">
        {t("paws.widgetDiscount").replace("{value}", String(discountInUah))}
      </p>
    </div>
  );
}
