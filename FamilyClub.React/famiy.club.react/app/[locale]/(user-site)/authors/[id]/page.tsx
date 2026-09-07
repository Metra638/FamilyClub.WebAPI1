"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { authorService, productService, reviewService } from "@/lib/api/services";
import { AuthorDTO, ProductDto, ReviewDto } from "@/lib/api/generated";
import { useCart } from "@/lib/hooks/useCart";
import { useFavorites } from "@/lib/hooks/useFavorites";
import { useCurrentUser } from "../../userProfile/hooks/useCurrentUser";
import Bookshelf from "./Bookshelf";
import AuthorPageBio from "./AuthorPageBio";
import { getProductCoverUrl } from "@/lib/products/productCoverUrl";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

export default function AuthorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const t = useTranslations();
  const { items, addToCart } = useCart();
  const { user } = useCurrentUser();
  const { favorites, toggleFavorite } = useFavorites(user?.id);

  const [author, setAuthor] = useState<AuthorDTO | null>(null);
  const [allProducts, setAllProducts] = useState<ProductDto[]>([]);
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [loading, setLoading] = useState(true);

  const authorId = Number(id);

  useEffect(() => {
    document.body.style.backgroundImage = "url('/images/authorsUserPage/Rectangle 326.png')";
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

  useEffect(() => {
    if (!authorId) return;

    Promise.all([
      authorService.apiAuthorsIdGet({ id: authorId }),
      productService.apiProductsGet(),
      reviewService.apiReviewsGet(),
    ])
      .then(([authorData, products, reviewsData]) => {
        setAuthor(authorData);
        setAllProducts(products);
        setReviews(reviewsData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [authorId]);

  const books = useMemo(
    () => allProducts.filter((p) => p.authorIds?.includes(authorId)),
    [allProducts, authorId],
  );

  const ratingByProductId = useMemo(() => {
    const temp = new Map<number, { sum: number; count: number }>();
    const result = new Map<number, number>();
    for (const review of reviews) {
      if (review.productId == null || review.rating == null) continue;
      if (review.approved === false) continue;
      const entry = temp.get(review.productId) ?? { sum: 0, count: 0 };
      temp.set(review.productId, { sum: entry.sum + review.rating, count: entry.count + 1 });
    }
    temp.forEach((v, key) => result.set(key, v.sum / v.count));
    return result;
  }, [reviews]);

  const isInCart = (productId?: number) => {
    if (!productId) return false;
    return items.some((item) => item.productId === productId);
  };
  const isFav = (productId?: number) => {
    if (!productId) return false;
    return favorites.some((f) => f.id === productId);
  };
  const getImageSrc = (book: ProductDto) => getProductCoverUrl(book);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <p className="text-[var(--color-black)] opacity-60">{t("authors.loading")}</p>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <p className="text-[var(--color-black)] opacity-60">{t("authors.notFound")}</p>
      </div>
    );
  }

  const rows: ProductDto[][] = [];
  for (let i = 0; i < books.length; i += 3) {
    rows.push(books.slice(i, i + 3));
  }

  return (
    <div className="relative w-full -mb-2 gap-0 items-center">
      <div className="flex w-[100vw] items-start justify-center text-left flex-wrap mt-[16vh]">
        <AuthorPageBio author={author} />
      </div>
      <h2 className="text-[32px] text-center font-bold text-[var(--color-white)] mb-6">
        {t("authors.booksTitle").replace("{name}", author.authorName ?? "")}
      </h2>

      {books.length === 0 ? (
        <p className="text-[var(--color-white)] text-center opacity-60 mb-10">
          {t("authors.noBooks")}
        </p>
      ) : (
        <Bookshelf
          rows={rows}
          authorName={author.authorName}
          getImageSrc={getImageSrc}
          isAuthenticated={!!user}
          ratingByProductId={ratingByProductId}
          isInCart={isInCart}
          addToCart={addToCart}
          toggleFavorite={toggleFavorite}
          favorites={favorites}
          isFav={isFav}
        />
      )}
    </div>
  );
}
