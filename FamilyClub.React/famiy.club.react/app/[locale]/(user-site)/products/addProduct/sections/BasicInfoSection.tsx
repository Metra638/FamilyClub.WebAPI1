"use client";

import { AuthorDTO, PublisherDto } from "@/lib/api/generated";
import { ProductDto } from "@/app/(user-site)/products/addProduct/types";
import { SectionCard } from "@/app/(user-site)/products/addProduct/ui/SectionCard";
import AuthorSelectForm from "@/app/(user-site)/products/addProduct/AuthorSelectForm";
import PublisherSelectForm from "@/app/(user-site)/products/addProduct/PublisherSelectForm";
import ISBNForm from "@/app/(user-site)/products/addProduct/ISBNForm";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

type Props = {
  form: ProductDto;
  setField: <K extends keyof ProductDto>(key: K, value: ProductDto[K]) => void;
  authors: AuthorDTO[];
  publishers: PublisherDto[];
  loading: boolean;
  isbnLoading: boolean;
  onIsbnLookup: () => void;
};

export function BasicInfoSection({
  form,
  setField,
  authors,
  publishers,
  loading,
  onIsbnLookup,
  isbnLoading,
}: Props) {
  const t = useTranslations();

  return (
    <div className="w-[500px] h-[560px] flex">
      <SectionCard
        title={t("sellerProduct.basicInfo")}
        className="bg-contain bg-center bg-no-repeat w-full h-full"
        titleMt="mt-[40px]"
        backgroundImage="/images/addProducts/Rectangle 313.svg"
      >
        <div className="flex w-[418px] flex-col gap-0">
          <p className="text-[var(--color-black)] font-sans-pro font-normal text-[18px] leading-[150%] tracking-[-0.011em]">
            {t("sellerProduct.bookName")}
          </p>
          <input
            placeholder={t("sellerProduct.bookNamePlaceholder")}
            value={form.productName}
            onChange={(e) => setField("productName", e.target.value)}
            className="input rounded-[9px] px-3 bg-[var(--color-white)] shadow-[0px_0px_10px_0px_#00000040] h-[40px]"
          />

          <AuthorSelectForm
            authors={authors}
            value={form.authorIds}
            onChange={(ids) => setField("authorIds", ids)}
          />

          <PublisherSelectForm
            publishers={publishers}
            value={form.publisherId}
            onChange={(id) => setField("publisherId", id)}
          />

          <div className="flex flex-col gap-0 pt-3">
            <p className="text-[var(--color-black)] font-sans-pro font-normal text-[18px] leading-[150%] tracking-[-0.011em]">
              {t("sellerProduct.description")}
            </p>
            <textarea
              placeholder={t("sellerProduct.descriptionPlaceholder")}
              value={form.description ?? ""}
              onChange={(e) => setField("description", e.target.value)}
              className="px-2 h-[68px] resize-none input rounded-[9px] bg-[var(--color-white)] shadow-[0px_0px_10px_0px_#00000040]"
            />
          </div>

          <div className="flex flex-col gap-1 h-[88px] pt-3 pb-[20px]">
            <ISBNForm
              value={form.isbn ?? ""}
              loading={loading}
              isbnLoading={isbnLoading}
              onChange={(v) => setField("isbn", v)}
              onLookup={onIsbnLookup}
            />
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
