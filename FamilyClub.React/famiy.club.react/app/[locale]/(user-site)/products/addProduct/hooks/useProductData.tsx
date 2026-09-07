import { useState, useEffect } from "react";
import {
  AuthorDTO,
  PublisherDto,
  CategoryDto,
  LanguageDto,
  FormatDto,
  BookSizeDto,
  AgeRestrictionDto,
} from "@/lib/api/generated";
import {
  authorService,
  publisherService,
  categoriesService,
  languageService,
  formatService,
  bookSizeService,
  ageRestrictionService,
} from "@/lib/api/services";

type ProductData = {
  authors: AuthorDTO[];
  publishers: PublisherDto[];
  categories: CategoryDto[];
  languages: LanguageDto[];
  formats: FormatDto[];
  bookSizes: BookSizeDto[];
  ageRestrictions: AgeRestrictionDto[];
};

export function useProductData() {
  const [data, setData] = useState<ProductData>({
    authors: [],
    publishers: [],
    categories: [],
    languages: [],
    formats: [],
    bookSizes: [],
    ageRestrictions: [],
  });

  useEffect(() => {
    Promise.all([
      authorService.apiAuthorsGet().catch(() => []),
      publisherService.apiPublishersGet().catch(() => []),
      categoriesService.apiCategoriesGet().catch(() => []),
      languageService.apiLanguagesGet().catch(() => []),
      formatService.apiFormatsGet().catch(() => []),
      bookSizeService.apiBookSizesGet().catch(() => []),
      ageRestrictionService.apiAgeRestrictionsGet().catch(() => []),
    ]).then(([authors, publishers, categories, languages, formats, bookSizes, ageRestrictions,]) =>
      setData({ authors, publishers, categories, languages, formats, bookSizes, ageRestrictions, })
    );
  }, []);

  return data;
}