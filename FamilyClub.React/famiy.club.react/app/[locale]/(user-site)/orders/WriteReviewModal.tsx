"use client";

import React, { useState } from "react";
import { MockOrderItem } from "./mockData";
import { reviewService } from "@/lib/api/services";
import { getAuthToken } from "@/lib/auth/tokenStorage";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MockOrderItem | null;
  onSubmitSuccess: (msg: string) => void;
}

export default function WriteReviewModal({
  isOpen,
  onClose,
  item,
  onSubmitSuccess,
}: WriteReviewModalProps) {
  const t = useTranslations();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !item) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const maxAllowed = 5 - images.length;
    const filesToProcess = Array.from(files).slice(0, maxAllowed);

    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImages((prev) => [...prev, reader.result as string].slice(0, 5));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const ratingLabel =
    rating === 5
      ? t("orders.reviewModal.rating.r5")
      : rating === 4
        ? t("orders.reviewModal.rating.r4")
        : rating === 3
          ? t("orders.reviewModal.rating.r3")
          : rating === 2
            ? t("orders.reviewModal.rating.r2")
            : t("orders.reviewModal.rating.r1");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError(t("orders.reviewModal.errComment"));
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setError(t("orders.reviewModal.errAuth"));
      return;
    }

    const productId = item.productId;
    if (!productId || productId <= 0) {
      setError(t("orders.reviewModal.errProduct"));
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await reviewService.apiReviewsPost({
        reviewDto: {
          productId,
          comment: comment.trim(),
          rating,
          createdAt: new Date(),
          approved: true,
        },
      });

      onSubmitSuccess(
        t("orders.reviewModal.success").replace("{title}", item.bookTitle)
      );
      onClose();
      setComment("");
      setRating(5);
      setImages([]);
    } catch (err: any) {
      console.error("Error posting review:", err);
      if (err?.response?.status === 401) {
        setError(t("orders.reviewModal.errSession"));
      } else {
        setError(t("orders.reviewModal.errGeneric"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const priceLabel = t("cart.price").replace("{value}", String(item.price));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div
        className="bg-[#F5F3EE] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#B7895E]/40 relative overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#E5E0D5] hover:bg-[#D8D2C5] text-[#242424] font-bold flex items-center justify-center transition"
          title={t("orders.reviewModal.closeAria")}
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <span className="text-3xl mb-1 block">⭐✍️</span>
          <h2 className="text-2xl font-extrabold text-[#242424]">{t("orders.reviewModal.title")}</h2>
          <p className="text-xs text-[#666666] mt-1">
            {t("orders.reviewModal.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-4 bg-[#E8E3D8] p-4 rounded-2xl mb-6 border border-[#DCD7CC]">
          <div className="w-14 h-20 relative rounded overflow-hidden shadow shrink-0 bg-white border border-gray-200">
            <img
              src={item.bookImage || "/images/catalog/hunger_games.png"}
              alt={item.bookTitle}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/images/catalog/hunger_games.png";
              }}
            />
          </div>
          <div>
            <h3 className="font-bold text-[#242424] text-base leading-snug">{item.bookTitle}</h3>
            <p className="text-xs text-[#666666] mt-0.5">{item.orderNumber} • {priceLabel}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-2 bg-white/70 p-4 rounded-2xl border border-[#C8C2B4]">
            <label className="text-sm font-bold text-[#242424]">{t("orders.reviewModal.rateLabel")}</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="text-3xl sm:text-4xl transition-transform hover:scale-125 focus:outline-none"
                  >
                    <span className={isFilled ? "text-amber-500" : "text-gray-300"}>★</span>
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-bold text-[#005b33]">
              {ratingLabel}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[#242424]">{t("orders.reviewModal.commentLabel")}</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder={t("orders.reviewModal.commentPlaceholder")}
              className="w-full rounded-2xl border border-[#C8C2B4] p-3.5 text-sm bg-white text-[#242424] focus:outline-none focus:ring-2 focus:ring-[#005b33] transition"
              required
            />
          </div>

          <div className="bg-white/80 p-4 rounded-2xl border border-[#C8C2B4] space-y-3">
            <div>
              <h4 className="text-sm font-bold text-[#242424]">{t("orders.reviewModal.photosTitle")}</h4>
              <p className="text-xs text-[#666666]">
                {t("orders.reviewModal.photosHint")}
              </p>
            </div>

            {images.length > 0 && (
              <div className="flex flex-wrap gap-3 my-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#C8C2B4] group">
                    <img src={img} alt={`upload-${idx}`} className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute bottom-0 left-0 right-0 bg-[#005b33] text-white text-[9px] font-bold text-center py-0.5">
                        {t("orders.reviewModal.firstBadge")}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white text-xs flex items-center justify-center hover:bg-red-600 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {images.length < 5 && (
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-[#B7895E] rounded-xl cursor-pointer hover:bg-[#F5F3EE] transition text-center">
                <span className="text-2xl mb-1">📸</span>
                <span className="text-xs font-bold text-[#005b33]">
                  {t("orders.reviewModal.chooseFiles").replace("{count}", String(images.length))}
                </span>
                <span className="text-[11px] text-[#777777] mt-0.5">{t("orders.reviewModal.fileTypes")}</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {error && <p className="text-xs text-red-600 font-semibold text-center">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#C8C2B4] bg-[#E5E0D5] hover:bg-[#D8D2C5] text-[#242424] text-sm font-medium transition"
            >
              {t("orders.reviewModal.cancel")}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-[#005b33] hover:bg-[#004828] text-white text-sm font-bold shadow-md transition disabled:opacity-50"
            >
              {submitting ? t("orders.reviewModal.submitting") : t("orders.reviewModal.publish")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
