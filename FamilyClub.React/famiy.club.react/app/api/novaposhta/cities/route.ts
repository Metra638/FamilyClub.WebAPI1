export const dynamic = "force-dynamic";

export interface NovaPoshtaCity {
  name: string;
  ref: string;
  short: string;
}

const TOP_CITIES: NovaPoshtaCity[] = [
  { name: "м. Київ, Київська обл.", ref: "8d5a980d-391c-11dd-90d9-001a92567626", short: "Київ" },
  { name: "м. Львів, Львівська обл.", ref: "db5c88f5-391c-11dd-90d9-001a92567626", short: "Львів" },
  { name: "м. Одеса, Одеська обл.", ref: "db5c88d0-391c-11dd-90d9-001a92567626", short: "Одеса" },
  { name: "м. Дніпро, Дніпропетровська обл.", ref: "db5c88f0-391c-11dd-90d9-001a92567626", short: "Дніпро" },
  { name: "м. Харків, Харківська обл.", ref: "db5c88e0-391c-11dd-90d9-001a92567626", short: "Харків" },
  { name: "м. Запоріжжя, Запорізька обл.", ref: "db5c88c6-391c-11dd-90d9-001a92567626", short: "Запоріжжя" },
  { name: "м. Вінниця, Вінницька обл.", ref: "db5c88de-391c-11dd-90d9-001a92567626", short: "Вінниця" },
  { name: "м. Івано-Франківськ, Івано-Франківська обл.", ref: "db5c8904-391c-11dd-90d9-001a92567626", short: "Івано-Франківськ" },
  { name: "м. Тернопіль, Тернопільська обл.", ref: "db5c8900-391c-11dd-90d9-001a92567626", short: "Тернопіль" },
  { name: "м. Полтава, Полтавська обл.", ref: "db5c8892-391c-11dd-90d9-001a92567626", short: "Полтава" },
  { name: "м. Черкаси, Черкаська обл.", ref: "db5c8902-391c-11dd-90d9-001a92567626", short: "Черкаси" },
  { name: "м. Чернівці, Чернівецька обл.", ref: "e221d642-391c-11dd-90d9-001a92567626", short: "Чернівці" },
  { name: "м. Хмельницький, Хмельницька обл.", ref: "db5c88ac-391c-11dd-90d9-001a92567626", short: "Хмельницький" },
  { name: "м. Житомир, Житомирська обл.", ref: "db5c88c4-391c-11dd-90d9-001a92567626", short: "Житомир" },
  { name: "м. Рівне, Рівненська обл.", ref: "db5c896a-391c-11dd-90d9-001a92567626", short: "Рівне" },
  { name: "м. Луцьк, Волинська обл.", ref: "db5c893b-391c-11dd-90d9-001a92567626", short: "Луцьк" },
  { name: "м. Ужгород, Закарпатська обл.", ref: "e221d627-391c-11dd-90d9-001a92567626", short: "Ужгород" },
  { name: "м. Миколаїв, Миколаївська обл.", ref: "db5c888c-391c-11dd-90d9-001a92567626", short: "Миколаїв" },
  { name: "м. Чернігів, Чернігівська обл.", ref: "db5c897c-391c-11dd-90d9-001a92567626", short: "Чернігів" },
  { name: "м. Кропивницький, Кіровоградська обл.", ref: "db5c891b-391c-11dd-90d9-001a92567626", short: "Кропивницький" },
];

const cache = new Map<string, { data: NovaPoshtaCity[]; expiry: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

import { getClientIp, novaPoshtaRateLimiter } from "@/lib/api/rateLimiter";

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

  // If query is short, return top cities (filtered if 1 char)
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
      throw new Error(`Nova Poshta responded with HTTP ${npRes.status}`);
    }

    const json = await npRes.json();
    const addresses: any[] = json?.data?.[0]?.Addresses || [];

    const cities: NovaPoshtaCity[] = addresses
      .filter((a) => a.Present && a.DeliveryCity)
      .map((a) => ({
        name: a.Present,
        ref: a.DeliveryCity,
        short: a.MainDescription || a.Present.split(",")[0].replace(/^м\.\s*/, ""),
      }));

    cache.set(queryKey, { data: cities, expiry: Date.now() + CACHE_TTL_MS });

    return Response.json(cities);
  } catch (error) {
    console.warn("Error fetching cities from Nova Poshta, using fallback", error);
    // Fallback: search within TOP_CITIES
    const fallback = TOP_CITIES.filter((c) =>
      c.name.toLowerCase().includes(rawQuery.toLowerCase())
    );
    return Response.json(fallback.length > 0 ? fallback : TOP_CITIES);
  }
}

