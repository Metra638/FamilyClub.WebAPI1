"use client";

import BookCard from "@/app/(user-site)/main_page/BookCard";
import MobileProductDetails from "./MobileProductDetails";
import ReviewPagination from "./ReviewPagination";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  authorService,
  bookSizeService,
  categoriesService,
  favoriteService,
  formatService,
  languageService,
  productService,
  publisherService,
  reviewService,
} from "@/lib/api/services";
import { getAuthToken } from "@/lib/auth/tokenStorage";
import { alertError, alertSuccess, alertWarning } from "@/lib/ui/sweetAlert";
import {
  AuthorDTO,
  BookSizeDto,
  CategoryDto,
  CoverType,
  FormatDto,
  LanguageDto,
  ProductDto,
  PublisherDto,
  ReviewDto,
} from "@/lib/api/generated";
import { useCart } from "@/lib/hooks/useCart";
import { useLocale, useLocalizedPath, useTranslations } from "@/lib/i18n/LocaleProvider";

type ReviewCardData = {
  id: number | string;
  author: string;
  text: string;
  timeLabel: string;
  avatar?: string | null;
  bookImage?: string | null;
  likesCount?: number;
};

const formatIconMap = {
  paper: {
    bg: "/images/main_page/icons/rec-icon-paper-bg.svg",
    icon: "/images/main_page/icons/rec-icon-paper.svg",
    label: "Паперова",
  },
  ebook: {
    bg: "/images/main_page/icons/rec-icon-ebook-bg.svg",
    icon: "/images/main_page/icons/rec-icon-ebook.svg",
    label: "eBooks",
  },
  audio: {
    bg: "/images/main_page/icons/rec-icon-audio-bg.svg",
    icon: "/images/main_page/icons/rec-icon-audio.svg",
    label: "Аудіо книга",
  },
};

const formatPrice = (value?: number | null, locale: "uk" | "en" = "uk") => {
  if (value == null) return "";
  const formatted = new Intl.NumberFormat(locale === "en" ? "en-US" : "uk-UA").format(value);
  return locale === "en" ? `${formatted} UAH` : `${formatted} грн`;
};

const clampRating = (value: number) => Math.max(0, Math.min(5, value));

const ratingToStars = (rating: number) => {
  const rounded = clampRating(Math.round(rating));
  return Array.from({ length: 5 }, (_, index) =>
    index < rounded ? "★" : "☆",
  ).join("");
};

const formatReviewDate = (value?: Date) => {
  if (!value) return "";
  return value.toLocaleDateString("uk-UA");
};

const getImageSrc = (product?: ProductDto | null) => {
  if (!product) return null;
  const image = product.productImages?.[0];
  if (!image?.imageData) return null;
  const normalizedData = image.imageData.trim();
  if (normalizedData.startsWith("data:")) {
    return normalizedData;
  }

  const mimeType = (() => {
    if (normalizedData.startsWith("UklGR")) return "image/webp";
    if (normalizedData.startsWith("/9j/")) return "image/jpeg";
    if (normalizedData.startsWith("iVBORw0KGgo")) return "image/png";
    if (normalizedData.startsWith("R0lGOD")) return "image/gif";

    const extension = image.imageName?.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "webp": return "image/webp";
      case "png": return "image/png";
      case "gif": return "image/gif";
      default: return "image/jpeg";
    }
  })();

  return `data:${mimeType};base64,${normalizedData}`;
};

const getAvatarSrc = (avatarData?: string | null) => {
  if (!avatarData) return null;
  const normalizedData = avatarData.trim();
  if (normalizedData.startsWith("data:")) {
    return normalizedData;
  }
  const mimeType = (() => {
    if (normalizedData.startsWith("UklGR")) return "image/webp";
    if (normalizedData.startsWith("/9j/")) return "image/jpeg";
    if (normalizedData.startsWith("iVBORw0KGgo")) return "image/png";
    if (normalizedData.startsWith("R0lGOD")) return "image/gif";
    return "image/jpeg";
  })();
  return `data:${mimeType};base64,${normalizedData}`;
};

const getGalleryImages = (product?: ProductDto | null) => {
  if (!product) return [];
  const images = (product.productImages ?? [])
    .map((image) => {
      if (!image.imageData) return null;
      const normalizedData = image.imageData.trim();
      if (normalizedData.startsWith("data:")) return normalizedData;

      const mimeType = (() => {
        if (normalizedData.startsWith("UklGR")) return "image/webp";
        if (normalizedData.startsWith("/9j/")) return "image/jpeg";
        if (normalizedData.startsWith("iVBORw0KGgo")) return "image/png";
        if (normalizedData.startsWith("R0lGOD")) return "image/gif";

        const extension = image.imageName?.split(".").pop()?.toLowerCase();
        switch (extension) {
          case "webp": return "image/webp";
          case "png": return "image/png";
          case "gif": return "image/gif";
          default: return "image/jpeg";
        }
      })();
      return `data:${mimeType};base64,${normalizedData}`;
    })
    .filter(Boolean) as string[];

  return images;
};

