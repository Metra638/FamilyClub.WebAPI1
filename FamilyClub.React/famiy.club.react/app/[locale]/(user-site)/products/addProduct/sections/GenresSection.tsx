"use client";

import { CategoryDto } from "@/lib/api/generated";
import CategoryList from "@/app/(user-site)/products/addProduct/CategoryList";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

type Props = {
  categories: CategoryDto[];
  selectedIds: number[];
  onToggle: (id: number) => void;
};

export function GenresSection({ categories, selectedIds, onToggle }: Props) {
  const t = useTranslations();

  return (
    <div className="w-[480px] h-[480px] relative flex flex-col ml-3 -top-[184px]">
      <div
        className="w-full h-full bg-cover bg-center"
        style={{ backgroundImage: "url('/images/addProducts/Rectangle 314.png')" }}
      >
        <div
          className="-ml-[10px] mt-[48px] bg-cover bg-center w-[224px] h-[62px] text-[var(--color-white)]"
          style={{ backgroundImage: "url('/images/addProducts/Rectangle 304.png')" }}
        >
          <div className="ml-[60px] w-[262px] gap-4 flex flex-col">
            <p className="h-[25px] font-['Roboto_Mono'] relative -ml-4 font-semibold text-[22px] leading-[150%] tracking-[-0.011em]">
              {t("sellerProduct.genres")}
            </p>
            <p className="h-[12px] text-[12px] relative -ml-4 -mt-3">
              {t("sellerProduct.genresHint")}
            </p>
          </div>
          <CategoryList
            categories={categories}
            selectedIds={selectedIds}
            onToggle={onToggle}
          />
        </div>
      </div>
    </div>
  );
}
