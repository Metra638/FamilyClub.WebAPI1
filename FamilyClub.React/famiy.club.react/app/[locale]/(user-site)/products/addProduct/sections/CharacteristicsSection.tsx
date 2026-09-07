"use client";

import {
  LanguageDto,
  FormatDto,
  BookSizeDto,
  AgeRestrictionDto,
} from "@/lib/api/generated";
import { ProductDto } from "@/app/(user-site)/products/addProduct/types";
import { SectionCard } from "@/app/(user-site)/products/addProduct/ui/SectionCard";
import { NumberInput } from "@/app/(user-site)/products/addProduct/ui/NumberInput";
import LanguageSelectForm from "@/app/(user-site)/products/addProduct/LanguageSeletForm";
import AgeRestrictions from "@/app/(user-site)/products/addProduct/AgeRestrictions";
import BookSizeSelectForm from "@/app/(user-site)/products/addProduct/BookSizeSelectForm";
import CoverTypeSelect from "@/app/(user-site)/products/addProduct/CoverTypeSelect";
import FormatBook from "@/app/(user-site)/products/addProduct/FormatBook";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

type Props = {
  form: ProductDto;
  setField: <K extends keyof ProductDto>(key: K, value: ProductDto[K]) => void;
  languages: LanguageDto[];
  formats: FormatDto[];
  bookSizes: BookSizeDto[];
  ageRestrictions: AgeRestrictionDto[];
};

export function CharacteristicsSection({
  form,
  setField,
  languages,
  formats,
  bookSizes,
  ageRestrictions,
}: Props) {
  const t = useTranslations();

  return (
    <div className="w-[500px] h-[950px] flex -mt-[10px] flex-col">
      <SectionCard
        title={t("sellerProduct.characteristics")}
        titleMt="top-[48px]"
        titlePos="relative"
        backgroundImage="/images/addProducts/Rectangle 314.svg"
      >
        <div className="flex w-full relative top-[44px] flex-row gap-2 items-center justify-around h-[80px]">
          <div className="flex flex-col w-[180px]">
            <LanguageSelectForm
              languages={languages}
              value={form.languageId}
              onChange={(id) => setField("languageId", id)}
            />
          </div>
          <div className="flex flex-col w-[180px]">
            <NumberInput
              label={t("sellerProduct.year")}
              placeholder={String(new Date().getFullYear())}
              value={form.publishingYear}
              onChange={(v) => setField("publishingYear", v)}
              className="text-[18px]"
            />
          </div>
        </div>

        <div className="flex flex-row relative top-[44px] gap-2 justify-around h-[80px]">
          <div className="flex flex-col w-[180px]">
            <AgeRestrictions
              value={form.ageRestrictionIds?.[0]}
              ageRestrictions={ageRestrictions}
              onChange={(id) => setField("ageRestrictionIds", id ? [id] : [])}
            />
          </div>
          <div className="flex flex-col w-[180px]">
            <NumberInput
              label={t("sellerProduct.pages")}
              placeholder="567"
              value={form.pageCount}
              onChange={(v) => setField("pageCount", v)}
              className="w-[180px] text-[18px]"
            />
          </div>
        </div>

        <div className="flex flex-row relative top-[36px] gap-2 justify-around h-[80px]">
          <div className="flex flex-col w-[180px]">
            <BookSizeSelectForm
              value={form.bookSizeIds?.[0]}
              formats={bookSizes}
              onChange={(id) => setField("bookSizeIds", id ? [id] : [])}
            />
          </div>
          <div className="flex flex-col w-[180px]">
            <NumberInput
              label={t("sellerProduct.weight")}
              placeholder="1180g"
              value={form.weightGrams}
              onChange={(v) => setField("weightGrams", v)}
              className="w-[180px] text-[18px]"
            />
          </div>
        </div>

        <div className="flex flex-col relative top-[28px] ml-4 gap-1 h-[80px]">
          <div className="flex flex-col w-[250px]">
            <CoverTypeSelect
              value={form.coverType}
              onChange={(v) => setField("coverType", v)}
            />
          </div>
        </div>

        <div className="flex flex-row relative top-[22px] gap-2 h-[164px] justify-around">
          <div className="flex flex-col w-[180px]">
            <NumberInput
              label={t("sellerProduct.stockQty")}
              value={form.quantityInStock}
              onChange={(v) => setField("quantityInStock", v)}
              className="w-[180px] text-[16px] "
            />
          </div>
          <div className="flex flex-col w-[180px]">
            <NumberInput
              label={t("sellerProduct.setQty")}
              value={form.itemsInSet}
              onChange={(v) => setField("itemsInSet", v)}
              className="w-[180px] text-[16px]"
            />
          </div>
        </div>

        <div className="flex flex-col relative ml-[16px] -top-[60px] h-[180px] pb-[10px]">
          <FormatBook
            value={form.formatIds}
            formats={formats}
            onChange={(ids) => setField("formatIds", ids)}
          />
        </div>
      </SectionCard>
    </div>
  );
}
