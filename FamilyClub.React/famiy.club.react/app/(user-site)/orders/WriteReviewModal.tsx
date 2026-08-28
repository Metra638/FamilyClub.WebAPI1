"use client";

import React, { useState } from "react";
import { MockOrderItem } from "./mockData";
import { reviewService } from "@/lib/api/services";
import { getAuthToken } from "@/lib/auth/tokenStorage";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError("Будь ласка, введіть декілька слів про ваші враження");
      return;
    }

    setSubmitting(true);
    setError(null);

    const token = getAuthToken();
    const productId = item.productId;

    if (!token) {
      console.error("WriteReviewModal: потрібна авторизація для відгуку");
    } else if (!productId || productId <= 0) {
      console.error("WriteReviewModal: не вдалося визначити productId", { item });
    } else {
      try {
        await reviewService.apiReviewsPost(
          {
            reviewDto: {
              productId,
              comment: comment.trim(),
              rating,
              createdAt: new Date(),
              approved: true,
            },
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } catch (err) {
        console.error("Error posting review:", err);
      }
    }

    onSubmitSuccess(`Дякуємо! Ваш відгук до книги «${item.bookTitle}» опубліковано.`);
    onClose();
    setComment("");
    setRating(5);
    setImages([]);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div
        className="bg-[#F5F3EE] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#B7895E]/40 relative overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#E5E0D5] hover:bg-[#D8D2C5] text-[#242424] font-bold flex items-center justify-center transition"
          title="Закрити"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <span className="text-3xl mb-1 block">⭐✍️</span>
          <h2 className="text-2xl font-extrabold text-[#242424]">Відгук про товар</h2>
          <p className="text-xs text-[#666666] mt-1">
            Поділіться враженнями та допоможіть іншим читачам зробити вибір
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
            <p className="text-xs text-[#666666] mt-0.5">{item.orderNumber} • {item.price} грн</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-2 bg-white/70 p-4 rounded-2xl border border-[#C8C2B4]">
            <label className="text-sm font-bold text-[#242424]">Оцініть книгу:</label>
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
              {rating === 5
                ? "Відмінно! (5/5)"
                : rating === 4
                ? "Добре (4/5)"
                : rating === 3
                ? "Нормально (3/5)"
                : rating === 2
                ? "Погано (2/5)"
                : "Жахливо (1/5)"}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[#242424]">Текст відгуку *</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Напишіть, що вам сподобалося або не сподобалося в книзі, особливості оформлення чи сюжету..."
              className="w-full rounded-2xl border border-[#C8C2B4] p-3.5 text-sm bg-white text-[#242424] focus:outline-none focus:ring-2 focus:ring-[#005b33] transition"
              required
            />
          </div>

          <div className="bg-white/80 p-4 rounded-2xl border border-[#C8C2B4] space-y-3">
            <div>
              <h4 className="text-sm font-bold text-[#242424]">Твоє фото буде першим</h4>
              <p className="text-xs text-[#666666]">
                Можеш додати до 5 фото товару, щоб показати іншим покупцям, як він виглядає у житті
              </p>
            </div>

            {images.length > 0 && (
              <div className="flex flex-wrap gap-3 my-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#C8C2B4] group">
                    <img src={img} alt={`upload-${idx}`} className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute bottom-0 left-0 right-0 bg-[#005b33] text-white text-[9px] font-bold text-center py-0.5">
                        1-ше
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
                  Оберіть або перетягніть файли ({images.length}/5)
                </span>
                <span className="text-[11px] text-[#777777] mt-0.5">PNG, JPG, WEBP до 10MB</span>
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
              Скасувати
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-[#005b33] hover:bg-[#004828] text-white text-sm font-bold shadow-md transition disabled:opacity-50"
            >
              {submitting ? "Надсилання..." : "Опублікувати відгук"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
