"use client";

import type { FormatType } from "@/lib/hooks/useCart";
import { useLocale, useTranslations } from "@/lib/i18n/LocaleProvider";
import styles from "./cart.module.css";

// ─── SVG Icons (inline, no external deps) ───
function PaperIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
      <path
        d="M6 2C4.9 2 4 2.9 4 4v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13zM8 14h8v2H8v-2zm0 4h5v2H8v-2z"
        fill="currentColor"
      />
    </svg>
  );
}

function EbookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
      <path
        d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H6V4h12v16zM8 10h8v2H8v-2zm0 4h5v2H8v-2z"
        fill="currentColor"
      />
    </svg>
  );
}

function AudioIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
      <path
        d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8.5v7a4.49 4.49 0 0 0 2.5-3.5zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
        fill="currentColor"
      />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 11H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 5V17M5 11H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"
        fill="currentColor"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4h-3.5z"
        fill="currentColor"
      />
    </svg>
  );
}

// ─── Types ───
export interface CartItemCardProps {
  productId: number;
  title: string;
  author: string | null;
  imageSrc: string | null;
  isAvailable: boolean;
  price: number;
  discountPrice: number | null;
  formats: Array<{ type: FormatType; available: boolean }>;
  formatQuantities: { paper: number; ebook: number; audio: number };
  onQuantityChange: (productId: number, format: FormatType, qty: number) => void;
  onRemove: (productId: number) => void;
}

const FORMAT_ICON: Record<FormatType, { icon: React.ReactNode; className: string; labelKey: string }> = {
  paper: { icon: <PaperIcon />, className: styles.formatPaper, labelKey: "cart.formatPaper" },
  ebook: { icon: <EbookIcon />, className: styles.formatEbook, labelKey: "cart.formatEbook" },
  audio: { icon: <AudioIcon />, className: styles.formatAudio, labelKey: "cart.formatAudio" },
};

export default function CartItemCard({
  productId,
  title,
  author,
  imageSrc,
  isAvailable,
  price,
  discountPrice,
  formats,
  formatQuantities,
  onQuantityChange,
  onRemove,
}: CartItemCardProps) {
  const t = useTranslations();
  const { locale } = useLocale();
  const unitPrice = discountPrice ?? price;

  function formatPrice(value: number): string {
    if (value === 0) return t("cart.zeroPrice");
    const formatted = new Intl.NumberFormat(locale === "en" ? "en-US" : "uk-UA").format(value);
    return t("cart.price").replace("{value}", formatted);
  }

  return (
    <div className={styles.cartCard} id={`cart-item-${productId}`}>
      {/* Book cover */}
      <div className={styles.cardImageWrap}>
        <img
          src={imageSrc || "/images/catalog/hunger_games.png"}
          alt={title}
          className={styles.cardImage}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/images/catalog/hunger_games.png";
          }}
        />
      </div>

      {/* Info + format rows */}
      <div className={styles.cardInfo}>
        <h3 className={styles.bookTitle}>{title}</h3>
        {author && <p className={styles.bookAuthor}>{author}</p>}
        <span className={`${styles.availability} ${!isAvailable ? styles.unavailable : ""}`}>
          {isAvailable ? t("cart.inStock") : t("cart.outOfStock")}
        </span>

        <div className={styles.formatRows}>
          {formats.map(({ type }) => {
            const config = FORMAT_ICON[type];
            const label = t(config.labelKey);
            const qty = formatQuantities[type];
            const linePrice = qty * unitPrice;

            return (
              <div key={type} className={styles.formatRow}>
                <div className={styles.formatIcon}>
                  <div className={`${styles.formatIconInner} ${config.className}`}>
                    {config.icon}
                  </div>
                </div>

                <div className={styles.quantityControls}>
                  <button
                    className={styles.qtyButton}
                    onClick={() => onQuantityChange(productId, type, qty - 1)}
                    aria-label={t("cart.decreaseQtyAria").replace("{format}", label)}
                    id={`qty-minus-${productId}-${type}`}
                  >
                    <MinusIcon />
                  </button>
                  <div className={styles.qtyValue}>{qty}</div>
                  <button
                    className={styles.qtyButton}
                    onClick={() => onQuantityChange(productId, type, qty + 1)}
                    aria-label={t("cart.increaseQtyAria").replace("{format}", label)}
                    id={`qty-plus-${productId}-${type}`}
                  >
                    <PlusIcon />
                  </button>
                </div>

                <div className={styles.formatPrice}>{formatPrice(linePrice)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action buttons */}
      <div className={styles.cardActions}>
        <button
          className={styles.favoriteBtn}
          aria-label={t("cart.addToFavoritesAria")}
          id={`favorite-${productId}`}
        >
          <HeartIcon />
        </button>
        <button
          className={styles.deleteBtn}
          onClick={() => onRemove(productId)}
          aria-label={t("cart.removeAria")}
          id={`delete-${productId}`}
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}
