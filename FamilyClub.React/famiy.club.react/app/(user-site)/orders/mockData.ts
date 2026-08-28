export type OrderTabId = 
  | "waiting_payment"
  | "waiting_dispatch"
  | "order_sent"
  | "add_review"
  | "returns"
  | "history";

export interface OrderTabInfo {
  id: OrderTabId;
  label: string;
  count?: number;
}

export const ORDERS_TABS: OrderTabInfo[] = [
  { id: "waiting_payment", label: "Очікування оплати" },
  { id: "waiting_dispatch", label: "Очікування відправки" },
  { id: "order_sent", label: "Замовлення надіслано" },
  { id: "add_review", label: "Додати відгук" },
  { id: "returns", label: "Повернення" },
  { id: "history", label: "Історія" },
];

export interface MockOrderItem {
  id: string;
  dbOrderId?: number;
  productId?: number;
  orderNumber: string;
  statusText: string;
  statusColor: string;
  lastStatusDate: string;
  bookTitle: string;
  bookImage: string;
  quantity: number;
  price: number;
  formats: ("ebook" | "audio" | "print" | string)[];
  showConfirmReceiptBtn?: boolean;
}

export const EMPTY_ORDERS_BY_TAB: Record<OrderTabId, MockOrderItem[]> = {
  waiting_payment: [],
  waiting_dispatch: [],
  order_sent: [],
  add_review: [],
  returns: [],
  history: [],
};

// Демонстраційний набір замовлень для заповнення сторінок у разі відсутності даних у БД
export const INITIAL_DEMO_ORDERS: Record<OrderTabId, MockOrderItem[]> = {
  waiting_payment: [
    {
      id: "demo-101",
      dbOrderId: 101,
      orderNumber: "№547367634778",
      statusText: "Оформлено",
      statusColor: "#005b33",
      lastStatusDate: "27.04.26, 11:36",
      bookTitle: "Салимове Лігво",
      bookImage: "/images/catalog/hunger_games.png",
      quantity: 1,
      price: 245,
      formats: ["print"],
    },
    {
      id: "demo-102",
      dbOrderId: 102,
      orderNumber: "№547367634779",
      statusText: "Оформлено",
      statusColor: "#005b33",
      lastStatusDate: "27.04.26, 12:15",
      bookTitle: "Коти вояки: На волю!",
      bookImage: "/images/catalog/hunger_games.png",
      quantity: 1,
      price: 330,
      formats: ["print", "audio"],
    },
  ],
  waiting_dispatch: [
    {
      id: "demo-103",
      dbOrderId: 103,
      orderNumber: "№547367634780",
      statusText: "Очікувана",
      statusColor: "#005b33",
      lastStatusDate: "26.04.26, 15:40",
      bookTitle: "Голодні ігри",
      bookImage: "/images/catalog/hunger_games.png",
      quantity: 1,
      price: 290,
      formats: ["print"],
    },
    {
      id: "demo-104",
      dbOrderId: 104,
      orderNumber: "№547367634781",
      statusText: "Очікувана",
      statusColor: "#005b33",
      lastStatusDate: "25.04.26, 09:20",
      bookTitle: "Дюна",
      bookImage: "/images/catalog/hunger_games.png",
      quantity: 1,
      price: 450,
      formats: ["print", "ebook"],
    },
  ],
  order_sent: [
    {
      id: "demo-105",
      dbOrderId: 105,
      orderNumber: "№547367634782",
      statusText: "Відправлено",
      statusColor: "#005b33",
      lastStatusDate: "24.04.26, 18:05",
      bookTitle: "Маленький принц",
      bookImage: "/images/catalog/hunger_games.png",
      quantity: 1,
      price: 180,
      formats: ["print"],
      showConfirmReceiptBtn: true,
    },
    {
      id: "demo-106",
      dbOrderId: 106,
      orderNumber: "№547367634783",
      statusText: "Відправлено",
      statusColor: "#005b33",
      lastStatusDate: "23.04.26, 14:10",
      bookTitle: "1984",
      bookImage: "/images/catalog/hunger_games.png",
      quantity: 1,
      price: 210,
      formats: ["print", "audio"],
      showConfirmReceiptBtn: true,
    },
  ],
  add_review: [
    {
      id: "demo-107",
      dbOrderId: 107,
      orderNumber: "№547367634784",
      statusText: "Доставлено",
      statusColor: "#005b33",
      lastStatusDate: "20.04.26, 10:00",
      bookTitle: "Кобзар",
      bookImage: "/images/catalog/hunger_games.png",
      quantity: 1,
      price: 320,
      formats: ["print"],
    },
    {
      id: "demo-108",
      dbOrderId: 108,
      orderNumber: "№547367634785",
      statusText: "Доставлено",
      statusColor: "#005b33",
      lastStatusDate: "18.04.26, 16:45",
      bookTitle: "Гаррі Поттер і філософський камінь",
      bookImage: "/images/catalog/hunger_games.png",
      quantity: 1,
      price: 380,
      formats: ["print", "ebook", "audio"],
    },
  ],
  returns: [
    {
      id: "demo-109",
      dbOrderId: 109,
      orderNumber: "№547367634786",
      statusText: "Доставлено",
      statusColor: "#005b33",
      lastStatusDate: "15.04.26, 11:30",
      bookTitle: "Тіні забутих предків",
      bookImage: "/images/catalog/hunger_games.png",
      quantity: 1,
      price: 260,
      formats: ["print"],
    },
  ],
  history: [
    {
      id: "demo-110",
      dbOrderId: 110,
      orderNumber: "№547367634787",
      statusText: "Доставлено",
      statusColor: "#005b33",
      lastStatusDate: "10.04.26, 09:15",
      bookTitle: "Відьмак: Останнє бажання",
      bookImage: "/images/catalog/hunger_games.png",
      quantity: 1,
      price: 340,
      formats: ["print"],
    },
    {
      id: "demo-111",
      dbOrderId: 111,
      orderNumber: "№547367634788",
      statusText: "Скасовано",
      statusColor: "#C0392B",
      lastStatusDate: "05.04.26, 14:00",
      bookTitle: "Володар перснів: Братство персня",
      bookImage: "/images/catalog/hunger_games.png",
      quantity: 1,
      price: 520,
      formats: ["print"],
    },
    {
      id: "demo-112",
      dbOrderId: 112,
      orderNumber: "№547367634789",
      statusText: "Повернено",
      statusColor: "#2A2A2A",
      lastStatusDate: "01.04.26, 17:30",
      bookTitle: "Алхімік",
      bookImage: "/images/catalog/hunger_games.png",
      quantity: 1,
      price: 195,
      formats: ["print"],
    },
  ],
};
