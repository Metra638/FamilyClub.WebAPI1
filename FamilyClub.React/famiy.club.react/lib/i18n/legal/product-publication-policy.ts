import type {
  LocalizedContent,
  ProductPublicationPolicyContent,
} from "./types";

const SUPPORT_EMAIL = "LibrellisSupport@proton.me";

export const productPublicationPolicyContent: LocalizedContent<ProductPublicationPolicyContent> =
  {
    uk: {
      backAria: "Назад",
      title: "Політика публікації товару",
      sections: [
        {
          title: "1. Джерела інформації та точність даних",
          paragraphs: [
            "Описи книг, анотації, відомості про авторів, видавництва та характеристики товарів формуються на основі даних від видавництв, правовласників і відкритих джерел. Ми прагнемо до максимальної точності, однак:",
          ],
          items: [
            "Фотографії товарів мають ілюстративний характер і можуть незначною мірою відрізнятися від фактичного вигляду (відтінок обкладинки, папір тощо)",
            "У разі виявлення помилки в описі зв’яжіться з підтримкою — ми оперативно виправимо інформацію",
          ],
        },
        {
          title: "2. Ціноутворення та наявність товарів",
          items: [
            "Усі ціни на сайті зазначені в гривнях (₴) і включають податки, якщо інше прямо не вказано",
            "Ціна може змінюватися без попереднього повідомлення; актуальною вважається ціна на момент оформлення замовлення",
            "Статуси наявності («В наявності», «Під замовлення», «Немає в наявності») оновлюються динамічно і можуть змінюватися протягом дня",
            "Передзамовлення (pre-order) означає, що товар ще не надійшов на склад; орієнтовні строки вказані в картці товару",
          ],
        },
        {
          title: "3. Авторські права та інтелектуальна власність",
          items: [
            "Тексти, зображення, логотипи та інші матеріали на Сайті захищені законодавством про інтелектуальну власність",
            "Копіювання, поширення чи комерційне використання матеріалів Сайту без письмової згоди Адміністрації заборонено",
            "Права на опублікований Контент (електронні / аудіокниги) належать відповідним Правовласникам; користувач отримує лише ліцензію на особисте використання згідно з умовами покупки",
          ],
        },
        {
          title: "4. Політика щодо відгуків користувачів",
          paragraphs: [
            "Ми вітаємо чесні відгуки про книги. Водночас забороняється публікувати матеріали, що містять:",
          ],
          items: [
            "Обсценну лексику, образи, дискримінацію чи розпалювання ворожнечі",
            "Спойлери сюжету без попередження",
            "Рекламу сторонніх товарів, послуг чи сайтів",
            "Персональні дані третіх осіб без їхньої згоди",
            "Завідомо неправдиву інформацію про товар або продавця",
          ],
          afterItems: [
            "Адміністрація залишає за собою право модерувати, редагувати або видаляти відгуки, що порушують ці правила, без попередження.",
          ],
        },
        {
          title: "5. Законодавчі обмеження та цензура",
          paragraphs: [
            "Публікація та продаж товарів на Сайті здійснюється з дотриманням законодавства України. Ми не розміщуємо контент, заборонений чинним законодавством (зокрема матеріали, що пропагують насильство, дискримінацію, або інший незаконний контент). Вікові обмеження для окремих видань зазначаються в картці товару.",
          ],
        },
        {
          title: "6. Зміни в Політиці",
          paragraphs: [
            "Адміністрація залишає за собою право оновлювати цю Політику в будь-який час. Актуальна редакція завжди доступна на цій сторінці. Продовження користування Сайтом після публікації змін означає вашу згоду з оновленими умовами.",
          ],
        },
      ],
      footerBeforeEmail:
        "Якщо у вас є запитання щодо публікації товарів або цієї Політики, напишіть нам на",
      footerAfterEmail: ".",
      email: SUPPORT_EMAIL,
    },
    en: {
      backAria: "Back",
      title: "Product publication policy",
      sections: [
        {
          title: "1. Information sources and data accuracy",
          paragraphs: [
            "Book descriptions, blurbs, author and publisher details, and product specifications are based on data from publishers, rights holders, and open sources. We strive for maximum accuracy; however:",
          ],
          items: [
            "Product photos are illustrative and may differ slightly from the actual appearance (cover shade, paper, etc.)",
            "If you find an error in a description, contact support — we will correct the information promptly",
          ],
        },
        {
          title: "2. Pricing and product availability",
          items: [
            "All prices on the site are listed in UAH (₴) and include taxes unless otherwise stated",
            "Prices may change without prior notice; the price at the moment of checkout is considered current",
            "Availability statuses («In stock», «Made to order», «Out of stock») update dynamically and may change during the day",
            "Pre-order means the item has not yet arrived at the warehouse; estimated timelines are shown on the product page",
          ],
        },
        {
          title: "3. Copyright and intellectual property",
          items: [
            "Texts, images, logos, and other materials on the Site are protected by intellectual property law",
            "Copying, distributing, or commercially using Site materials without written consent from the Administration is prohibited",
            "Rights to published Content (e-books / audiobooks) belong to the respective Rights Holders; the user receives only a license for personal use under the purchase terms",
          ],
        },
        {
          title: "4. User review policy",
          paragraphs: [
            "We welcome honest reviews of books. At the same time, it is prohibited to post materials that contain:",
          ],
          items: [
            "Obscene language, insults, discrimination, or incitement to hatred",
            "Plot spoilers without a warning",
            "Advertising of third-party goods, services, or websites",
            "Personal data of third parties without their consent",
            "Knowingly false information about a product or seller",
          ],
          afterItems: [
            "The Administration reserves the right to moderate, edit, or remove reviews that violate these rules without prior notice.",
          ],
        },
        {
          title: "5. Legal restrictions and censorship",
          paragraphs: [
            "Publication and sale of goods on the Site comply with the laws of Ukraine. We do not host content prohibited by applicable law (including materials that promote violence, discrimination, or other illegal content). Age restrictions for certain editions are stated on the product page.",
          ],
        },
        {
          title: "6. Changes to the Policy",
          paragraphs: [
            "The Administration reserves the right to update this Policy at any time. The current version is always available on this page. Continued use of the Site after changes are published means you agree to the updated terms.",
          ],
        },
      ],
      footerBeforeEmail:
        "If you have questions about product publication or this Policy, write to us at",
      footerAfterEmail: ".",
      email: SUPPORT_EMAIL,
    },
  };
