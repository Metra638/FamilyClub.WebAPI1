"use client";

import { alertSuccess } from "@/lib/ui/sweetAlert";
import { useState, useEffect } from "react";
import { CoverType } from "@/lib/api/generated";
import { ProductDto } from "@/app/(user-site)/products/addProduct/types";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

const initialDto: ProductDto = {
  productName: "",
  description: "",
  pageCount: undefined,
  itemsInSet: 1,
  categoryIds: [],
  languageId: undefined,
  coverType: CoverType.NUMBER_0,
  availability: undefined,
  leaveOldImages: false,
  quantityInStock: undefined,
  bookSizeIds: [],
  publisherId: undefined,
  authorIds: [],
  formatIds: [],
  ageRestrictionIds: [],
  price: undefined,
  discountPrice: undefined,
  promotionId: undefined,
  isbn: undefined,
  publishingYear: undefined,
};

const DRAFT_KEY = "productDraft";

export function useProductForm() {
  const t = useTranslations();
  const [form, setForm] = useState<ProductDto>(initialDto);

  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        setForm(JSON.parse(saved));
      } catch (e) {
        console.error("Помилка парсингу чернетки:", e);
      }
    }
  }, []);

  const setField = <K extends keyof ProductDto>(key: K, value: ProductDto[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const saveDraft = async () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    await alertSuccess(t("sellerProduct.draftSaved"));
  };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setForm(initialDto);
  };

  const toggleCategory = (id: number) =>
    setField(
      "categoryIds",
      form.categoryIds.includes(id)
        ? form.categoryIds.filter((c) => c !== id)
        : [...form.categoryIds, id],
    );

  return { form, setField, toggleCategory, saveDraft, clearDraft };
}
