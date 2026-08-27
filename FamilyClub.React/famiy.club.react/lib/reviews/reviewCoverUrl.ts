import { getProductCoverApiUrl } from "@/lib/products/productCoverUrl";

type ReviewImageLike = {
  id?: number;
  imageData?: string | null;
};

type ReviewCoverLike = {
  productId?: number;
  productImages?: ReviewImageLike[] | null;
};

function resolveEmbeddedImageData(imageData?: string | null): string | null {
  const normalized = imageData?.trim();
  if (!normalized || normalized === "AA==" || normalized === "AAA=") {
    return null;
  }

  if (
    normalized.startsWith("data:") ||
    normalized.startsWith("http://") ||
    normalized.startsWith("https://")
  ) {
    return normalized;
  }

  return `data:image/jpeg;base64,${normalized}`;
}

/** Cover for review lists: API URL when list has no ImageData bytes. */
export function getReviewProductCoverUrl(
  review?: ReviewCoverLike | null,
): string | null {
  if (!review) return null;

  const firstImage = review.productImages?.[0];
  const embedded = resolveEmbeddedImageData(firstImage?.imageData);
  if (embedded) return embedded;

  return getProductCoverApiUrl(review.productId, firstImage?.id);
}
