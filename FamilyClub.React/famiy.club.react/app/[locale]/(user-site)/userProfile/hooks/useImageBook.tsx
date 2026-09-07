import { ProductDto } from "@/lib/api/generated";
import { getProductCoverUrl } from "@/lib/products/productCoverUrl";

export function getImageSrc(book: ProductDto): string | null {
  return getProductCoverUrl(book);
}
