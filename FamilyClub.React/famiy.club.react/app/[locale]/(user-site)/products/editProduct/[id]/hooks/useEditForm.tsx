import { useState, useEffect } from "react";
import { CoverType } from "@/lib/api/generated";
import { ProductDto } from "@/app/(user-site)/products/addProduct/types";
import { productService } from "@/lib/api/services";

const emptyDto: ProductDto = {
  productName: "",
  description: "",
  pageCount: undefined,
  itemsInSet: 1,
  categoryIds: [],
  languageId: undefined,
  coverType: CoverType.NUMBER_0,
  availability: undefined,
  leaveOldImages: true,
  quantityInStock: undefined,
  bookSizeIds: [],
  publisherId: undefined,
  authorIds: [],
  formatIds: [],
  ageRestrictionIds: [],
  price: undefined,
  discountPrice: undefined,
  isbn: undefined,
  publishingYear: undefined,
  promotionId: undefined,
};

export default function useEditForm(id: number) {
  const [form, setForm] = useState<ProductDto>(emptyDto);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    productService
      .apiProductsIdGet({ id })
      .then((product) => {
        const year = product.publishingDate
          ? new Date(product.publishingDate).getFullYear()
          : undefined;

        setForm({
          productName: product.productName ?? "",
          description: product.description ?? "",
          pageCount: product.pageCount ?? undefined,
          itemsInSet: product.itemsInSet ?? 1,
          categoryIds: product.categoryIds ?? [],
          languageId: product.originalLanguageId ?? undefined,
          coverType: product.coverType ?? CoverType.NUMBER_0,
          availability: product.availability ?? undefined,
          leaveOldImages: true,
          quantityInStock: product.quantityInStock ?? undefined,
          bookSizeIds: product.bookSizeIds ?? [],
          publisherId: product.publisherId ?? undefined,
          authorIds: product.authorIds ?? [],
          formatIds: product.formatIds ?? [],
          ageRestrictionIds: product.ageRestrictionIds ?? [],
          price: product.price ?? undefined,
          discountPrice: product.discountPrice ?? undefined,
          promotionId: product.promotionId ?? undefined,
          isbn: product.productCode ?? undefined,
          publishingYear: year,
          weightGrams: product.weightGrams ?? undefined,
          productImages: (product.productImages ?? []).map((img) => ({
            imageData: img.imageData ?? "",
          })),
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const setField = <K extends keyof ProductDto>(key: K, value: ProductDto[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleCategory = (categoryId: number) =>
    setField(
      "categoryIds",
      form.categoryIds.includes(categoryId)
        ? form.categoryIds.filter((c) => c !== categoryId)
        : [...form.categoryIds, categoryId],
    );

  return { form, setField, toggleCategory, loading };
}
