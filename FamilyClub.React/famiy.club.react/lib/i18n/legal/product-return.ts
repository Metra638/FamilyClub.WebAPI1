import type { LocalizedContent, ProductReturnContent } from "./types";

export const productReturnContent: LocalizedContent<ProductReturnContent> = {
  uk: {
    backAria: "Назад",
    title: "Повернення замовлення",
    badge: "Як скасувати?",
    highlight:
      "Повернення можливе протягом 14 днів з моменту отримання замовлення.",
    intro:
      "У Librellis ми прагнемо забезпечити максимальну зручність. Якщо ви бажаєте скасувати замовлення або оформити повернення товарів, ми надали простий онлайн-інструмент у особистому кабінеті.",
    cancelTitle: "1. Скасування або повернення через особистий кабінет",
    cancelIntro: "Ви можете оформити повернення або скасування в декілька кліків:",
    cancelSteps: [
      {
        type: "link",
        before: "Перейдіть у розділ",
        linkText: "Мої замовлення",
        after: ".",
        href: "/orders",
      },
      {
        type: "text",
        text: "Знайдіть відповідне замовлення та натисніть «Детальніше».",
      },
      {
        type: "text",
        text: "Натисніть кнопку «Повернути товар» або «Написати продавцю».",
      },
    ],
    defectTitle: "2. Виявлено брак або пошкодження",
    defectItems: [
      "Відсутні або переплутані сторінки в книзі",
      "Розмитий або нечитабельний друк",
      "Значні механічні пошкодження, отримані при транспортуванні",
    ],
    qualityTitle: "3. Умови повернення товарів належної якості",
    qualityIntroBefore: "Обмін або повернення можливі протягом",
    qualityIntroStrong: "14 днів",
    qualityIntroAfter: "з моменту отримання:",
    qualityItems: [
      "Збережено товарний вигляд книги (відсутні згини, закладки, сліди читання)",
      "Збережено оригінальну обгортку / пакування",
      "Є документ або розрахунковий номер замовлення",
    ],
    refundTitle: "4. Повернення коштів",
    refundBefore:
      "Після перевірки повернутого товару на складі кошти зараховуються на вашу банківську картку або IBAN протягом",
    refundStrong: "1–3 робочих днів",
    refundAfter: ".",
    helpTitle: "Потрібна допомога?",
    supportTitle: "Служба підтримки Librellis:",
    phoneLabel: "Телефон:",
    phoneHref: "08005553535",
    phoneDisplay: "0 (800) 555 35 35",
    freeNote: "(безкоштовно)",
    schedule: "Графік: Пн–Пт з 09:00 до 18:00",
  },
  en: {
    backAria: "Back",
    title: "Order returns",
    badge: "How to cancel?",
    highlight: "Returns are possible within 14 days of receiving the order.",
    intro:
      "At Librellis we aim for maximum convenience. If you want to cancel an order or return items, we provide a simple online tool in your personal account.",
    cancelTitle: "1. Cancel or return via your personal account",
    cancelIntro: "You can request a return or cancellation in a few clicks:",
    cancelSteps: [
      {
        type: "link",
        before: "Go to",
        linkText: "My orders",
        after: ".",
        href: "/orders",
      },
      {
        type: "text",
        text: "Find the relevant order and tap «Details».",
      },
      {
        type: "text",
        text: "Tap «Return item» or «Message the seller».",
      },
    ],
    defectTitle: "2. Defect or damage found",
    defectItems: [
      "Missing or mixed-up pages in a book",
      "Blurry or unreadable print",
      "Significant mechanical damage received in transit",
    ],
    qualityTitle: "3. Return conditions for goods of proper quality",
    qualityIntroBefore: "Exchange or return is possible within",
    qualityIntroStrong: "14 days",
    qualityIntroAfter: "of receipt:",
    qualityItems: [
      "The book’s retail condition is preserved (no bends, bookmarks, or reading marks)",
      "Original wrap / packaging is preserved",
      "You have a document or the order settlement number",
    ],
    refundTitle: "4. Refunds",
    refundBefore:
      "After the returned item is checked at the warehouse, funds are credited to your bank card or IBAN within",
    refundStrong: "1–3 business days",
    refundAfter: ".",
    helpTitle: "Need help?",
    supportTitle: "Librellis support:",
    phoneLabel: "Phone:",
    phoneHref: "08005553535",
    phoneDisplay: "0 (800) 555 35 35",
    freeNote: "(free)",
    schedule: "Hours: Mon–Fri from 09:00 to 18:00",
  },
};
