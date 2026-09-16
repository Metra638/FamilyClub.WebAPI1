export const dynamic = "force-dynamic";

export interface UkrposhtaCity {
  name: string;
  short: string;
  ref: string;
}

const TOP_CITIES: UkrposhtaCity[] = [
  { name: "м. Київ, Київська обл.", ref: "01001", short: "Київ" },
  { name: "м. Львів, Львівська обл.", ref: "79000", short: "Львів" },
  { name: "м. Одеса, Одеська обл.", ref: "65001", short: "Одеса" },
  { name: "м. Дніпро, Дніпропетровська обл.", ref: "49000", short: "Дніпро" },
  { name: "м. Харків, Харківська обл.", ref: "61052", short: "Харків" },
  { name: "м. Запоріжжя, Запорізька обл.", ref: "69005", short: "Запоріжжя" },
  { name: "м. Вінниця, Вінницька обл.", ref: "21050", short: "Вінниця" },
  { name: "м. Івано-Франківськ, Івано-Франківська обл.", ref: "76018", short: "Івано-Франківськ" },
  { name: "м. Тернопіль, Тернопільська обл.", ref: "46001", short: "Тернопіль" },
  { name: "м. Полтава, Полтавська обл.", ref: "36000", short: "Полтава" },
  { name: "м. Черкаси, Черкаська обл.", ref: "18001", short: "Черкаси" },
  { name: "м. Чернівці, Чернівецька обл.", ref: "58000", short: "Чернівці" },
  { name: "м. Хмельницький, Хмельницька обл.", ref: "29000", short: "Хмельницький" },
  { name: "м. Житомир, Житомирська обл.", ref: "10001", short: "Житомир" },
  { name: "м. Рівне, Рівненська обл.", ref: "33001", short: "Рівне" },
  { name: "м. Луцьк, Волинська обл.", ref: "43001", short: "Луцьк" },
  { name: "м. Ужгород, Закарпатська обл.", ref: "88000", short: "Ужгород" },
  { name: "м. Миколаїв, Миколаївська обл.", ref: "54001", short: "Миколаїв" },
  { name: "м. Чернігів, Чернігівська обл.", ref: "14000", short: "Чернігів" },
  { name: "м. Кропивницький, Кіровоградська обл.", ref: "25006", short: "Кропивницький" },
];

const cache = new Map<string, { data: UkrposhtaCity[]; expiry: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60;

import { getClientIp, novaPoshtaRateLimiter } from "@/lib/api/rateLimiter";
import { UKRAINE_POSTAL_REGIONS } from "@/lib/api/ukrposhtaRegions";

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = novaPoshtaRateLimiter.check(ip);
  if (!rateLimit.success) {
    return Response.json(
      { error: "Забагато запитів, спробуйте пізніше" },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const rawQuery = (searchParams.get("q") || "").trim();

  const cleanDigits = rawQuery.replace(/\D/g, "");
  if (cleanDigits.length === 5) {
    const prefix = cleanDigits.slice(0, 2);
    const region = UKRAINE_POSTAL_REGIONS[prefix] || "Україна";
    return Response.json([
      {
        name: `Індекс ${cleanDigits}, ${region}`,
        short: `Індекс ${cleanDigits}`,
        ref: cleanDigits,
      },
    ]);
  }

  if (rawQuery.length < 2) {
    if (!rawQuery) {
      return Response.json(TOP_CITIES);
    }
    const filtered = TOP_CITIES.filter(
      (c) =>
        c.short.toLowerCase().startsWith(rawQuery.toLowerCase()) ||
        c.name.toLowerCase().includes(rawQuery.toLowerCase())
    );
    return Response.json(filtered.length > 0 ? filtered : TOP_CITIES);
  }

  const queryKey = rawQuery.toLowerCase();
  const cached = cache.get(queryKey);
  if (cached && cached.expiry > Date.now()) {
    return Response.json(cached.data);
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const npRes = await fetch("https://api.novaposhta.ua/v2.0/json/", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        modelName: "Address",
        calledMethod: "searchSettlements",
        methodProperties: {
          CityName: rawQuery,
          Limit: "25",
          Page: "1",
        },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!npRes.ok) {
      throw new Error(`Settlements API responded with HTTP ${npRes.status}`);
    }

    const json = await npRes.json();
    const addresses: any[] = json?.data?.[0]?.Addresses || [];

    const cities: UkrposhtaCity[] = addresses
      .filter((a) => a.Present)
      .map((a) => ({
        name: a.Present,
        ref: a.DeliveryCity || a.Ref || a.Present,
        short: a.MainDescription || a.Present.split(",")[0].replace(/^м\.\s*/, "").replace(/^смт\s*/, "").replace(/^с\.\s*/, ""),
      }));

    cache.set(queryKey, { data: cities, expiry: Date.now() + CACHE_TTL_MS });
    return Response.json(cities);
  } catch (error) {
    console.warn("Ukrposhta cities fallback search", error);
    const fallback = TOP_CITIES.filter((c) =>
      c.name.toLowerCase().includes(rawQuery.toLowerCase())
    );
    return Response.json(fallback.length > 0 ? fallback : TOP_CITIES);
  }
}

