import type { LocalizedContent, PaymentDeliveryContent } from "./types";

export const paymentDeliveryContent: LocalizedContent<PaymentDeliveryContent> = {
  uk: {
    backAria: "Назад",
    deliveryTitle: "Доставка",
    deliveryIntro: [
      "Ми відправляємо замовлення зі складів в Україні. Після оформлення замовлення комплектація зазвичай триває до 1–2 робочих днів (у періоди розпродажів — до 3 робочих днів).",
      "Вартість і строки залежать від обраного перевізника, ваги посилки та населеного пункту отримувача. Точну суму доставки ви бачите на етапі оформлення замовлення.",
    ],
    carriers: [
      {
        name: "Нова Пошта",
        accent: "#ED1C24",
        blocks: [
          {
            subtitle: "Відділення",
            items: [
              "Вартість — від 70 грн (залежить від габаритів і тарифу перевізника)",
              "Безкоштовна доставка при сумі замовлення від 2000 грн",
              "Строк доставки — зазвичай 1–2 дні",
              "Зберігання у відділенні — до 5 днів (далі — за тарифами НП)",
            ],
          },
          {
            subtitle: "Поштомати",
            items: [
              "Вартість — від 50 грн",
              "Безкоштовна доставка при сумі замовлення від 2000 грн",
              "Строк доставки — зазвичай 1–2 дні",
              "Зручне отримання цілодобово в межах графіку поштомату",
            ],
          },
        ],
      },
      {
        name: "Укрпошта",
        accent: "#FFCC00",
        blocks: [
          {
            subtitle: "Експрес",
            items: [
              "Вартість — від 40 грн",
              "Строк доставки — зазвичай 1–2 дні",
              "Доставка у відділення Укрпошти по всій Україні",
            ],
          },
          {
            subtitle: "Стандарт",
            items: [
              "Вартість — від 35 грн",
              "Строк доставки — зазвичай 3–6 днів",
              "Економний варіант для невеликих відправлень",
            ],
          },
        ],
      },
      {
        name: "Meest",
        accent: "#0057A8",
        blocks: [
          {
            items: [
              "Доставка у відділення — від 35 грн",
              "Строк доставки — зазвичай 3–5 днів",
              "Відстеження посилки за номером ТТН у кабінеті Meest",
            ],
          },
        ],
      },
      {
        name: "Nova Post (міжнародна)",
        accent: "#ED1C24",
        blocks: [
          {
            paragraphs: [
              "Доставка за кордон (Польща, Німеччина, Чехія, Італія, Іспанія, Франція та інші країни присутності Nova Post):",
            ],
            items: [
              "Вартість — від 250 грн (залежить від ваги, країни та тарифу)",
              "Строки — зазвичай від 3–10 робочих днів",
              "Оформлення за паспортними / митними даними отримувача",
              "Детальний розрахунок — під час оформлення замовлення",
            ],
          },
        ],
      },
    ],
    deliveryNote:
      "Після відправлення ви отримаєте номер ТТН на email / у кабінеті замовлень. Затримки можливі через форс-мажор перевізника або митне оформлення (для міжнародних відправлень).",
    paymentTitle: "Оплата",
    paymentMethods: [
      {
        title: "1. Оплата карткою на сайті",
        items: [
          "Онлайн-оплата банківською карткою через захищений платіжний шлюз",
          "Підтримуються картки Visa / Mastercard українських банків",
          "Після успішної оплати замовлення одразу переходить у комплектацію",
        ],
      },
      {
        title: "2. Накладений платіж (оплата при отриманні)",
        items: [
          "Доступний для доставки Новою Поштою у відділення / поштомат",
          "Комісія перевізника за післяплату — орієнтовно 2% + 20 грн (за тарифами НП)",
          "Оплата готівкою або карткою у відділенні при видачі посилки",
        ],
      },
      {
        title: "3. Оплата частинами",
        subsections: [
          {
            title: "ПриватБанк",
            items: [
              "Потрібна картка ПриватБанку з доступним кредитним лімітом",
              "Кількість платежів обирається в кошику під час оформлення",
              "Рішення банку відображається одразу в процесі оплати",
            ],
          },
          {
            title: "Monobank",
            items: [
              "Доступно для клієнтів Monobank з активною «Покупкою частинами»",
              "Умови (кількість платежів / ліміт) визначає банк",
              "Підтвердження відбувається в застосунку Monobank",
            ],
          },
        ],
      },
      {
        title: "4. Оплата для юридичних осіб",
        items: [
          "Оплата на розрахунковий рахунок за рахунком-фактурою",
          "Для оформлення потрібні реквізити компанії (ЄДРПОУ, ІПН тощо)",
          "Відправлення після надходження коштів на рахунок",
        ],
      },
    ],
    returnsTitle: "Повернення та обмін",
    returnsIntro:
      "Відповідно до Закону України «Про захист прав споживачів» ви можете повернути товар належної якості протягом 14 днів з моменту отримання, якщо:",
    returnsItems: [
      "Товар не був у використанні та збережено товарний вигляд",
      "Збережено оригінальне пакування та комплектацію",
      "Є документ, що підтверджує покупку",
    ],
    returnsNote:
      "Детальні умови — у розділі «Повернення товару». З питань оплати та доставки пишіть на support-адресу з футера сайту.",
  },
  en: {
    backAria: "Back",
    deliveryTitle: "Delivery",
    deliveryIntro: [
      "We ship orders from warehouses in Ukraine. After you place an order, packing usually takes 1–2 business days (during sales periods — up to 3 business days).",
      "Cost and timelines depend on the carrier you choose, the parcel weight, and the recipient’s location. You see the exact delivery fee at checkout.",
    ],
    carriers: [
      {
        name: "Nova Poshta",
        accent: "#ED1C24",
        blocks: [
          {
            subtitle: "Branch",
            items: [
              "Cost — from 70 UAH (depends on size and the carrier’s rates)",
              "Free delivery on orders from 2000 UAH",
              "Delivery time — usually 1–2 days",
              "Storage at the branch — up to 5 days (then charged per Nova Poshta rates)",
            ],
          },
          {
            subtitle: "Parcel lockers",
            items: [
              "Cost — from 50 UAH",
              "Free delivery on orders from 2000 UAH",
              "Delivery time — usually 1–2 days",
              "Convenient pickup around the clock within the locker schedule",
            ],
          },
        ],
      },
      {
        name: "Ukrposhta",
        accent: "#FFCC00",
        blocks: [
          {
            subtitle: "Express",
            items: [
              "Cost — from 40 UAH",
              "Delivery time — usually 1–2 days",
              "Delivery to Ukrposhta branches across Ukraine",
            ],
          },
          {
            subtitle: "Standard",
            items: [
              "Cost — from 35 UAH",
              "Delivery time — usually 3–6 days",
              "An economical option for smaller shipments",
            ],
          },
        ],
      },
      {
        name: "Meest",
        accent: "#0057A8",
        blocks: [
          {
            items: [
              "Delivery to a branch — from 35 UAH",
              "Delivery time — usually 3–5 days",
              "Track your parcel by tracking number in your Meest account",
            ],
          },
        ],
      },
      {
        name: "Nova Post (international)",
        accent: "#ED1C24",
        blocks: [
          {
            paragraphs: [
              "International delivery (Poland, Germany, Czechia, Italy, Spain, France, and other countries where Nova Post operates):",
            ],
            items: [
              "Cost — from 250 UAH (depends on weight, country, and rates)",
              "Timelines — usually 3–10 business days",
              "Requires the recipient’s passport / customs details",
              "Detailed quote — available at checkout",
            ],
          },
        ],
      },
    ],
    deliveryNote:
      "After dispatch you will receive a tracking number by email / in your orders cabinet. Delays may occur due to carrier force majeure or customs clearance (for international shipments).",
    paymentTitle: "Payment",
    paymentMethods: [
      {
        title: "1. Card payment on the website",
        items: [
          "Online payment by bank card via a secure payment gateway",
          "Visa / Mastercard cards from Ukrainian banks are supported",
          "After successful payment the order moves straight to packing",
        ],
      },
      {
        title: "2. Cash on delivery (pay on receipt)",
        items: [
          "Available for Nova Poshta delivery to a branch / parcel locker",
          "Carrier COD fee — about 2% + 20 UAH (per Nova Poshta rates)",
          "Pay in cash or by card at the branch when collecting the parcel",
        ],
      },
      {
        title: "3. Installments",
        subsections: [
          {
            title: "PrivatBank",
            items: [
              "Requires a PrivatBank card with an available credit limit",
              "The number of payments is chosen in the cart at checkout",
              "The bank’s decision is shown immediately during payment",
            ],
          },
          {
            title: "Monobank",
            items: [
              "Available to Monobank customers with active «Purchase in installments»",
              "Terms (number of payments / limit) are set by the bank",
              "Confirmation takes place in the Monobank app",
            ],
          },
        ],
      },
      {
        title: "4. Payment for legal entities",
        items: [
          "Payment to a bank account against an invoice",
          "Company details are required (EDRPOU, TIN, etc.)",
          "Shipment after funds are credited to the account",
        ],
      },
    ],
    returnsTitle: "Returns and exchanges",
    returnsIntro:
      "Under Ukraine’s Law «On Consumer Rights Protection» you may return goods of proper quality within 14 days of receipt if:",
    returnsItems: [
      "The item has not been used and its retail condition is preserved",
      "Original packaging and completeness are preserved",
      "You have a document confirming the purchase",
    ],
    returnsNote:
      "Full terms are in the «Product returns» section. For payment and delivery questions, write to the support address in the site footer.",
  },
};
