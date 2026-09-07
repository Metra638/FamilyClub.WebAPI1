"use client";

import { useRouter } from "next/navigation";
import { useProductForm } from "./hooks/useProductForm";
import { useProductData } from "./hooks/useProductData";
import { useImageUpload } from "./hooks/useImageUpload";
import { useSubmitProduct } from "./hooks/useSubmitProduct";
import { BasicInfoSection } from "./sections/BasicInfoSection";
import { CharacteristicsSection } from "./sections/CharacteristicsSection";
import { GenresSection } from "./sections/GenresSection";
import { ImageUploadSection } from "./sections/ImageUploadSection";
import { SaleSection } from "./sections/SaleSection";
import { useISBNLookup } from "./hooks/useISBNLookup";
import { useEffect } from "react";
import ButtonReturn from "./ui/ButtonReturn";
import {
  useLocalizedPath,
  useTranslations,
} from "@/lib/i18n/LocaleProvider";

export default function AddProductPage() {
  const router = useRouter();
  const t = useTranslations();
  const lp = useLocalizedPath();
  const { form, setField, toggleCategory, saveDraft, clearDraft } =
    useProductForm();
  const data = useProductData();
  const images = useImageUpload();
  const { handleSubmit, loading } = useSubmitProduct({
    form,
    images,
    router,
    clearDraft,
  });
  const { isbnLoading, handleIsbnLookup } = useISBNLookup({
    form,
    setField,
  });
  useEffect(() => {
    document.body.style.backgroundImage =
      "url('/images/addProducts/Rectangle 326.png')";
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
    <div className="w-full min-h-screen flex flex-col">
      <div
        className="relative w-[900px] ml-[27vw] -mt-[4px] mx-auto bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/addProducts/Rectangle 312.svg')",
        }}
      >
        <div className="flex z-40 relative top-[130px] ml-[64px]">
          <ButtonReturn />
        </div>
        <div className="flex flex-col items-center mt-[100px]">
          <h1 className="text-[var(--color-black)] w-[600px] font-['Roboto_Mono'] font-bold text-[44px] leading-[150%] tracking-[-0.011em] text-center">
            {t("sellerProduct.addTitle")}
          </h1>
          <p className="text-[var(--color-black)] -mt-2 font-sans font-normal text-[22px] leading-[150%] tracking-[-0.011em] text-center">
            {t("sellerProduct.addSubtitle")}
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="w-full flex mt-[30px] gap-[4vw] relative z-10 justify-center">
            <div className="w-[450px] flex flex-col">
              <BasicInfoSection
                form={form}
                setField={setField}
                authors={data.authors}
                publishers={data.publishers}
                loading={loading}
                onIsbnLookup={handleIsbnLookup}
                isbnLoading={isbnLoading}
              />
              <CharacteristicsSection
                form={form}
                setField={setField}
                languages={data.languages}
                formats={data.formats}
                bookSizes={data.bookSizes}
                ageRestrictions={data.ageRestrictions}
              />
              <GenresSection
                categories={data.categories}
                selectedIds={form.categoryIds}
                onToggle={toggleCategory}
              />
            </div>

            <div className="w-[300px] flex flex-col mt-1 relative left-3 gap-[40px]">
              <ImageUploadSection images={images} />
              <SaleSection
                form={form}
                setField={setField}
                loading={loading}
                onPublish={handleSubmit}
                onSaveDraft={saveDraft}
                onCancel={() => {
                  clearDraft();
                  router.push(lp("/products"));
                }}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
