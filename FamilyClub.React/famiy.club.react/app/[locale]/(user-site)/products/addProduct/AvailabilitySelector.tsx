"use client";

import { Availability } from "@/lib/api/generated";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

type Props = {
  value?: Availability;
  onChange: (value: Availability) => void;
};

export default function AvailabilitySelector({ value, onChange }: Props) {
  const t = useTranslations();
  const conditionOfTheGoods = [
    { label: t("sellerProduct.availabilityInStock"), value: Availability.NUMBER_0 },
    { label: t("sellerProduct.availabilityOut"), value: Availability.NUMBER_1 },
    { label: t("sellerProduct.availabilityPreorder"), value: Availability.NUMBER_2 },
  ];

  return (
    <div className="w-[540px] m-2 p-2 flex flex-col gap-2 items-center">
      <ul className="flex flex-col items-center w-full gap-2">
        {conditionOfTheGoods.map((condition) => {
          const isSelected = value === condition.value;

          return (
            <li
              key={condition.value}
              onClick={() => onChange(condition.value)}
              className={`inline-block w-fit
            px-6 py-4 rounded-full cursor-pointer
            font-['Source_Sans_Pro'] font-normal text-[18px] leading-[100%]
            transition-all duration-200 border

            ${
              isSelected
                ? "border-[1px] border-[#242424] text-[#242424]"
                : "border-transparent text-[#242424] hover:border-gray-400 hover:bg-gray-100"
            }
          `}
            >
              {condition.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
