import { useState } from "react";
import { ProductDto } from "@/app/(user-site)/products/addProduct/types";

type Params = {
  form: ProductDto;
  setField: <K extends keyof ProductDto>(
    key: K,
    value: ProductDto[K],
  ) => void;
};

export function useISBNLookup({ form, setField }: Params) {
  const [isbnLoading, setIsbnLoading] = useState(false);

  const handleIsbnLookup = async () => {
    if (!form.isbn || form.isbn.length < 10) return;

    setIsbnLoading(true);

    try {
      const res = await fetch(
        `https://openlibrary.org/api/books?bibkeys=ISBN:${form.isbn}&format=json&jscmd=data`,
      );

      const data = await res.json();
      const book = data[`ISBN:${form.isbn}`];

      if (!book) return;

      setField("productName", book.title ?? "");
      setField(
        "description",
        typeof book.description === "string"
          ? book.description
          : book.description?.value ?? "",
      );

      setField("pageCount", book.number_of_pages ?? undefined);
    } finally {
      setIsbnLoading(false);
    }
  };

  return { isbnLoading, handleIsbnLookup };
}