const formatYear = (value?: Date | string | null) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}`;
};

const formatWeight = (value?: number | null) => {
  if (value == null) return "";
  const kilograms = value / 1000;
  return `${kilograms.toFixed(2)} кг`;
};

function TornPaperBox({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative w-full drop-shadow-[0_8px_12px_rgba(36,36,36,0.15)] ${className}`}>
      <div className="w-full overflow-hidden leading-none text-[#f5f3ee] -mb-[1px]">
        <svg className="w-full h-[10px] block" viewBox="0 0 1200 10" fill="currentColor" preserveAspectRatio="none">
          <path d="M0,10 L0,5 C 15,2 30,7 45,4 S 75,1 90,5 S 120,2 135,6 S 165,1 180,4 S 210,7 225,3 S 255,1 270,5 S 300,2 315,6 S 345,1 360,4 S 390,7 405,3 S 435,1 450,5 S 480,2 495,6 S 525,1 540,4 S 570,7 585,3 S 615,1 630,5 S 660,2 675,6 S 705,1 720,4 S 750,7 765,3 S 795,1 810,5 S 840,2 855,6 S 885,1 900,4 S 930,7 945,3 S 975,1 990,5 S 1020,2 1035,6 S 1065,1 1080,4 S 1110,7 1125,3 S 1155,1 1170,5 S 1185,3 1200,4 L1200,10 Z" />
        </svg>
      </div>
      <div className="bg-[#f5f3ee] px-6 py-6">
        {children}
      </div>
      <div className="w-full overflow-hidden leading-none text-[#f5f3ee] -mt-[1px]">
        <svg className="w-full h-[10px] block rotate-180" viewBox="0 0 1200 10" fill="currentColor" preserveAspectRatio="none">
          <path d="M0,10 L0,5 C 15,2 30,7 45,4 S 75,1 90,5 S 120,2 135,6 S 165,1 180,4 S 210,7 225,3 S 255,1 270,5 S 300,2 315,6 S 345,1 360,4 S 390,7 405,3 S 435,1 450,5 S 480,2 495,6 S 525,1 540,4 S 570,7 585,3 S 615,1 630,5 S 660,2 675,6 S 705,1 720,4 S 750,7 765,3 S 795,1 810,5 S 840,2 855,6 S 885,1 900,4 S 930,7 945,3 S 975,1 990,5 S 1020,2 1035,6 S 1065,1 1080,4 S 1110,7 1125,3 S 1155,1 1170,5 S 1185,3 1200,4 L1200,10 Z" />
        </svg>
      </div>
    </div>
  );
}

