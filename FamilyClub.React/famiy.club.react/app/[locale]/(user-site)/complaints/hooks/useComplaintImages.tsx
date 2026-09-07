"use client";

import { useCallback, useState } from "react";
import type { ComplaintImageCreateDto } from "@/lib/api/types";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

const MAX_IMAGES = 5;
const MAX_FILE_BYTES = 4 * 1024 * 1024; // 4 MB per image

export type ComplaintImagePreview = {
  file: File;
  previewUrl: string;
};

export function useComplaintImages() {
  const t = useTranslations();
  const [images, setImages] = useState<ComplaintImagePreview[]>([]);
  const [sizeError, setSizeError] = useState<string | null>(null);

  const addImage = useCallback(
    (file: File | null) => {
      if (!file) return;
      if (images.length >= MAX_IMAGES) return;

      if (file.size > MAX_FILE_BYTES) {
        setSizeError(t("complaints.photoTooLarge"));
        return;
      }

      setSizeError(null);
      setImages((prev) => [
        ...prev,
        { file, previewUrl: URL.createObjectURL(file) },
      ]);
    },
    [images.length, t],
  );

  const removeImage = useCallback((index: number) => {
    setImages((prev) => {
      const next = [...prev];
      const removed = next.splice(index, 1)[0];
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return next;
    });
  }, []);

  const toCreateDtos = useCallback(async (): Promise<ComplaintImageCreateDto[]> => {
    const results: ComplaintImageCreateDto[] = [];

    for (const img of images) {
      const base64 = await fileToBase64(img.file);
      results.push({
        imageData: base64,
        imageName: img.file.name,
        contentType: img.file.type || "image/jpeg",
      });
    }

    return results;
  }, [images]);

  return {
    images,
    addImage,
    removeImage,
    maxImages: MAX_IMAGES,
    canAddMore: images.length < MAX_IMAGES,
    toCreateDtos,
    sizeError,
  };
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
