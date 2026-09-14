import type {
    ClubMemberReadDto,
    OrderDTO,
    ProductDto,
} from "@/lib/api/generated";
import {
    normalizeOrderStatusGroup,
    type OrderStatusGroupId,
} from "@/lib/constants/orderStatusGroups";
import { mediaSrc } from "@/lib/platformSettings/platformSettingsApi";

export type AdminOrderStatusId = OrderStatusGroupId;

export const ADMIN_ORDER_STATUS_META: Record<
    AdminOrderStatusId,
    { tabLabel: string; badgeLabel: string; color: string }
> = {
    accepted: {
        tabLabel: "Прийняті",
        badgeLabel: "Прийняте",
        color: "#2F7D32",
    },
    shipped: {
        tabLabel: "Відправленні",
        badgeLabel: "Відправлене",
        color: "#1A7A8C",
    },
    completed: {
        tabLabel: "Доставленні",
        badgeLabel: "Доставлено",
        color: "#D97706",
    },
    cancelled: {
        tabLabel: "Скасовані",
        badgeLabel: "Скасоване",
        color: "#C0392B",
    },
    disputed: {
        tabLabel: "На повернення",
        badgeLabel: "Повернене",
        color: "#7B3FA0",
    },
};

export const PAYMENT_OPTIONS = [
    { value: "card_online", label: "Онлайн (Stripe)" },
    { value: "cash_on_delivery", label: "Оплата при отриманні" },
    { value: "card_dia", label: "Дія / єКнига (в розробці)" },
] as const;

function resolvePaymentOption(paymentMethod?: string | null) {
    const normalized = (paymentMethod ?? "").trim();
    const found = PAYMENT_OPTIONS.find((option) => option.value === normalized);
    if (found) return found;

    if (normalized === "online") return PAYMENT_OPTIONS[0];
    if (normalized === "cod") return PAYMENT_OPTIONS[1];

    return { value: normalized || "unknown", label: normalized || "Невідомо" };
}

export const DELIVERY_OPTIONS = [
    { value: "nova", label: "Нова пошта" },
    { value: "ukr", label: "Укрпошта" },
] as const;

export function getOrderStatusMeta(status?: string | null) {
    const id = normalizeOrderStatusGroup(status);
    return { id, ...ADMIN_ORDER_STATUS_META[id] };
}

export function displayMemberName(
    member?: ClubMemberReadDto | null,
    fallback = "Невідомий клієнт"
): string {
    if (!member) return fallback;
    const full = [member.name, member.surname].filter(Boolean).join(" ").trim();
    return full || member.email || fallback;
}

export function formatOrderNumber(id?: number | null): string {
    if (id == null) return "—";
    return `#${id}`;
}

export function formatMoney(value?: number | null): string {
    if (value == null || Number.isNaN(value)) return "—";
    return `${Math.round(value).toLocaleString("uk-UA")}₴`;
}

export function formatDate(value?: Date | string | null): string {
    if (!value) return "—";
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("uk-UA", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

export function formatDateTime(value?: Date | string | null): string {
    if (!value) return "—";
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return (
        d.toLocaleDateString("uk-UA", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }) +
        ", " +
        d.toLocaleTimeString("uk-UA", {
            hour: "2-digit",
            minute: "2-digit",
        })
    );
}

/** Enrichment for fields still missing from OrderDTO (delivery/TTN remain synthetic). */
export function getOrderExtras(order: OrderDTO) {
    const id = order.id ?? 0;
    const payment = resolvePaymentOption(order.paymentMethod);
    const delivery = DELIVERY_OPTIONS[id % DELIVERY_OPTIONS.length];
    const shipped =
        normalizeOrderStatusGroup(order.status) === "accepted"
            ? null
            : order.orderDate
              ? new Date(
                    new Date(order.orderDate).getTime() + 24 * 60 * 60 * 1000
                )
              : null;

    return {
        paymentMethod: payment.value,
        paymentLabel: payment.label,
        deliveryMethod: delivery.value,
        deliveryLabel: delivery.label,
        ttn: id ? String(2000000000 + id) : "—",
        shippedAt: shipped,
        address: "м. Київ, вул. Хрещатик, 22, кв. 15",
    };
}

export function resolveProductImage(
    product?: ProductDto | null
): string | null {
    const raw = product?.productImages?.[0]?.imageData;
    return mediaSrc(raw) ?? null;
}

export function getProductCover(
    productId: number | undefined,
    products: Map<number, ProductDto>
): string {
    if (productId == null) return "/images/catalog/hunger_games.png";
    return (
        resolveProductImage(products.get(productId)) ??
        "/images/catalog/hunger_games.png"
    );
}
