export const dynamic = "force-dynamic";

export interface UkrposhtaWarehouse {
  ref: string;
  postcode: string;
  description: string;
  number: string;
  shortAddress: string;
  latitude?: number;
  longitude?: number;
}

import { getClientIp, novaPoshtaRateLimiter } from "@/lib/api/rateLimiter";
import { UKRAINE_POSTAL_REGIONS } from "@/lib/api/ukrposhtaRegions";

const cache = new Map<string, { data: UkrposhtaWarehouse[]; expiry: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24;

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
  const rawCity = (searchParams.get("city") || "").trim();
  const search = (searchParams.get("search") || "").trim();
  const latStr = searchParams.get("lat")?.replace(",", ".");
  const lonStr = searchParams.get("lon")?.replace(",", ".");

  const searchDigits = search.replace(/\D/g, "");
  const cityDigits = rawCity.replace(/\D/g, "");
  const cleanDigits = searchDigits.length === 5 ? searchDigits : (cityDigits.length === 5 ? cityDigits : (searchDigits.length >= 3 ? searchDigits : ""));
  const isPostalCode = cleanDigits.length === 5;

  if (!rawCity && !search && !isPostalCode && (!latStr || !lonStr)) {
    return Response.json([]);
  }

  const cleanCity = rawCity
    .split(",")[0]
    .replace(/^м\.\s*/i, "")
    .replace(/^смт\s*/i, "")
    .replace(/^с\.\s*/i, "")
    .replace(/^селище\s*/i, "")
    .replace(/^село\s*/i, "")
    .replace(/^індекс\s*\d+\s*,?\s*/i, "")
    .trim();

  const cacheKey = `${cleanCity.toLowerCase()}_${cleanDigits || search.toLowerCase()}_${latStr || ""}_${lonStr || ""}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    return Response.json(cached.data);
  }

  const warehouses: UkrposhtaWarehouse[] = [];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5500);

    if (isPostalCode) {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(
            cleanDigits
          )}&countrycodes=ua&format=jsonv2&accept-language=uk&limit=5`,
          {
            headers: {
              "User-Agent": "FamilyClub-Store/1.0 (https://familyclub.ua; admin@familyclub.ua)",
              Accept: "application/json",
            },
            signal: controller.signal,
          }
        );

        if (res.ok) {
          const json = await res.json();
          for (const item of json) {
            const lat = parseFloat(item.lat);
            const lon = parseFloat(item.lon);
            const parts = item.display_name.split(",");
            const title = parts.slice(0, 3).join(",").trim();
            warehouses.push({
              ref: cleanDigits,
              postcode: cleanDigits,
              number: cleanDigits,
              description: `Відділення ${cleanDigits}: ${title}`,
              shortAddress: parts[1]?.trim() || title,
              latitude: Number.isFinite(lat) ? lat : undefined,
              longitude: Number.isFinite(lon) ? lon : undefined,
            });
          }
        }
      } catch (postcodeErr) {
        console.warn("Nominatim postcode search failed", postcodeErr);
      }

      if (warehouses.length === 0) {
        const prefix = cleanDigits.slice(0, 2);
        const region = UKRAINE_POSTAL_REGIONS[prefix] || "Україна";
        const cityPrefix =
          cleanCity &&
          !cleanCity.toLowerCase().includes("індекс") &&
          !cleanCity.toLowerCase().includes(region.toLowerCase())
            ? `${cleanCity}, `
            : "";
        warehouses.push({
          ref: cleanDigits,
          postcode: cleanDigits,
          number: cleanDigits,
          description: `Відділення ${cleanDigits}: ${cityPrefix}${region}`,
          shortAddress: cleanCity || region,
        });
      }
    }

    if (warehouses.length === 0 && cleanCity) {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            `Укрпошта ${cleanCity}`
          )}&countrycodes=ua&format=jsonv2&accept-language=uk&limit=30`,
          {
            headers: {
              "User-Agent": "FamilyClub-Store/1.0 (https://familyclub.ua; admin@familyclub.ua)",
              Accept: "application/json",
            },
            signal: controller.signal,
          }
        );

        if (res.ok) {
          const json = await res.json();
          for (const item of json) {
            const lat = parseFloat(item.lat);
            const lon = parseFloat(item.lon);

            const postMatch = (item.display_name || item.name || "").match(/\b\d{5}\b/);
            const postcode = postMatch ? postMatch[0] : "";

            const parts = (item.display_name || "").split(",");
            const streetPart = parts.slice(0, 3).join(",").trim();

            let title = item.name || "Укрпошта";
            if (!title.toLowerCase().includes("укрпошта") && !title.toLowerCase().includes("відділення")) {
              title = `Відділення ${title}`;
            }

            const description = postcode
              ? `${title} (${postcode}): ${streetPart}`
              : `${title}: ${streetPart}`;

            warehouses.push({
              ref: postcode || String(item.place_id || item.osm_id),
              postcode,
              number: postcode || String(item.osm_id),
              description,
              shortAddress: streetPart,
              latitude: Number.isFinite(lat) ? lat : undefined,
              longitude: Number.isFinite(lon) ? lon : undefined,
            });
          }
        }
      } catch (cityErr) {
        console.warn("Ukrposhta city search failed", cityErr);
      }

      if (warehouses.length === 0) {
        try {
          const villageRes = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
              cleanCity
            )}&countrycodes=ua&format=jsonv2&accept-language=uk&limit=1`,
            {
              headers: {
                "User-Agent": "FamilyClub-Store/1.0 (https://familyclub.ua; admin@familyclub.ua)",
                Accept: "application/json",
              },
              signal: controller.signal,
            }
          );

          if (villageRes.ok) {
            const vJson = await villageRes.json();
            if (vJson.length > 0) {
              const v = vJson[0];
              const lat = parseFloat(v.lat);
              const lon = parseFloat(v.lon);
              const postMatch = (v.display_name || "").match(/\b\d{5}\b/);
              const postcode = postMatch ? postMatch[0] : "";

              warehouses.push({
                ref: postcode || cleanCity,
                postcode,
                number: postcode || "1",
                description: postcode
                  ? `Відділення ${postcode} (${cleanCity})`
                  : `Відділення зв'язку (${cleanCity})`,
                shortAddress: cleanCity,
                latitude: Number.isFinite(lat) ? lat : undefined,
                longitude: Number.isFinite(lon) ? lon : undefined,
              });
            }
          }
        } catch (vErr) {
          console.warn("Village postcode lookup failed", vErr);
        }
      }
    }

    clearTimeout(timeout);

    cache.set(cacheKey, { data: warehouses, expiry: Date.now() + CACHE_TTL_MS });
    return Response.json(warehouses);
  } catch (error) {
    console.warn("Error fetching Ukrposhta warehouses", error);
    return Response.json([]);
  }
}
