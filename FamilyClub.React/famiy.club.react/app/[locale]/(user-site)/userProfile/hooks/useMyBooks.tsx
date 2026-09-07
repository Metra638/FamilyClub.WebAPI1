"use client";

import { useEffect, useState } from "react";
import { ProductDto } from "@/lib/api/generated";
import { orderService, productService } from "@/lib/api/services";

export function useMyBooks(userId?: string) {
  const [myBooks, setMyBooks] = useState<ProductDto[]>([]);
  const [loadingMyBooks, setLoadingMyBooks] = useState(false);

  useEffect(() => {
    if (!userId) return;

    setLoadingMyBooks(true);

    orderService
      .apiOrdersByUserUserIdGet({ userId })
      .then(async (orders) => {
        // Збираємо унікальні productId з усіх замовлень
        const productIds = [
          ...new Set(
            orders
              .flatMap((o) => o.orderItems ?? [])
              .map((item) => item.productId)
              .filter((id): id is number => id != null)
          ),
        ];

        // Підтягуємо всі продукти і фільтруємо по id
        const allProducts = await productService.apiProductsGet();
        const myProducts = allProducts.filter((p) =>
          productIds.includes(p.id ?? -1)
        );

        setMyBooks(myProducts);
      })
      .catch(console.error)
      .finally(() => setLoadingMyBooks(false));
  }, [userId]);

  return { myBooks, setLoadingMyBooks, loadingMyBooks };
}