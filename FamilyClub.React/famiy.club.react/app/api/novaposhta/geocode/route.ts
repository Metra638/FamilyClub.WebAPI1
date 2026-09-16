export const dynamic = "force-dynamic";

export interface GeocodeResult {
  settlement?: string;
  candidates: string[];
  oblast?: string;
}

const cache = new Map<string, { data: GeocodeResult; expiry: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24;

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
  const rawLat = (searchParams.get("lat") || "").trim().replace(",", ".");
  const rawLon = (searchParams.get("lon") || "").trim().replace(",", ".");

  if (!rawLat || !rawLon || isNaN(Number(rawLat)) || isNaN(Number(rawLon))) {
    return Response.json({ error: "lat and lon are required and must be numbers" }, { status: 400 });
  }

  const cacheKey = `${Number(rawLat).toFixed(3)}_${Number(rawLon).toFixed(3)}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    return Response.json(cached.data);
  }

  const clean = (s: string) =>
    s
      .replace(/\s*(селищна|міська|сільська)\s*громада\s*$/i, "")
      .replace(/\s*(район)\s*$/i, "")
      .trim();

  let candidates: string[] = [];
  let oblast: string | undefined = undefined;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
        rawLat
      )}&lon=${encodeURIComponent(rawLon)}&accept-language=uk&zoom=14`,
      {
        headers: {
          "User-Agent": "FamilyClub-Store/1.0 (https://familyclub.ua; admin@familyclub.ua)",
          Accept: "application/json",
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (res.ok) {
      const json = await res.json();
      const addr = json?.address || {};

      if (addr.village) candidates.push(addr.village);
      if (addr.town) candidates.push(addr.town);
      if (addr.city) candidates.push(addr.city);
      if (addr.hamlet) candidates.push(addr.hamlet);
      if (addr.suburb) candidates.push(addr.suburb);
      if (addr.municipality) candidates.push(clean(addr.municipality));
      if (addr.county) candidates.push(clean(addr.county));
      if (addr.state_district) candidates.push(clean(addr.state_district));

      oblast = addr.state || undefined;
    }
  } catch (error) {
    console.warn("Nominatim geocode failed, attempting fallback", error);
  }

  if (candidates.length === 0) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4500);

      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(
          rawLat
        )}&longitude=${encodeURIComponent(rawLon)}&localityLanguage=uk`,
        { signal: controller.signal }
      );
      clearTimeout(timeout);

      if (res.ok) {
        const json = await res.json();
        if (json.locality) candidates.push(clean(json.locality));
        if (json.city) candidates.push(clean(json.city));

        if (Array.isArray(json.localityInfo?.informative)) {
          for (const item of json.localityInfo.informative) {
            if (item.name && !item.name.includes("Europe") && !item.name.includes("Україна")) {
              candidates.push(clean(item.name));
            }
          }
        }
        if (Array.isArray(json.localityInfo?.administrative)) {
          for (const item of json.localityInfo.administrative) {
            if (item.name && item.adminLevel >= 6) {
              candidates.push(clean(item.name));
            }
          }
        }

        if (!oblast) {
          oblast = json.principalSubdivision || undefined;
        }
      }
    } catch (fallbackError) {
      console.warn("BigDataCloud fallback failed", fallbackError);
    }
  }

  const uniqueCandidates = Array.from(new Set(candidates.map((c) => c.trim()).filter(Boolean)));

  if (uniqueCandidates.length === 0) {
    return Response.json({ error: "Geocoding failed to identify location" }, { status: 500 });
  }

  const result: GeocodeResult = {
    settlement: uniqueCandidates[0],
    candidates: uniqueCandidates,
    oblast,
  };

  cache.set(cacheKey, { data: result, expiry: Date.now() + CACHE_TTL_MS });

  return Response.json(result);
}