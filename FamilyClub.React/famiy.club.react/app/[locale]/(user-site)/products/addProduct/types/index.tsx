import { Availability, CoverType } from "@/lib/api/generated";

export type ProductDto = {
  productName: string;
  price?: number;
  discountPrice?: number;
  promotionId?: number;
  description?: string;
  publisherId?: number;
  pageCount?: number;
  publishingYear?: number;
  isbn?: string;
  weightGrams?: number;
  itemsInSet?: number;
  categoryIds: number[];
  languageId?: number;
  coverType: CoverType;
  availability?: Availability;
  authorIds?: number[];
  formatIds?: number[];
  ageRestrictionIds?: number[];
  leaveOldImages: boolean;
  quantityInStock?: number;
  bookSizeIds: number[];
  productImages?: {
    imageData: string;
  }[];
};

export type ImageUploadState = {
  mainImage: File | null;
  mainPreview: string | null;
  gallery: (File | null)[];

  galleryPreviews: (string | null)[];

  setMainPreview: React.Dispatch<React.SetStateAction<string | null>>;
  setGalleryPreviews: React.Dispatch<React.SetStateAction<(string | null)[]>>;

  handleMainChange: (file: File | null) => void;
  handleGalleryChange: (index: number, file: File | null) => void;
};
