export function translateListStatus(statusText: string, t: (k: string) => string): string {
  const map: Record<string, string> = {
    "Оформлено": "orders.status.placed",
    "Очікувана": "orders.status.awaiting",
    "Відправлено": "orders.status.shipped",
    "Доставлено": "orders.status.delivered",
    "Повернення": "orders.status.returning",
    "Скасовано": "orders.status.cancelled",
    "Повернено": "orders.status.returned",
  };
  const key = map[statusText];
  return key ? t(key) : statusText;
}