function ReviewCard({ author, text, timeLabel, avatar, bookImage, likesCount }: ReviewCardData) {
  const t = useTranslations();
  const displayLikes = likesCount ?? 0;
  return (
    <div className="flex h-full flex-col justify-between gap-4 rounded-[21px] bg-[#f5f3ee] p-5 shadow-[0px_4px_15px_rgba(0,0,0,0.12)] border border-[#242424]/5">
      <div className="flex gap-5 items-start">
        {avatar ? (
          <img
            alt=""
            className="h-[80px] w-[80px] shrink-0 rounded-full object-cover shadow-sm"
            src={avatar}
          />
        ) : (
          <div className="flex h-[80px] w-[80px] shrink-0 items-center justify-center rounded-full bg-[#e8e6e1] font-mono text-2xl font-bold text-[#7e4d1e]">
            {author ? author.charAt(0).toUpperCase() : "?"}
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          {author ? (
            <p className="font-mono text-[22px] font-bold text-[#242424] truncate uppercase tracking-wider">
              {author}
            </p>
          ) : null}
          {text ? (
            <p className="mt-2 text-[14px] leading-relaxed text-[#242424]/90 line-clamp-4">
              {text}
            </p>
          ) : null}
        </div>
        {bookImage ? (
          <img
            alt=""
            className="h-[108px] w-[77px] shrink-0 rounded-[9px] object-cover shadow-md"
            src={bookImage}
          />
        ) : (
          <div className="h-[108px] w-[77px] shrink-0 rounded-[9px] bg-[#e8e6e1]" />
        )}
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-[#242424]/10">
        <span className="text-[14px] font-medium text-[#242424]/70">
          {timeLabel || t("product.justNow")}
        </span>
        <div className="flex items-center gap-3 text-[15px] font-semibold text-[#242424]">
          <span title={t("product.report")} className="cursor-pointer opacity-40 hover:opacity-100 text-sm">🚩</span>
          <span>{displayLikes}</span>
          <img
            alt={t("product.like")}
            className="h-[22px] w-[22px] cursor-pointer hover:scale-110 transition-transform"
            src="/images/main_page/icons/reviews-heart.svg"
          />
        </div>
      </div>
    </div>
  );
}


export default function ProductDetailsClient({ id }: { id: string }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const t = useTranslations();
  const lp = useLocalizedPath();
  const { locale } = useLocale();
  const [product, setProduct] = useState<ProductDto | null>(null);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [languages, setLanguages] = useState<LanguageDto[]>([]);
  const [publishers, setPublishers] = useState<PublisherDto[]>([]);
  const [authors, setAuthors] = useState<AuthorDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [formats, setFormats] = useState<FormatDto[]>([]);
  const [bookSizes, setBookSizes] = useState<BookSizeDto[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const [currentReviewPage, setCurrentReviewPage] = useState(1);
  const reviewsPerPage = 6;

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    const token = getAuthToken();
    if (!token) {
      await alertWarning(t("product.loginToComment"));
      return;
    }
    const pid = Number(id);
    if (!Number.isFinite(pid)) return;

    try {
      setIsSubmittingComment(true);
      await reviewService.apiReviewsPost(
        {
          reviewDto: {
            productId: pid,
            comment: newComment.trim(),
            rating: 5,
            createdAt: new Date(),
            approved: true,
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment("");
      const updatedReviews = await reviewService.apiReviewsByProductProductIdGet({ productId: pid }).catch(() => reviewService.apiReviewsGet().catch(() => []));
      setReviews(updatedReviews ?? []);
      setCurrentReviewPage(1);
    } catch (e) {
      console.error("Помилка при відправці коментаря:", e);
      await alertError(t("product.commentError"));
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const toggleFavorite = async () => {
    const token = getAuthToken();
    if (!token) {
      await alertWarning(t("product.loginRequired"));
      return;
    }
    const pid = Number(id);
    try {
      if (isFavorite) {
        await favoriteService.apiFavoritesProductIdDelete(
          { productId: pid },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFavorite(false);
      } else {
        await favoriteService.apiFavoritesProductIdPost(
          { productId: pid },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFavorite(true);
      }
    } catch (e) {
      console.error(e);
    }
  };
  useEffect(() => {
    const productId = Number(id);
    if (!Number.isFinite(productId)) return;
    let isMounted = true;

    const loadData = async () => {
      try {
        const [
          productResult,
          productsResult,
          reviewsResult,
          languagesResult,
          publishersResult,
          authorsResult,
          categoriesResult,
          formatsResult,
          bookSizesResult,
        ] = await Promise.all([
          productService.apiProductsIdGet({ id: productId }),
          productService.apiProductsGet().catch((err) => { console.warn("Failed to fetch products:", err); return []; }),
          reviewService.apiReviewsByProductProductIdGet({ productId }).catch(() => reviewService.apiReviewsGet().catch((err) => { console.warn("Failed to fetch reviews:", err); return []; })),
          languageService.apiLanguagesGet().catch((err) => { console.warn("Failed to fetch languages:", err); return []; }),
          publisherService.apiPublishersGet().catch((err) => { console.warn("Failed to fetch publishers:", err); return []; }),
          authorService.apiAuthorsGet().catch((err) => { console.warn("Failed to fetch authors:", err); return []; }),
          categoriesService.apiCategoriesGet().catch((err) => { console.warn("Failed to fetch categories:", err); return []; }),
          formatService.apiFormatsGet().catch((err) => { console.warn("Failed to fetch formats:", err); return []; }),
          bookSizeService.apiBookSizesGet().catch((err) => { console.warn("Failed to fetch book sizes:", err); return []; }),
        ]);

        if (!isMounted) return;
        setProduct(productResult);
        setProducts(productsResult ?? []);
        setReviews(reviewsResult ?? []);
        setLanguages(languagesResult ?? []);
        setPublishers(publishersResult ?? []);
        setAuthors(authorsResult ?? []);
        setCategories(categoriesResult ?? []);
        setFormats(formatsResult ?? []);
        setBookSizes(bookSizesResult ?? []);

        const token = getAuthToken();
        if (token) {
          try {
            const fav = await favoriteService.apiFavoritesProductIdIsFavoriteGet(
              { productId },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (isMounted) setIsFavorite(fav);
          } catch (favErr) {
            console.warn("Failed to check favorites (token may be expired):", favErr);
            if (isMounted) setIsFavorite(false);
          }
        }
      } catch (error) {
        console.error("Failed to load product details:", error);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [id]);
  // useEffect(() => {
  //   const productId = Number(id);
  //   if (!Number.isFinite(productId)) return;
  //   let isMounted = true;

  //   const loadData = async () => {
  //     try {
  //       const [
  //         productResult,
  //         productsResult,
  //         reviewsResult,
  //         languagesResult,
  //         publishersResult,
  //         authorsResult,
  //         categoriesResult,
  //         formatsResult,
  //         bookSizesResult,
  //         membersResult,
  //       ] = await Promise.all([
  //         productService.apiProductsIdGet({ id: productId }),
  //         productService.apiProductsGet(),
  //         reviewService.apiReviewsGet(),
  //         languageService.apiLanguagesGet(),
  //         publisherService.apiPublishersGet(),
  //         authorService.apiAuthorsGet(),
  //         categoriesService.apiCategoriesGet(),
  //         formatService.apiFormatsGet(),
  //         bookSizeService.apiBookSizesGet(),
  //         clubMemberService.apiClubMemberGet(),
  //       ]);

  //       if (!isMounted) return;
  //       setProduct(productResult);
  //       setProducts(productsResult ?? []);
  //       setReviews(reviewsResult ?? []);
  //       setLanguages(languagesResult ?? []);
  //       setPublishers(publishersResult ?? []);
  //       setAuthors(authorsResult ?? []);
  //       setCategories(categoriesResult ?? []);
  //       setFormats(formatsResult ?? []);
  //       setBookSizes(bookSizesResult ?? []);
  //       setClubMembers(membersResult ?? []);
  //     } catch (error) {
  //       console.error("Failed to load product details:", error);
  //     }
  //   };

  //   loadData();

  //   return () => {
  //     isMounted = false;
  //   };
  // }, [id]);

  const currentProduct = product ?? undefined;
  const galleryImages = getGalleryImages(currentProduct);
  const primaryImage = galleryImages[0] ?? getImageSrc(currentProduct);
  const displayImage =
    selectedImage && galleryImages.includes(selectedImage)
      ? selectedImage
      : primaryImage;
  const thumbnails = galleryImages.slice(0, 4);

  const authorId = currentProduct?.authorIds?.[0];
  const author = authorId
    ? authors.find((item) => item.id === authorId)
    : undefined;
  const authorName = author?.authorName ?? "";
  const authorBio = author?.biography ?? "";
  const authorPhoto = author?.photoUrl ?? "";

  const languageName = currentProduct?.originalLanguageId
    ? (languages.find(
      (language) => language.id === currentProduct.originalLanguageId,
    )?.languageName ?? "")
    : "";
  const publisherName = currentProduct?.publisherId
    ? (publishers.find(
      (publisher) => publisher.id === currentProduct.publisherId,
    )?.publisherName ?? "")
    : "";

  const categoryNames = (currentProduct?.categoryIds ?? [])
    .map(
      (categoryId) =>
        categories.find((category) => category.id === categoryId)?.categoryName,
    )
    .filter((name): name is string => Boolean(name));
  const categoryLabel = categoryNames.join(", ");

  const formatNames = (currentProduct?.formatIds ?? [])
    .map((formatId) => formats.find((format) => format.id === formatId)?.name)
    .filter((name): name is string => Boolean(name));
  const formatLabel = formatNames.join(", ");

  const bookSizeNames = (currentProduct?.bookSizeIds ?? [])
    .map((bookSizeId) => bookSizes.find((size) => size.id === bookSizeId)?.name)
    .filter((name): name is string => Boolean(name));
  const bookSizeLabel = bookSizeNames.join(", ");

  const formatDisplay = bookSizeLabel || formatLabel;
  const pageCountValue =
    currentProduct?.pageCount != null ? `${currentProduct.pageCount}` : "";
  const pageCountText = pageCountValue
    ? t("product.pages").replace("{count}", pageCountValue)
    : "";
  const weightText =
    currentProduct?.weightGrams != null
      ? t("product.weightKg").replace(
          "{value}",
          (currentProduct.weightGrams / 1000).toFixed(2),
        )
      : "";
  const yearText = formatYear(currentProduct?.publishingDate);

  const getFormatTags = (formatIds?: Array<number> | null) => {
    const tags = new Set<"paper" | "ebook" | "audio">();
    for (const formatId of formatIds ?? []) {
      const format = formats.find((item) => item.id === formatId);
      const label = `${format?.name ?? ""} ${format?.code ?? ""}`.toLowerCase();
      if (!label) continue;
      if (label.includes("audio") || label.includes("аудіо")) {
        tags.add("audio");
      }
      if (label.includes("ebook") || label.includes("e-book") || label.includes("електрон")) {
        tags.add("ebook");
      }
      if (label.includes("paper") || label.includes("print") || label.includes("папер")) {
        tags.add("paper");
      }
    }
    return Array.from(tags);
  };

  const ratingByProductId = useMemo(() => {
    const map = new Map<number, { sum: number; count: number }>();
    for (const review of reviews) {
      if (!review.productId || review.rating == null) continue;
      if (review.approved === false) continue;
      const entry = map.get(review.productId) ?? { sum: 0, count: 0 };
      map.set(review.productId, {
        sum: entry.sum + review.rating,
        count: entry.count + 1,
      });
    }
    return map;
  }, [reviews]);

  const getRatingForProduct = (productId?: number) => {
    if (!productId) return 0;
    const entry = ratingByProductId.get(productId);
    if (!entry || entry.count === 0) return 0;
    return entry.sum / entry.count;
  };

  const getReviewCountForProduct = (productId?: number) => {
    if (!productId) return 0;
    const entry = ratingByProductId.get(productId);
    return entry?.count ?? 0;
  };

  const productId = currentProduct?.id ?? Number(id);
  const productReviews = reviews.filter(
    (review) => review.productId === productId && review.approved !== false,
  );
  const rating = getRatingForProduct(productId);
  const ratingCount = productReviews.length;

  const reviewCards: ReviewCardData[] = productReviews
    .filter((review) => Boolean(review.comment))
    .map((review, index) => {
      const authorLabel = review.userName || review.userId || t("common.anonymous");
      return {
        id:
          review.id ??
          review.createdAt?.toISOString() ??
          review.comment ??
          index,
        author: authorLabel,
        text: review.comment ?? "",
        timeLabel: formatReviewDate(review.createdAt),
        avatar: getAvatarSrc(review.userAvatarData),
        bookImage: primaryImage,
        likesCount: 0,
      };
    });

  const totalReviewPages = Math.ceil(reviewCards.length / reviewsPerPage);
  const paginatedReviewCards = reviewCards.slice(
    (currentReviewPage - 1) * reviewsPerPage,
    currentReviewPage * reviewsPerPage
  );

  const authorIdSet = new Set(currentProduct?.authorIds ?? []);
  const categoryIdSet = new Set(currentProduct?.categoryIds ?? []);
  const booksByAuthor = products
    .filter((item) => item.id !== currentProduct?.id)
    .filter((item) => item.authorIds?.some((id) => authorIdSet.has(id)));
  const similarByCategory = products
    .filter((item) => item.id !== currentProduct?.id)
    .filter((item) => item.categoryIds?.some((id) => categoryIdSet.has(id)));

  const booksByAuthorCards = booksByAuthor.slice(0, 4).map((item) => ({
    id: item.id,
    href: item.id ? `/products/${item.id}` : undefined,
    title: item.productName ?? "",
    author: (item.authorIds ?? [])
      .map((authorId) => authors.find((author) => author.id === authorId)?.authorName)
      .filter((name): name is string => Boolean(name))
      .join(", ") || null,
    price: formatPrice(item.discountPrice ?? item.price, locale),
    image: getImageSrc(item),
    rating:
      getReviewCountForProduct(item.id) > 0
        ? getRatingForProduct(item.id)
        : null,
    formatTags: getFormatTags(item.formatIds),
  }));
  const similarBookCards = similarByCategory.slice(0, 4).map((item) => ({
    id: item.id,
    href: item.id ? `/products/${item.id}` : undefined,
    title: item.productName ?? "",
    author: (item.authorIds ?? [])
      .map((authorId) => authors.find((author) => author.id === authorId)?.authorName)
      .filter((name): name is string => Boolean(name))
      .join(", ") || null,
    price: formatPrice(item.discountPrice ?? item.price, locale),
    image: getImageSrc(item),
    rating:
      getReviewCountForProduct(item.id) > 0
        ? getRatingForProduct(item.id)
        : null,
    formatTags: getFormatTags(item.formatIds),
  }));

  const productTitle = currentProduct?.productName ?? "";
  const descriptionText = currentProduct?.description ?? "";
  const priceValue = currentProduct?.discountPrice ?? currentProduct?.price;
  const priceText = priceValue != null ? formatPrice(priceValue, locale) : "";
  const hasAuthorDetails = Boolean(authorName || authorBio || authorPhoto);
  const formatTags = getFormatTags(currentProduct?.formatIds);

  const formatDesktopPrice = (value?: number | null) => {
    if (value == null) return "";
    const formatted = new Intl.NumberFormat(locale === "en" ? "en-US" : "uk-UA").format(value);
    return locale === "en" ? `${formatted} UAH` : `${formatted} грн`;
  };

  const formatDesktopWeight = (value?: number | null) => {
    if (value == null) return "";
    return t("product.weightKg").replace("{value}", (value / 1000).toFixed(2));
  };

  const formatDesktopReviewDate = (value?: Date) => {
    if (!value) return "";
    return value.toLocaleDateString(locale === "en" ? "en-US" : "uk-UA");
  };

  const desktopFormatIconMap = useMemo(
    () => ({
      paper: { ...formatIconMap.paper, label: t("product.formats.paper") },
      ebook: { ...formatIconMap.ebook, label: t("product.formats.ebook") },
      audio: { ...formatIconMap.audio, label: t("product.formats.audio") },
    }),
    [t],
  );

  const desktopPageCountText = pageCountValue
    ? t("product.pages").replace("{count}", pageCountValue)
    : "";
  const desktopWeightText = formatDesktopWeight(currentProduct?.weightGrams);
  const desktopPriceText = priceValue != null ? formatDesktopPrice(priceValue) : "";

  const desktopReviewCards = useMemo(
    () =>
      productReviews
        .filter((review) => Boolean(review.comment))
        .map((review, index) => ({
          id:
            review.id ??
            review.createdAt?.toISOString() ??
            review.comment ??
            index,
          author: review.userName || review.userId || t("common.anonymous"),
          text: review.comment ?? "",
          timeLabel: formatDesktopReviewDate(review.createdAt),
          avatar: getAvatarSrc(review.userAvatarData),
          bookImage: primaryImage,
          likesCount: 0,
        })),
    [productReviews, primaryImage, t, locale],
  );

  const desktopTotalReviewPages = Math.ceil(desktopReviewCards.length / reviewsPerPage);
  const desktopPaginatedReviewCards = desktopReviewCards.slice(
    (currentReviewPage - 1) * reviewsPerPage,
    currentReviewPage * reviewsPerPage,
  );

  const desktopBooksByAuthorCards = useMemo(
    () =>
      booksByAuthor.slice(0, 4).map((item) => ({
        id: item.id,
        href: item.id ? lp(`/products/${item.id}`) : undefined,
        title: item.productName ?? "",
        author:
          (item.authorIds ?? [])
            .map((authorId) => authors.find((author) => author.id === authorId)?.authorName)
            .filter((name): name is string => Boolean(name))
            .join(", ") || null,
        price: formatDesktopPrice(item.discountPrice ?? item.price),
        image: getImageSrc(item),
        rating:
          getReviewCountForProduct(item.id) > 0 ? getRatingForProduct(item.id) : null,
        formatTags: getFormatTags(item.formatIds),
      })),
    [booksByAuthor, authors, lp, locale, ratingByProductId],
  );

  const desktopSimilarBookCards = useMemo(
    () =>
      similarByCategory.slice(0, 4).map((item) => ({
        id: item.id,
        href: item.id ? lp(`/products/${item.id}`) : undefined,
        title: item.productName ?? "",
        author:
          (item.authorIds ?? [])
            .map((authorId) => authors.find((author) => author.id === authorId)?.authorName)
            .filter((name): name is string => Boolean(name))
            .join(", ") || null,
        price: formatDesktopPrice(item.discountPrice ?? item.price),
        image: getImageSrc(item),
        rating:
          getReviewCountForProduct(item.id) > 0 ? getRatingForProduct(item.id) : null,
        formatTags: getFormatTags(item.formatIds),
      })),
    [similarByCategory, authors, lp, locale, ratingByProductId],
  );

  const desktopCharacteristics = useMemo(
    () =>
      [
        {
          label: t("product.chars.productCode"),
          value: currentProduct?.productCode ?? `#${currentProduct?.id ?? ""}`,
        },
        { label: t("product.chars.bookTitle"), value: productTitle },
        { label: t("product.chars.pages"), value: pageCountValue },
        { label: t("product.chars.weight"), value: desktopWeightText },
        { label: t("product.chars.year"), value: yearText },
        { label: t("product.chars.genres"), value: categoryLabel },
        { label: t("product.chars.author"), value: authorName },
        { label: t("product.chars.language"), value: languageName },
        { label: t("product.chars.publisher"), value: publisherName },
        {
          label: t("product.chars.cover"),
          value:
            currentProduct?.coverType != null
              ? currentProduct.coverType === CoverType.NUMBER_1
                ? t("product.chars.softCover")
                : t("product.chars.hardCover")
              : "",
        },
        { label: t("product.chars.format"), value: formatDisplay },
      ].filter((item) => item.value),
    [
      t,
      currentProduct,
      productTitle,
      pageCountValue,
      desktopWeightText,
      yearText,
      categoryLabel,
      authorName,
      languageName,
      publisherName,
      formatDisplay,
    ],
  );

  return (
    <>
      {/* 1. Мобільна версія (Figma Node 2298:4517 / "Картка товару" — 1-to-1 Dev Mode) */}
      <div className="block md:hidden">
        <MobileProductDetails
          product={currentProduct}
          authorName={authorName}
          authorPhoto={authorPhoto}
          categoryLabel={categoryLabel}
          formatDisplay={formatDisplay}
          pageCountText={pageCountText}
          pageCountValue={pageCountValue}
          weightText={weightText}
          yearText={yearText}
          languageName={languageName}
          publisherName={publisherName}
          priceText={priceText}
          rating={rating}
          ratingCount={ratingCount}
          reviews={paginatedReviewCards}
          currentReviewPage={currentReviewPage}
          totalReviewPages={totalReviewPages}
          onReviewPageChange={setCurrentReviewPage}
          booksByAuthorCards={booksByAuthorCards}
          similarBookCards={similarBookCards}
          isFavorite={isFavorite}
          toggleFavorite={toggleFavorite}
          addToCart={addToCart}
          galleryImages={galleryImages}
          displayImage={displayImage}
          setSelectedImage={setSelectedImage}
          newComment={newComment}
          setNewComment={setNewComment}
          isSubmittingComment={isSubmittingComment}
          handleCommentSubmit={handleCommentSubmit}
        />
      </div>

      {/* 2. Десктопна версія */}
      <div className="hidden md:block">
        <div className="relative min-h-screen w-full bg-[#3a2618] pb-24 overflow-hidden">
          <img
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-25 pointer-events-none"
            src="/images/body/Rectangle 287.webp"
          />

          {/* 1. ВЕРХНІЙ БЛОК: ДОШКА З ІНФОРМАЦІЄЮ ПРО КНИГУ (УСЕ ВЕРХНЄ В СЕРЕДИНІ БЕЖЕВОЇ ДОШКИ) */}
          <div className="relative pt-20 pb-16">
            <div className="relative mx-auto max-w-[1360px] rounded-t-[16px] bg-[#c4a680] pt-10 sm:pt-14 md:pt-16 px-6 sm:px-10 md:px-14 pb-16 shadow-[0_25px_60px_rgba(0,0,0,0.6)] text-[#242424]">
              <div className="mb-6">
                <button
                  className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#f5f3ee] text-[24px] font-bold text-[#242424] shadow-md transition-transform hover:scale-105"
                  onClick={() => router.back()}
                  type="button"
                  aria-label={t("product.back")}
                >
                  ←
                </button>
              </div>

              <div className="grid gap-8 lg:grid-cols-[500px_1fr_360px] items-start">
                <div className="flex gap-4">
                  <div className="flex flex-col gap-3 shrink-0">
                    {thumbnails.map((image, index) => {
                      const isActive = image === displayImage;
                      return (
                        <button
                          key={`thumb-${index}`}
                          type="button"
                          className={`flex h-[120px] w-[88px] items-center justify-center rounded-[8px] bg-white p-1.5 shadow-md transition-all ${isActive ? "ring-2 ring-[#0e503f] scale-105" : "opacity-80 hover:opacity-100"}`}
                          onClick={() => setSelectedImage(image)}
                        >
                          <img alt="" className="h-full w-full object-contain" src={image} />
                        </button>
                      );
                    })}
                  </div>

                  <div className="relative flex h-[500px] flex-1 items-center justify-center">
                    {displayImage ? (
                      <img alt={productTitle} className="max-h-full max-w-full object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.5)] rounded-[4px]" src={displayImage} />
                    ) : (
                      <div className="flex h-[420px] w-[300px] flex-col items-center justify-center rounded-[12px] bg-[#f5f3ee]/80 border-2 border-dashed border-[#242424]/30 text-[#242424]/50 shadow-md">
                        <span className="text-4xl mb-2">📖</span>
                        <span className="font-serif text-lg">{t("product.coverMissing")}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col py-2">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1 text-[18px] text-[#242424]">
                      {ratingToStars(rating)}
                    </div>
                    <span className="font-mono text-[16px] font-bold">{rating.toFixed(0)}</span>
                    {ratingCount > 0 ? (
                      <span className="text-[14px] font-semibold text-[#0e503f] underline cursor-pointer hover:text-[#093529]">
                        {t("product.ratings").replace("{count}", String(ratingCount))}
                      </span>
                    ) : null}
                  </div>

                  <h1 className="mt-2 font-serif text-[38px] font-bold leading-tight text-[#242424]">
                    {productTitle}
                  </h1>

                  {authorName ? (
                    <div className="mt-2 flex items-center gap-2 text-[18px]"
                      onClick={() => authorId && router.push(lp(`/authors/${authorId}`))}>
                      <span className="text-[#242424]/70">{t("product.authorLabel")}</span>
                      <span className="font-semibold text-[#242424] cursor-pointer">
                        {authorName}
                      </span>
                    </div>
                  ) : null}

                  {formatTags.length > 0 ? (
                    <div className="mt-6 flex flex-col gap-3.5">
                      {formatTags.map((tag, idx) => {
                        const item = desktopFormatIconMap[tag];
                        if (!item) return null;
                        const isGreen = idx % 2 !== 0;
                        return (
                          <div
                            key={tag}
                            className={`relative flex h-[52px] w-[80px] items-center justify-center rounded-l-[8px] shadow-md transition-transform hover:translate-x-1 ${isGreen ? "bg-[#0e503f]" : "bg-[#7e4d1e]"}`}
                            title={item.label}
                          >
                            <img alt={item.label} className="h-[28px] w-[28px] object-contain brightness-200" src={item.icon} />
                            <div className={`absolute -right-[14px] top-0 h-[52px] w-[14px] ${isGreen ? "text-[#0e503f]" : "text-[#7e4d1e]"}`}>
                              <svg className="h-full w-full block" viewBox="0 0 14 52" fill="currentColor">
                                <path d="M0,0 L14,26 L0,52 Z" />
                              </svg>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}

                  {desktopPageCountText ? (
                    <div className="mt-8 text-[16px] text-[#242424]">{desktopPageCountText}</div>
                  ) : null}

                  <div className="my-3 border-b border-[#242424]/30 w-full" />

                  {categoryLabel ? (
                    <div className="text-[18px] font-medium text-[#242424]">{categoryLabel}</div>
                  ) : null}
                </div>

                {/* ДОШКА КУПІВЛІ (BUY BOX - GROUP 448) */}
                <div className="flex flex-col">
                  <div className="flex flex-col drop-shadow-[0_10px_20px_rgba(36,36,36,0.25)]">
                    <div className="flex h-[64px] items-center justify-between rounded-t-[20px] bg-[#0e503f] px-6 text-white">
                      <div className="flex items-center gap-3">
                        {authorPhoto ? (
                          <img alt={authorName || t("product.authorAlt")} className="h-[44px] w-[44px] rounded-full object-cover border-2 border-white shadow-sm" src={authorPhoto} />
                        ) : (
                          <div className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-white/20 font-bold text-lg">
                            {authorName ? authorName.charAt(0) : "A"}
                          </div>
                        )}
                        <span className="font-serif text-[18px] font-medium">{authorName || t("product.authorNotSpecified")}</span>
                      </div>
                      <button
                        type="button"
                        className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-white/20 text-2xl font-bold hover:bg-white/30 transition-colors"
                        title={t("product.subscribeMore")}
                      >
                        +
                      </button>
                    </div>

                    <TornPaperBox className="rounded-t-none">
                      <div className="text-[14px] text-[#242424]/70">{t("product.priceAtLibria")}</div>
                      <div className="mt-1 font-mono text-[38px] font-bold text-[#242424]">{desktopPriceText || t("product.zeroPrice")}</div>

                      <div className="mt-8 flex items-center justify-between gap-4">
                        <button
                          className="flex flex-1 items-center cursor-pointer justify-center gap-3 py-3.5 px-6 rounded-[12px] bg-[#0e503f] hover:bg-[#093529] active:scale-[0.98] text-white font-bold text-[18px] shadow-[0_6px_20px_rgba(14,80,63,0.35)] transition-all"
                          type="button"
                          onClick={async () => {
                            if (!currentProduct?.id) return;
                            const ok = await addToCart(currentProduct.id);
                            if (ok) {
                              await alertSuccess(t("product.addedToCart"));
                            } else {
                              await alertWarning(t("product.loginToAddCart"));
                            }
                          }}
                        >
                          <img alt="" className="h-[24px] w-[24px] brightness-200" src="/images/main_page/icons/rec-icon-basket.svg" />
                          <span>{t("product.addToCart")}</span>
                        </button>
                        <button
                          className={`flex h-[40px] w-[40px] items-center justify-center transition-transform ${isFavorite ? "text-red-500 scale-110" : "opacity-80 hover:opacity-100"}`}
                          type="button"
                          onClick={toggleFavorite}
                          aria-label={t("product.addToFavorites")}
                        >
                          <img alt="" className="h-[30px] w-[30px]" src="/images/main_page/icons/rec-icon-favorite.svg" />
                        </button>
                      </div>

                      {isFavorite ? (
                        <div className="mt-4 text-center text-[14px] font-medium text-[#0e503f]">
                          {t("product.inWishlist")}
                        </div>
                      ) : (
                        <div className="mt-4 text-center text-[13px] text-[#242424]/70">
                          {t("product.wishlistHint")}
                        </div>
                      )}

                      <div className="mt-6 border-t border-[#242424]/20 pt-4">
                        <div className="font-mono text-[16px] font-bold text-[#242424]">{t("product.payment")}</div>
                        <div className="mt-1 text-[13px] leading-relaxed text-[#242424]/80">
                          {t("product.paymentDescription")}
                        </div>
                      </div>
                    </TornPaperBox>
                  </div>
                </div>
              </div>

              {descriptionText ? (
                <div className="mt-14">
                  <TornPaperBox className="shadow-lg">
                    <h2 className="font-serif text-[28px] font-bold text-[#242424]">{t("product.description")}</h2>
                    <p className="mt-4 text-[16px] leading-relaxed text-[#242424]/90 whitespace-pre-line font-sans">
                      {descriptionText}
                    </p>
                  </TornPaperBox>
                </div>
              ) : null}

              <div className="mt-14 grid gap-0 lg:grid-cols-[400px_1px_1fr]">
                <div>
                  <h3 className="font-serif text-[26px] font-bold text-[#242424] mb-6">
                    {t("product.characteristics")}
                  </h3>
                  <div className="space-y-3.5 text-[15px]">
                    {desktopCharacteristics.map((item) => {
                      const isHighlighted =
                        item.label === t("product.chars.genres") ||
                        item.label === t("product.chars.author");
                      return (
                        <div key={item.label} className="grid grid-cols-[130px_1fr] gap-2 items-start">
                          <span className="text-[#242424]/80">{item.label}</span>
                          <span className={`${isHighlighted ? "font-semibold underline" : "font-medium"} text-[#242424]`}>
                            {item.value}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Vertical divider per Figma */}
                <div className="hidden lg:block w-px bg-[#242424]/20 self-stretch" />

                <div className="flex flex-col lg:pl-12">
                  {hasAuthorDetails ? (
                    <div>
                      <h3 className="font-serif text-[26px] font-bold text-[#242424] mb-6">
                        {t("product.aboutAuthor")}
                      </h3>
                      <div className="flex flex-col sm:flex-row gap-6 items-start">
                        {authorPhoto ? (
                          <img alt={authorName} className="h-[180px] w-[130px] rounded-[12px] object-cover shadow-md shrink-0" src={authorPhoto} />
                        ) : (
                          <div className="h-[180px] w-[130px] rounded-[12px] bg-[#f5f3ee] shrink-0" />
                        )}
                        <div className="flex flex-col">
                          {authorName ? (
                            <p className="font-serif text-[22px] font-bold text-[#242424]">{authorName}</p>
                          ) : null}
                          {authorBio ? (
                            <p className="mt-2 text-[14px] leading-relaxed text-[#242424]/90 line-clamp-4">
                              {authorBio}
                            </p>
                          ) : null}
                          <button className="mt-3 cursor-pointer text-left font-semibold text-[#0e503f] hover:underline text-[15px]" type="button"
                            onClick={() => authorId && router.push(lp(`/authors/${authorId}`))}>
                            {t("product.moreAboutAuthor")}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {desktopBooksByAuthorCards.length > 0 ? (
                    <div className="mt-12">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-serif text-[26px] font-bold text-[#242424]">
                          {t("product.booksByAuthor")}
                        </h3>
                        <button
                          className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#f5f3ee] text-xl font-bold text-[#242424] shadow-md hover:scale-105 transition-transform"
                          type="button"
                          aria-label={t("product.moreAuthorBooksAria")}
                        >
                          →
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-6">
                        {desktopBooksByAuthorCards.map((book, index) => (
                          <BookCard key={`${book.title}-${index}`} {...book} />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="mt-16 flex justify-end -mr-6 sm:-mr-10 md:-mr-14">
                <div
                  className="flex cursor-pointer items-center gap-4 rounded-l-[30px] bg-[#7e4d1e] px-8 py-5 text-[#ffd9d9] shadow-2xl transition-transform hover:translate-x-[-8px]"
                  onClick={() => router.push(lp("/community"))}
                >
                  <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-white/20 text-2xl font-bold text-white">
                    📖
                  </div>
                  <span className="font-serif text-[24px] font-bold">{t("product.goToCommunity")}</span>
                </div>
              </div>

              {/* Bottom torn paper edge of the main board */}
              <div className="w-full overflow-hidden leading-none text-[#c4a680] absolute left-0 right-0 top-full z-10 -mt-[1px]">
                <svg className="w-full h-[18px] block rotate-180" viewBox="0 0 1200 10" fill="currentColor" preserveAspectRatio="none">
                  <path d="M0,10 L0,5 C 15,2 30,7 45,4 S 75,1 90,5 S 120,2 135,6 S 165,1 180,4 S 210,7 225,3 S 255,1 270,5 S 300,2 315,6 S 345,1 360,4 S 390,7 405,3 S 435,1 450,5 S 480,2 495,6 S 525,1 540,4 S 570,7 585,3 S 615,1 630,5 S 660,2 675,6 S 705,1 720,4 S 750,7 765,3 S 795,1 810,5 S 840,2 855,6 S 885,1 900,4 S 930,7 945,3 S 975,1 990,5 S 1020,2 1035,6 S 1065,1 1080,4 S 1110,7 1125,3 S 1155,1 1170,5 S 1185,3 1200,4 L1200,10 Z" />
                </svg>
              </div>
            </div>
          </div>

          {/* 2. СЕРЕДНІЙ БЛОК: СМУГА ВІДГУКІВ НА ПОВНУ ШИРИНУ ЕКРАНУ (ЯК У FIGMA) */}
          <section className="relative w-full bg-[#fcfbf8] py-20 my-16 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            {/* Top torn edge pointing up */}
            <div className="w-full overflow-hidden leading-none text-[#fcfbf8] absolute left-0 right-0 bottom-full">
              <svg className="w-full h-[16px] block" viewBox="0 0 1200 10" fill="currentColor" preserveAspectRatio="none">
                <path d="M0,10 L0,5 C 15,2 30,7 45,4 S 75,1 90,5 S 120,2 135,6 S 165,1 180,4 S 210,7 225,3 S 255,1 270,5 S 300,2 315,6 S 345,1 360,4 S 390,7 405,3 S 435,1 450,5 S 480,2 495,6 S 525,1 540,4 S 570,7 585,3 S 615,1 630,5 S 660,2 675,6 S 705,1 720,4 S 750,7 765,3 S 795,1 810,5 S 840,2 855,6 S 885,1 900,4 S 930,7 945,3 S 975,1 990,5 S 1020,2 1035,6 S 1065,1 1080,4 S 1110,7 1125,3 S 1155,1 1170,5 S 1185,3 1200,4 L1200,10 Z" />
              </svg>
            </div>

            <div className="mx-auto max-w-[1280px] px-4 md:px-8">
              <div className="flex items-center gap-4 rounded-[30px] bg-[#f5f3ee] px-6 h-[60px] shadow-[0px_0px_15px_rgba(36,36,36,0.2)] border border-[#242424]/10 max-w-[1220px] mx-auto mb-12">
                <input
                  className="flex-1 bg-transparent text-[18px] text-[#242424] placeholder:text-[#242424]/60 focus:outline-none font-sans"
                  placeholder={t("product.addCommentPlaceholder")}
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCommentSubmit()}
                  disabled={isSubmittingComment}
                />
                <button
                  className="flex h-[46px] w-[54px] shrink-0 items-center justify-center rounded-full bg-[#242424] text-[20px] font-bold text-white transition-transform hover:scale-105 disabled:opacity-50"
                  type="button"
                  onClick={handleCommentSubmit}
                  disabled={isSubmittingComment || !newComment.trim()}
                  aria-label={t("product.sendCommentAria")}
                >
                  {isSubmittingComment ? "..." : "➢"}
                </button>
              </div>

              <div>
                {desktopReviewCards.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1220px] mx-auto">
                      {desktopPaginatedReviewCards.map((rev) => (
                        <ReviewCard
                          key={rev.id}
                          id={rev.id}
                          author={rev.author}
                          text={rev.text}
                          timeLabel={rev.timeLabel}
                          avatar={rev.avatar}
                          bookImage={rev.bookImage}
                          likesCount={rev.likesCount}
                        />
                      ))}
                    </div>
                    {desktopTotalReviewPages > 1 && (
                      <div className="w-full max-w-[1220px] mx-auto mt-10 h-[15px] bg-[#242424]/20 rounded-[62px] overflow-hidden">
                        <div
                          className="h-full bg-[#0e503f] rounded-[62px] transition-all duration-300"
                          style={{ width: `${(currentReviewPage / desktopTotalReviewPages) * 100}%` }}
                        />
                      </div>
                    )}
                    <ReviewPagination
                      currentPage={currentReviewPage}
                      totalPages={desktopTotalReviewPages}
                      onPageChange={setCurrentReviewPage}
                    />
                  </>
                ) : (
                  <div className="rounded-[20px] border border-dashed border-[#242424]/30 p-10 text-center">
                    <p className="text-[16px] text-[#242424]/60">
                      {t("product.noComments")}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom torn edge pointing down */}
            <div className="w-full overflow-hidden leading-none text-[#fcfbf8] absolute left-0 right-0 top-full">
              <svg className="w-full h-[16px] block rotate-180" viewBox="0 0 1200 10" fill="currentColor" preserveAspectRatio="none">
                <path d="M0,10 L0,5 C 15,2 30,7 45,4 S 75,1 90,5 S 120,2 135,6 S 165,1 180,4 S 210,7 225,3 S 255,1 270,5 S 300,2 315,6 S 345,1 360,4 S 390,7 405,3 S 435,1 450,5 S 480,2 495,6 S 525,1 540,4 S 570,7 585,3 S 615,1 630,5 S 660,2 675,6 S 705,1 720,4 S 750,7 765,3 S 795,1 810,5 S 840,2 855,6 S 885,1 900,4 S 930,7 945,3 S 975,1 990,5 S 1020,2 1035,6 S 1065,1 1080,4 S 1110,7 1125,3 S 1155,1 1170,5 S 1185,3 1200,4 L1200,10 Z" />
              </svg>
            </div>
          </section>

          {/* 3. НИЖНІЙ БЛОК: СХОЖІ ТА БІЛЬШЕ (НА ДЕРЕВ'ЯНОМУ ФОНІ З ВЕРХНІМИ ВКЛАДКАМИ ЯК У FIGMA) */}
          {desktopSimilarBookCards.length > 0 ? (
            <section className="relative w-full py-16 overflow-hidden">
              {/* Top wooden shelf edge */}
              <div className="w-full h-[24px] bg-[#4a2e18] shadow-[0_4px_10px_rgba(0,0,0,0.6)] border-t-2 border-[#684323] border-b border-[#2a1a0c] mb-8" />

              <div className="mx-auto max-w-[1280px] px-4 md:px-8">
                <div className="flex items-center justify-between mb-10">
                  <div className="rounded-[20px] bg-[#f5f3ee] px-8 py-3 font-serif text-[26px] font-bold text-[#242424] shadow-lg border border-[#242424]/10">
                    {t("product.similar")}
                  </div>
                  <button
                    type="button"
                    className="rounded-[20px] bg-[#f5f3ee] px-8 py-3 font-serif text-[18px] font-semibold text-[#242424] shadow-lg border border-[#242424]/10 hover:scale-105 transition-transform cursor-pointer"
                  >
                    {t("product.more")}
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 justify-items-center">
                  {desktopSimilarBookCards.map((book, index) => (
                    <BookCard key={`${book.title}-${index}`} {...book} />
                  ))}
                </div>
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </>
  );
}
