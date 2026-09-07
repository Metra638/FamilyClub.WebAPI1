import { ProductDto } from "@/lib/api/generated";

const EBOOK_FORMAT_ID = 1;
const AUDIO_FORMAT_ID = 2;

export function useFilteredBooks(
  products: ProductDto[],
  yearParam: string | null,
  sortParam: string | null,
  ebookSelected: boolean,
  audioSelected: boolean,
  selectedIds: number[],
) {
  let filtered = yearParam
    ? products.filter((p) => {
        if (!p.publishingDate) return false;
        return new Date(p.publishingDate).getFullYear().toString().includes(yearParam);
      })
    : [...products];

  if (ebookSelected || audioSelected) {
    filtered = filtered.filter((book) => {
      const formats = book.formatIds ?? [];
      if (ebookSelected && audioSelected)
        return formats.includes(EBOOK_FORMAT_ID) || formats.includes(AUDIO_FORMAT_ID);
      if (ebookSelected) return formats.includes(EBOOK_FORMAT_ID);
      if (audioSelected) return formats.includes(AUDIO_FORMAT_ID);
      return true;
    });
  }

  if (selectedIds.length > 0) {
    filtered = filtered.filter((book) =>
      book.categoryIds?.some((id) => selectedIds.includes(id))
    );
  }

  return [...filtered].sort((a, b) => {
    if (sortParam === "name-asc")
      return (a.productName ?? "").localeCompare(b.productName ?? "", "uk");
    if (sortParam === "name-desc")
      return (b.productName ?? "").localeCompare(a.productName ?? "", "uk");
    return 0;
  });
}