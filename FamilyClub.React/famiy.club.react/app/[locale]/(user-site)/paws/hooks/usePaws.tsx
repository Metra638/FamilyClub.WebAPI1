"use client";

import { useEffect, useState } from "react";
import { orderService, favoriteService } from "@/lib/api/services";
import type { OrderDTO } from "@/lib/api/generated";
import { getAuthToken } from "@/lib/auth/tokenStorage";
import { useLocale, useTranslations } from "@/lib/i18n/LocaleProvider";

export type PawsHistoryItem = {
  id: string;
  title: string;
  date: string;
  amount: number;
};

const PAWS_PERCENT_OF_ORDER = 5;
const PAWS_PER_FAVORITE = 5;
const PAWS_TO_UAH_RATE = 10;

const COMPLETED_STATUSES = ["completed", "delivered"];

export function usePaws(userId?: string) {
  const t = useTranslations();
  const { locale } = useLocale();
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const token = getAuthToken();
    setLoading(true);

    Promise.all([
      orderService.apiOrdersByUserUserIdGet({ userId }),
      token
        ? favoriteService.apiFavoritesGet({
            headers: { Authorization: `Bearer ${token}` },
          })
        : Promise.resolve([]),
    ])
      .then(([ordersRes, favoritesRes]) => {
        setOrders(ordersRes);
        setFavoritesCount(favoritesRes.length);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  const history: PawsHistoryItem[] = orders
    .filter((o) => o.status != null && COMPLETED_STATUSES.includes(o.status.toLowerCase()))
    .map((o) => {
      const total = o.totalPrice ?? 0;
      const earned = Math.round((total * PAWS_PERCENT_OF_ORDER) / 100);
      const items =
        o.orderItems
          ?.map((item) => item.productName)
          .filter(Boolean)
          .join(", ") || t("paws.productFallback");

      return {
        id: `order-${o.id}`,
        title: t("paws.purchaseTitle").replace("{items}", items),
        date: o.orderDate
          ? new Date(o.orderDate).toLocaleDateString(locale === "en" ? "en-GB" : "uk-UA")
          : "",
        amount: earned,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const pawsFromOrders = history.reduce((sum, h) => sum + h.amount, 0);
  const pawsFromFavorites = favoritesCount * PAWS_PER_FAVORITE;

  const paws = pawsFromOrders + pawsFromFavorites;
  const discountInUah = Math.floor((paws / 100) * PAWS_TO_UAH_RATE);

  return { paws, history, discountInUah, loading };
}
