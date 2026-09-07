"use client";

import { useState } from "react";
import type { OrderContextData } from "../hooks/useOrderContext";
import { formatOrderStatus } from "../hooks/useOrderContext";
import { useLocale, useTranslations } from "@/lib/i18n/LocaleProvider";
import styles from "../complaints.module.css";

function resolveProductImage(prod: { productImages?: { imageData?: string | null }[] | null } | null | undefined): string {
  const fallback = "/images/catalog/hunger_games.png";
  if (!prod?.productImages?.length || !prod.productImages[0].imageData) {
    return fallback;
  }

  const rawData = prod.productImages[0].imageData.trim();
  if (rawData.startsWith("data:") || rawData.startsWith("http://") || rawData.startsWith("https://")) {
    return rawData;
  }

  const isRelativeUrl =
    rawData.startsWith("/") &&
    !rawData.startsWith("/9j/") &&
    (rawData.startsWith("/images/") ||
      rawData.startsWith("/static/") ||
      rawData.startsWith("/assets/") ||
      rawData.startsWith("/uploads/") ||
      rawData.startsWith("/_next/") ||
      /\.(jpg|jpeg|png|webp|svg|gif|ico)$/i.test(rawData));

  if (isRelativeUrl) return rawData;

  let mimeType = "image/jpeg";
  if (rawData.startsWith("UklGR")) mimeType = "image/webp";
  else if (rawData.startsWith("/9j/") || rawData.startsWith("9j/")) mimeType = "image/jpeg";
  else if (rawData.startsWith("iVBORw0KGgo")) mimeType = "image/png";

  return `data:${mimeType};base64,${rawData}`;
}

type Props = {
  context: OrderContextData;
};

export default function OrderSummaryAccordion({ context }: Props) {
  const [open, setOpen] = useState(true);
  const { order, products } = context;
  const t = useTranslations();
  const { locale } = useLocale();

  const orderNumber = order.id
    ? `№ ${String(order.id).padStart(9, "0")}`
    : "№ —";

  const orderDate = order.orderDate
    ? new Date(order.orderDate).toLocaleDateString(
        locale === "en" ? "en-GB" : "uk-UA",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        },
      )
    : "—";

  const itemCount =
    order.orderItems?.reduce((sum, i) => sum + (i.quantity ?? 1), 0) ?? 0;

  const itemsWord =
    itemCount === 1 ? t("complaints.itemSingular") : t("complaints.itemPlural");
  const statusLabel = formatOrderStatus(order.status, {
    received: t("complaints.statusReceived"),
    shipped: t("complaints.statusShipped"),
    paid: t("complaints.statusPaid"),
    placed: t("complaints.statusPlaced"),
    cancelled: t("complaints.statusCancelled"),
  });
  const receivedLabel =
    statusLabel === t("complaints.statusReceived")
      ? t("complaints.receivedItems")
          .replace("{count}", String(itemCount))
          .replace("{items}", itemsWord)
      : t("complaints.statusWithItems")
          .replace("{status}", statusLabel)
          .replace("{count}", String(itemCount))
          .replace("{items}", itemsWord);

  return (
    <div className={styles.card}>
      <div
        className={styles.orderHeader}
        onClick={() => setOpen((v) => !v)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setOpen((v) => !v);
        }}
        aria-expanded={open}
      >
        <div>
          <div className={styles.orderMeta}>{t("complaints.orderLabel")}</div>
          <div className={styles.orderNumber}>{orderNumber}</div>
          <div className={styles.orderMeta}>{orderDate}</div>
          <span className={styles.statusBadge}>{receivedLabel}</span>
        </div>
        <span
          className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
          aria-hidden
        >
          ▼
        </span>
      </div>

      {open && (
        <div className={styles.orderBody}>
          {(order.orderItems ?? []).map((item, idx) => {
            const prod = item.productId
              ? products.find((p) => p.id === item.productId)
              : products[idx];

            return (
              <div key={item.id ?? idx} className={styles.bookRow}>
                <img
                  src={resolveProductImage(prod)}
                  alt=""
                  className={styles.bookCover}
                />
                <div>
                  <div className={styles.bookTitle}>
                    {prod?.productName ??
                      t("complaints.productFallback").replace(
                        "{id}",
                        String(item.productId ?? idx + 1),
                      )}
                  </div>
                  <div className={styles.bookQty}>
                    {t("complaints.qty").replace(
                      "{count}",
                      String(item.quantity ?? 1),
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
