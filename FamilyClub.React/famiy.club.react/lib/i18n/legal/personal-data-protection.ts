import type { LocalizedContent, PersonalDataContent } from "./types";

const SUPPORT_EMAIL = "LibrellisSupport@proton.me";
const SUPPORT_PHONE_HREF = "08005553535";
const SUPPORT_PHONE_DISPLAY = "0 (800) 555 35 35";

export const personalDataProtectionContent: LocalizedContent<PersonalDataContent> = {
  uk: {
    backAria: "Назад",
    title: "Захист персональних даних",
    whoWeAre: {
      title: "1. Хто ми?",
      companyBold: "ТОВ «Librellis»",
      companyRest: " (ЄДРПОУ 12345678)",
      legalAddress: "Юридична адреса: 01001, Львів 79000, а/с 64",
      physicalAddress: "Фактична адреса: м. Львів, вул. Книжкова, 10",
      contactLabel: "Контакт:",
      email: SUPPORT_EMAIL,
      phoneHref: SUPPORT_PHONE_HREF,
      phoneDisplay: SUPPORT_PHONE_DISPLAY,
      supportLabel: "(служба підтримки)",
    },
    sections: [
      {
        title: "2. Які дані ми збираємо?",
        subsections: [
          {
            heading: "При замовленні:",
            items: [
              "ПІБ, номер телефону, e-mail",
              "Адреса доставки (відділення / поштомат / кур’єр)",
            ],
          },
          {
            heading: "Особистий кабінет:",
            items: [
              "Логін, пароль (зберігається у зашифрованому вигляді)",
              "Історія покупок, wishlist / обране",
            ],
          },
          {
            heading: "Автоматично:",
            items: ["IP-адреса, файли cookies", "Дані пристрою та браузера"],
          },
        ],
      },
      {
        title: "3. Мета збору даних",
        items: [
          "Виконання та доставка замовлень",
          "Комунікація про статус замовлення та ТТН",
          "Маркетинг (за вашою згодою): розсилки про новинки та акції",
          "Покращення сервісу та аналіз популярності жанрів",
        ],
      },
      {
        title: "4. Передача даних третім особам",
        items: [
          "Служби доставки (Нова Пошта, Укрпошта тощо) — лише ПІБ, телефон та адреса доставки",
          "Платіжні системи (WayForPay, LiqPay) — для проведення оплати",
          "Сервіси автоматизації (CRM, email-розсилки) — для обслуговування клієнтів",
        ],
        note: "Ми не продаємо персональні дані третім особам і передаємо їх лише в обсязі, необхідному для виконання договору чи вимог закону.",
      },
      {
        title: "5. Термін зберігання даних",
        items: [
          "Протягом існування вашого профілю на платформі",
          "До 3 років після останньої операції — для бухгалтерської та податкової звітності (згідно із законодавством України)",
        ],
      },
      {
        title: "6. Ваші права",
        items: [
          "Право доступу до ваших даних та їх перевірки",
          "Право вимагати виправлення помилок",
          "Право на «забуття»: видалення профілю та пов’язаних даних (окрім випадків, коли зберігання вимагає закон)",
        ],
        noteBeforeEmail: "Щоб скористатися правами, напишіть на",
        noteAfterEmail: "або зверніться до служби підтримки.",
      },
    ],
  },
  en: {
    backAria: "Back",
    title: "Personal data protection",
    whoWeAre: {
      title: "1. Who we are?",
      companyBold: "LLC «Librellis»",
      companyRest: " (EDRPOU 12345678)",
      legalAddress: "Legal address: 01001, Lviv 79000, P.O. Box 64",
      physicalAddress: "Actual address: Lviv, Knyzhkova St., 10",
      contactLabel: "Contact:",
      email: SUPPORT_EMAIL,
      phoneHref: SUPPORT_PHONE_HREF,
      phoneDisplay: SUPPORT_PHONE_DISPLAY,
      supportLabel: "(customer support)",
    },
    sections: [
      {
        title: "2. What data do we collect?",
        subsections: [
          {
            heading: "When ordering:",
            items: [
              "Full name, phone number, e-mail",
              "Delivery address (branch / parcel locker / courier)",
            ],
          },
          {
            heading: "Personal account:",
            items: [
              "Login, password (stored in encrypted form)",
              "Purchase history, wishlist / favorites",
            ],
          },
          {
            heading: "Automatically:",
            items: ["IP address, cookie files", "Device and browser data"],
          },
        ],
      },
      {
        title: "3. Purpose of data collection",
        items: [
          "Fulfilling and delivering orders",
          "Communicating order status and tracking numbers",
          "Marketing (with your consent): newsletters about new releases and promotions",
          "Improving the service and analyzing genre popularity",
        ],
      },
      {
        title: "4. Sharing data with third parties",
        items: [
          "Delivery services (Nova Poshta, Ukrposhta, etc.) — only full name, phone, and delivery address",
          "Payment systems (WayForPay, LiqPay) — to process payment",
          "Automation services (CRM, email newsletters) — for customer service",
        ],
        note: "We do not sell personal data to third parties and share it only to the extent needed to perform the contract or meet legal requirements.",
      },
      {
        title: "5. Data retention period",
        items: [
          "For as long as your profile exists on the platform",
          "Up to 3 years after the last transaction — for accounting and tax reporting (under Ukrainian law)",
        ],
      },
      {
        title: "6. Your rights",
        items: [
          "The right to access and review your data",
          "The right to request correction of errors",
          "The right to be «forgotten»: deletion of your profile and related data (except where the law requires retention)",
        ],
        noteBeforeEmail: "To exercise your rights, write to",
        noteAfterEmail: "or contact customer support.",
      },
    ],
  },
};
