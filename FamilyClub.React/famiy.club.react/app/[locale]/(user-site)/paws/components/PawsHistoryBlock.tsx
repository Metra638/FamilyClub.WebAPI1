"use client";

import type { PawsHistoryItem as PawsHistoryItemType } from "../hooks/usePaws";
import PawsHistoryItem from "../ui/PawsHistoryItem";
import Link from "next/link";
import { useLocalizedPath, useTranslations } from "@/lib/i18n/LocaleProvider";

type Props = {
  history: PawsHistoryItemType[];
};

export default function PawsHistoryBlock({ history }: Props) {
  const t = useTranslations();
  const lp = useLocalizedPath();

  return (
    <div
      className="relative w-[450px] h-[520px] -mt-4 -ml-6  bg-cover p-2 sm:p-5 text-[15px] sm:text-[16px]"
      style={{
        backgroundImage: "url('/images/pawsUser/Rectangle 513.png')",
        backgroundSize: "cover",
        width: "450px",
        height: "520px",
      }}
    >
      <div
        className="-ml-2 mt-4 text-[32px] relative flex items-center justify-left px-6 bg-cover bg-center
                 w-[300px] h-[66px] text-[var(--color-white)]"
        style={{
          backgroundImage: "url('/images/pawsUser/Rectangle 477.png')",
          width: "300px",
          height: "66px",
        }}
      >
        {t("paws.historyTitle")}
      </div>
      <div className="flex flex-col w-[320] ml-10 items-center justify-center">
        <ul className="divide-y divide-black/18">
          {history.map((item) => (
            <PawsHistoryItem key={item.id} item={item} />
          ))}
        </ul>
        <Link
          href={lp("/paws/history")}
          className="absolute bottom-8 w-[320px] h-[50px] items-center justify-center flex mt-4 py-3 rounded-[9px] text-white text-[20px] font-semibold"
          style={{ backgroundColor: "#005B33" }}
        >
          {t("paws.showFullHistory")}
        </Link>
      </div>
    </div>
  );
}
