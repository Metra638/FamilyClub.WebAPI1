"use client";

import { alertError } from "@/lib/ui/sweetAlert";
import { useState } from "react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { ProductDto, ImageUploadState } from "@/app/(user-site)/products/addProduct/types";
import { productService } from "@/lib/api/services";
import {
  useLocalizedPath,
  useTranslations,
} from "@/lib/i18n/LocaleProvider";

type Props = {
  id: number;
  form: ProductDto;
  images: ImageUploadState;
  router: AppRouterInstance;
};

export default function useSubmitEdit({ id, form, images, router }: Props) {
  const t = useTranslations();
  const lp = useLocalizedPath();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const productImageFiles: File[] = [];
      const publishingDate = form.publishingYear
        ? `${form.publishingYear}-01-01`
        : undefined;

      if (images.mainImage) productImageFiles.push(images.mainImage);
      images.gallery.forEach((f) => f && productImageFiles.push(f));

      await productService.apiProductsIdPut({
        id,
        productName: form.productName,
        description: form.description,
        price: form.price,
        discountPrice: form.discountPrice,
        promotionId: form.promotionId,
        pageCount: form.pageCount,
        publishingDate: publishingDate as unknown as Date,
        weightGrams: form.weightGrams,
        itemsInSet: form.itemsInSet,
        availability: form.availability,
        formatIds: form.formatIds,
        languageIds: form.languageId ? [form.languageId] : undefined,
        publisherId: form.publisherId,
        categoryIds: form.categoryIds,
        coverType: form.coverType,
        authorIds: form.authorIds,
        bookSizeIds: form.bookSizeIds,
        ageRestrictionIds: form.ageRestrictionIds,
        quantityInStock: form.quantityInStock,
        iSBN: form.isbn,
        leaveOldImages: productImageFiles.length === 0,
        productImageFiles: productImageFiles.length > 0 ? productImageFiles : undefined,
      });

      router.push(lp(`/products/${id}`));
    } catch (err: unknown) {
      console.error("FULL ERROR:", err);
      if (typeof err === "object" && err !== null && "response" in err) {
        const response = (err as { response?: Response }).response;
        const text = await response?.text?.();
        console.error("SERVER RESPONSE:", text);
      }
      await alertError(t("sellerProduct.updateError"));
    } finally {
      setLoading(false);
    }
  };

  return { handleSubmit, loading };
}
