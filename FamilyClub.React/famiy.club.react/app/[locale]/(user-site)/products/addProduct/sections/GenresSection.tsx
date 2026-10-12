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
      <div className="relative w-full h-full">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none admin-parchment-bg bg-cover bg-center"
          style={{ backgroundImage: "url('/images/addProducts/Rectangle 314.png')" }}
        />
        <div className="relative z-10">
          <div className="relative -ml-[10px] mt-[48px] w-[224px] h-[62px] text-[var(--color-white)]">
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none bg-cover bg-center"
              style={{ backgroundImage: "url('/images/addProducts/Rectangle 304.png')" }}
            />
            <div className="relative z-10 ml-[60px] w-[262px] gap-4 flex flex-col">
              <p className="h-[25px] font-['Roboto_Mono'] relative -ml-4 font-semibold text-[22px] leading-[150%] tracking-[-0.011em]">
                {t("sellerProduct.genres")}
              </p>
              <p className="h-[12px] text-[12px] relative -ml-4 -mt-3">
                {t("sellerProduct.genresHint")}
              </p>
            </div>
            <div className="relative z-10">
              <CategoryList
                categories={categories}
                selectedIds={selectedIds}
                onToggle={onToggle}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
