"use client";

import Link from "next/link";
import YourPawsBlock from "./components/YourPawsBlock";
import NextLevelBlock from "./components/NextLevelBlock";
import HowToEarnBlock from "./components/HowToEarnBlock";
import PawsHistoryBlock from "./components/PawsHistoryBlock";
import { usePaws } from "./hooks/usePaws";
import ButtonReturn from "../userProfile/editUserProfile/[id]/ui/ButtonReturn";
import { useEffect } from "react";
import { useCurrentUser } from "../userProfile/hooks/useCurrentUser";
import { useLocalizedPath, useTranslations } from "@/lib/i18n/LocaleProvider";

export default function MyPawsPage() {
  const t = useTranslations();
  const lp = useLocalizedPath();
  const { user } = useCurrentUser();
  const { paws, history, discountInUah } = usePaws(user?.id);

  useEffect(() => {
    document.body.style.backgroundImage = "url('/images/authorsUserPage/Rectangle 326.png')";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundAttachment = "fixed";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";

    return () => {
      document.body.style.backgroundImage = "";
      document.body.style.backgroundSize = "";
      document.body.style.backgroundAttachment = "";
      document.body.style.backgroundPosition = "";
      document.body.style.backgroundRepeat = "";
    };
  }, []);

  return (
    <div className="min-h-screen w-[1000px] flex flex-col ml-[24vw] px-10 py-8" style={{ backgroundColor: "#C7A381" }}>
      <div className="flex items-center justify-between mt-22 mb-8">
        <div className="flex items-center gap-4">
          <Link href={lp("/")} className="w-10 h-10 flex items-center justify-center">
            <ButtonReturn />
          </Link>
          <div>
            <h1 className="text-[48px] font-bold text-[var(--color-black)]">{t("paws.title")}</h1>
            <p className="text-[15px] text-[#000000]">{t("paws.subtitle")}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-5 items-start">
        <YourPawsBlock paws={paws} discountInUah={discountInUah} />
        <div className="flex-1 min-w-0">
          <NextLevelBlock paws={paws} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6 pb-4">
        <HowToEarnBlock />
        <PawsHistoryBlock history={history} />
      </div>
    </div>
  );
}
