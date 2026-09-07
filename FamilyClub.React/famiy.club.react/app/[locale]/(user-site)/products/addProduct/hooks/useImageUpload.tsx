import { useState } from "react";
import { ImageUploadState } from "@/app/(user-site)/products/addProduct/types";

export function useImageUpload(): ImageUploadState {
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const [gallery, setGallery] = useState<(File | null)[]>([
    null,
    null,
    null,
    null,
  ]);
  const [galleryPreviews, setGalleryPreviews] = useState<(string | null)[]>([
    null,
    null,
    null,
    null,
  ]);
  const handleMainChange = (file: File | null) => {
    if (!file) return;
    setMainImage(file);
    setMainPreview(URL.createObjectURL(file));
  };

  const handleGalleryChange = (index: number, file: File | null) => {
    const updated = [...gallery];
    updated[index] = file;
    setGallery(updated);
  };

  return {
    mainImage,
    mainPreview,
    gallery,
    galleryPreviews,

    setMainPreview,
    setGalleryPreviews,
    handleMainChange,
    handleGalleryChange,
  };
}
