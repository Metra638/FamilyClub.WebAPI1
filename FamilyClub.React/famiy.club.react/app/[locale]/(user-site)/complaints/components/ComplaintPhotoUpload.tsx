"use client";

import { useRef } from "react";
import Image from "next/image";
import type { ComplaintImagePreview } from "../hooks/useComplaintImages";
import { useTranslations } from "@/lib/i18n/LocaleProvider";
import styles from "../complaints.module.css";

type Props = {
  images: ComplaintImagePreview[];
  canAddMore: boolean;
  maxImages: number;
  onAdd: (file: File | null) => void;
  onRemove: (index: number) => void;
};

export default function ComplaintPhotoUpload({
  images,
  canAddMore,
  maxImages,
  onAdd,
  onRemove,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations();

  return (
    <div className={styles.card}>
      <div
        className={styles.uploadZone}
        onClick={() => canAddMore && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && canAddMore) {
            inputRef.current?.click();
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className={styles.hiddenInput}
          disabled={!canAddMore}
          onChange={(e) => {
            onAdd(e.target.files?.[0] ?? null);
            e.target.value = "";
          }}
        />

        <div className={styles.uploadIconWrap}>
          <Image
            src="/images/addProducts/Ellipse 36.svg"
            alt=""
            width={64}
            height={64}
          />
          <Image
            src="/images/addProducts/plus-solid-full 1.svg"
            alt=""
            width={28}
            height={28}
            style={{ position: "absolute" }}
          />
        </div>
        <div className={styles.uploadTitle}>{t("complaints.uploadTitle")}</div>
        <div className={styles.uploadHint}>{t("complaints.uploadHint")}</div>
      </div>

      <p className={styles.uploadNote}>
        {t("complaints.uploadNote").replace("{max}", String(maxImages))}
      </p>

      {images.length > 0 && (
        <div className={styles.previewGrid}>
          {images.map((img, index) => (
            <div key={img.previewUrl} className={styles.previewItem}>
              <img
                src={img.previewUrl}
                alt=""
                className={styles.previewImg}
              />
              <button
                type="button"
                className={styles.previewRemove}
                onClick={() => onRemove(index)}
                aria-label={t("complaints.removePhotoAria")}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
