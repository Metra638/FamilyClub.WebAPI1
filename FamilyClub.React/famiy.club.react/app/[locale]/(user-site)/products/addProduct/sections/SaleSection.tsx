"use client";

import { ProductDto } from "@/app/(user-site)/products/addProduct/types";
import { NumberInput } from "@/app/(user-site)/products/addProduct/ui/NumberInput";
import AvailabilitySelector from "@/app/(user-site)/products/addProduct/AvailabilitySelector";
import ButtonSubmitAddProduct from "@/app/(user-site)/products/addProduct/ButtonSubmitAddProduct";
import { usePromotions } from "../hooks/usePromotions";
import PromotionSelectForm from "../PromotionSelectForm";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

type Props = {
  form: ProductDto;
  setField: <K extends keyof ProductDto>(key: K, value: ProductDto[K]) => void;
  loading: boolean;
  onPublish: () => void;
  onSaveDraft: () => void;
  onCancel: () => void;
};

export function SaleSection({
  form,
  setField,
  loading,
  onPublish,
  onSaveDraft,
  onCancel,
}: Props) {
  const t = useTranslations();
  const { promotions } = usePromotions();

  return (
    <div className="w-full h-[600px] flex relative -mt-[110px] text-[var(--color-white)]">
      <div className="w-full h-[600px] relative">
        <img
          src="/images/addProducts/Rectangle 315.png"
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-[600px] pointer-events-none"
          style={{ objectFit: "fill" }}
        />
        <div className="relative z-10 w-full h-full flex flex-col items-center -ml-[2px] mt-[38px]">
          <div className="w-full h-full flex flex-col items-center -ml-[2px] mt-[6px]">
            <div className="relative w-[260px] h-[116px] -ml-[40px]">
              <img
                src="/images/addProducts/Rectangle 304.svg"
                alt=""
                className="w-full h-full"
                style={{ objectFit: "fill" }}
              />
              <div className="absolute inset-0 -mt-[14px] flex items-center ml-[40px] justify-start">
                <p className="font-['Roboto_Mono'] font-semibold text-[20px] leading-[100%] tracking-[-0.011em]">
                  {t("sellerProduct.saleTitle")}
                </p>
              </div>
            </div>

            <NumberInput
              label={t("sellerProduct.price")}
              value={form.price}
              onChange={(v) => setField("price", v)}
              className="w-[200px] text-[var(--color-black)]"
            />

            <div className="flex flex-col items-center w-[200px] mt-4">
              <NumberInput
                label={t("sellerProduct.discountPrice")}
                placeholder="0"
                value={form.discountPrice}
                onChange={(v) => setField("discountPrice", v)}
                className="w-[200px] mt-4  text-[var(--color-black)]"
              />
              {form.discountPrice != null &&
                form.price != null &&
                form.discountPrice >= form.price && (
                  <p className="text-red-400 text-xs mt-1">
                    {t("sellerProduct.discountPriceError")}
                  </p>
                )}
            </div>
            <div className="flex flex-col items-center w-[200px] mt-4">
              <PromotionSelectForm
                promotions={promotions}
                value={form.promotionId}
                price={form.price}
                onChange={(id) => setField("promotionId", id)}
                onDiscountPriceChange={(price) => setField("discountPrice", price)}
              />
            </div>
            <div className="flex flex-col items-center w-[200px] mt-0">
              <AvailabilitySelector
                value={form.availability}
                onChange={(value) => setField("availability", value)}
              />
            </div>

            <div className="relative flex flex-col items-center mt-[70px]">
              <ButtonSubmitAddProduct
                loading={loading}
                onPublish={onPublish}
                onSaveDraft={onSaveDraft}
                onCancel={onCancel}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
