"use client";

import { useEffect, useState } from "react";
import { orderService, productService, publisherService } from "@/lib/api/services";
import type { OrderDTO, ProductDto, PublisherDto } from "@/lib/api/types";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

export type OrderContextData = {
  order: OrderDTO;
  products: ProductDto[];
  publisher: PublisherDto | null;
  primaryProduct: ProductDto | null;
};

type OrderStatusLabels = {
  received: string;
  shipped: string;
  paid: string;
  placed: string;
  cancelled: string;
};

const DEFAULT_STATUS_LABELS: OrderStatusLabels = {
  received: "Отримано",
  shipped: "Відправлено",
  paid: "Оплачено",
  placed: "Оформлено",
  cancelled: "Скасовано",
};

export function formatOrderStatus(
  status?: string | null,
  labels: OrderStatusLabels = DEFAULT_STATUS_LABELS,
): string {
  const s = (status || "").toLowerCase();
  if (s.includes("delivered") || s.includes("received") || s.includes("completed")) {
    return labels.received;
  }
  if (s.includes("sent") || s.includes("shipped")) return labels.shipped;
  if (s.includes("paid") || s.includes("processing")) return labels.paid;
  if (s.includes("pending")) return labels.placed;
  if (s.includes("cancelled")) return labels.cancelled;
  return status || labels.placed;
}

export function useOrderContext(orderId: number | null) {
  const t = useTranslations();
  const [data, setData] = useState<OrderContextData | null>(null);
  const [loading, setLoading] = useState(!!orderId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setData(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [order, allProducts, publishers] = await Promise.all([
          orderService.apiOrdersIdGet({ id: orderId! }),
          productService.apiProductsGet().catch(() => []),
          publisherService.apiPublishersGet().catch(() => []),
        ]);

        if (cancelled) return;

        const productMap = new Map<number, ProductDto>();
        (allProducts ?? []).forEach((p) => {
          if (p.id != null) productMap.set(p.id, p);
        });

        const orderProducts = (order.orderItems ?? [])
          .map((item) => (item.productId ? productMap.get(item.productId) : undefined))
          .filter(Boolean) as ProductDto[];

        const primaryProduct = orderProducts[0] ?? null;
        const publisherId = primaryProduct?.publisherId;
        const publisher =
          publisherId != null
            ? (publishers ?? []).find((p) => p.id === publisherId) ?? null
            : null;

        setData({
          order,
          products: orderProducts,
          publisher,
          primaryProduct,
        });
      } catch {
        if (!cancelled) setError(t("complaints.loadOrderError"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [orderId, t]);

  return { data, loading, error };
}
