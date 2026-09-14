import type { ProductDto } from "@/lib/api/generated";
import { apiBasePath } from "@/lib/api/services";

type ProductImageLike = {
  id?: number;
  imageData?: string | null;
  imageName?: string | null;
};

/** URL for lazy-loaded cover via API (no base64 in catalog list). */
export function getProductCoverApiUrl(
  productId?: number | null,
  imageId?: number | null,
): string | null {
  if (productId == null || imageId == null) return null;
  const base = apiBasePath.replace(/\/$/, "");
  return `${base}/api/Products/${productId}/images/${imageId}`;
}

export function resolveEmbeddedImageData(image: ProductImageLike): string | null {
  const normalizedData = image.imageData?.trim();
  if (!normalizedData || normalizedData === "AA==" || normalizedData === "AAA=") {
    return null;
  }

  if (
    normalizedData.startsWith("data:") ||
    normalizedData.startsWith("http://") ||
    normalizedData.startsWith("https://")
  ) {
    return normalizedData;
  }

  const isRelativeUrl =
    normalizedData.startsWith("/") &&
    !normalizedData.startsWith("/9j/") &&
    (normalizedData.startsWith("/images/") ||
      normalizedData.startsWith("/static/") ||
      normalizedData.startsWith("/assets/") ||
      normalizedData.startsWith("/uploads/") ||
      normalizedData.startsWith("/_next/") ||
      normalizedData.startsWith("/api/") ||
      /\.(jpg|jpeg|png|webp|svg|gif|ico)$/i.test(normalizedData));

  if (isRelativeUrl) {
    return normalizedData;
  }

  const mimeType = (() => {
    if (normalizedData.startsWith("UklGR")) return "image/webp";
    if (normalizedData.startsWith("/9j/") || normalizedData.startsWith("9j/")) return "image/jpeg";
    if (normalizedData.startsWith("iVBORw0KGgo")) return "image/png";
    if (normalizedData.startsWith("R0lGOD")) return "image/gif";

    const extension = image.imageName?.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "webp":
        return "image/webp";
      case "png":
        return "image/png";
      case "gif":
        return "image/gif";
      default:
        return "image/jpeg";
    }
  })();

  return `data:${mimeType};base64,${normalizedData}`;
}

/** Resolves any product image: embedded Base64 data URL, relative URL, or lazy API URL fallback. */
export function getProductImageUrl(
  product?: { id?: number | null } | null,
  image?: ProductImageLike | null,
): string | null {
  if (!image) return null;
  const embedded = resolveEmbeddedImageData(image);
  if (embedded) return embedded;
  return getProductCoverApiUrl(product?.id, image.id);
}

/** Cover for grids/lists: API URL when list has no bytes, else legacy base64/url. */
export function getProductCoverUrl(product?: ProductDto | null): string | null {
  if (!product) return null;

  const image = product.productImages?.[0];
  if (!image) return null;

  return getProductImageUrl(product, image);
}
