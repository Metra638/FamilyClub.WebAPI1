"use client";

import Image from "next/image";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

type Props = {
  paws: number;
  discountInUah: number;
};

export default function YourPawsBlock({ paws, discountInUah }: Props) {
  const t = useTranslations();

  return (
    <div className="w-[340px] h-[350px] flex flex-col gap-2">
      <Image src="/images/pawsUser/Rectangle 509.png" width={340} height={350} alt="" />
      <div
        className="ml-0 relative -mt-[35vh] flex items-center justify-center bg-cover bg-center w-[224px] h-[62px] text-[var(--color-white)]"
        style={{ backgroundImage: "url('/images/pawsUser/Rectangle 478.png')" }}
      >
        <p className="h-[25px] font-['Roboto_Mono'] relative -mt-4 font-semibold text-[22px] leading-[150%] tracking-[-0.011em]">
          {t("paws.yourPaws")}
        </p>
      </div>

      <div className="flex items-center justify-center gap-12">
        <div className="w-[150] h-[150] -ml-12 flex items-center justify-center">
          <Image src="/images/pawsUser/Лапка.png" width={150} height={150} alt="" />
        </div>
        <div className="flex flex-col relative items-center">
          <p className="text-[80px] font-bold leading-none text-[#FFFFFF]">{paws}</p>
          <p className="text-[24px] text-[#FFFFFF]">{t("paws.pawsWord")}</p>
        </div>
      </div>

      <div className="flex flex-col relative top-2 items-center justify-center text-center w-full">
        <p className="text-[#F5F3EE80] w-[300px] text-[14px] border-b border-[#242424]">
          {t("paws.exchangeHint")}
        </p>
        <div className="flex flex-row items-center gap-8 ">
          <div className="flex flex-row gap-3 items-center">
            <Image src="/images/pawsUser/Group 733.png" width={38} height={38} alt="" />
            <div className="flex flex-col text-[#FFFFFF]">
              <p className="text-[24px]">100</p>
              <p className="text-[12px]">{t("paws.pawsCapital")}</p>
            </div>
          </div>
          <Image src="/images/pawsUser/Frame 936.png" width={38} height={38} alt="" />
          <div className="flex flex-row text-[#FFFFFF] text-[24px] gap-2 items-center">
            <Image src="/images/pawsUser/Group 734.png" width={38} height={38} alt="" />
            {discountInUah > 0 ? "10" : "10"}
            <p className="text-[12px]">{t("paws.uah")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
