export const dynamic = "force-dynamic";

export interface MeestWarehouse {
  ref: string;
  number: string;
  description: string;
  shortAddress: string;
  type?: "branch" | "postbox" | "mini";
  latitude?: number;
  longitude?: number;
}

import { getClientIp, novaPoshtaRateLimiter } from "@/lib/api/rateLimiter";

const cache = new Map<string, { data: MeestWarehouse[]; expiry: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24;

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

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

  if (!rawCity && !search && (!latStr || !lonStr)) {
    return Response.json([]);
  }

  const cityList = rawCity
    .split(",")
    .map((c) =>
      c
        .replace(/^м\.\s*/i, "")
        .replace(/^смт\s*/i, "")
        .replace(/^с\.\s*/i, "")
        .replace(/^селище\s*/i, "")
        .replace(/^село\s*/i, "")
        .trim()
    )
    .filter(Boolean);

  const cleanCity = cityList[0] || "";

  const cacheKey = `${cityList.join("_").toLowerCase()}_${search.toLowerCase()}_${latStr || ""}_${lonStr || ""}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    return Response.json(cached.data);
  }

  const warehouses: MeestWarehouse[] = [];
  const userLat = latStr ? parseFloat(latStr) : null;
  const userLon = lonStr ? parseFloat(lonStr) : null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5500);

    const parseOsmItem = (item: any, currentCity: string = "") => {
      const name = (item.name || "").toLowerCase();
      const displayName = (item.display_name || "").toLowerCase();

      if (!name.includes("meest") && !displayName.includes("meest") && !name.includes("міст") && !displayName.includes("міст")) {
        return null;
      }

      const lat = parseFloat(item.lat);
      const lon = parseFloat(item.lon);
      const parts = (item.display_name || "").split(",");
      const streetPart = parts.slice(0, 3).join(",").trim();

      const numMatch = (item.display_name || item.name || "").match(/№\s*(\d+)/i) ||
                       (item.display_name || item.name || "").match(/\b(\d+)\b/);
      const branchNumber = numMatch ? numMatch[1] : String(warehouses.length + 1);

      let type: "branch" | "postbox" | "mini" = "branch";
      const lowerName = (item.name || "").toLowerCase();
      if (lowerName.includes("поштомат") || lowerName.includes("locker")) {
        type = "postbox";
      } else if (lowerName.includes("міні") || lowerName.includes("пункт")) {
        type = "mini";
      }

      const prefix = type === "postbox" ? "Поштомат Meest" : type === "mini" ? "Міні-відділення Meest" : "Відділення Meest";
      const description = `${prefix} №${branchNumber}: ${streetPart}`;

      return {
        ref: String(item.place_id || item.osm_id || `${branchNumber}_${currentCity}`),
        number: branchNumber,
        description,
        shortAddress: streetPart,
        type,
        latitude: Number.isFinite(lat) ? lat : undefined,
        longitude: Number.isFinite(lon) ? lon : undefined,
      } as MeestWarehouse;
    };

    for (const cCity of cityList) {
      try {
        const queryTerm = search ? `Meest ${cCity} ${search}` : `Meest ${cCity}`;
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            queryTerm
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
            const parsed = parseOsmItem(item, cCity);
            if (parsed && !warehouses.some((w) => w.ref === parsed.ref)) {
              warehouses.push(parsed);
            }
          }
        }
      } catch (osmErr) {
        console.warn(`Meest OSM search failed for ${cCity}`, osmErr);
      }
    }

    if (warehouses.length === 0 && userLat != null && userLon != null) {
      try {
        const box = `${(userLon - 0.25).toFixed(4)},${(userLat + 0.25).toFixed(4)},${(userLon + 0.25).toFixed(4)},${(userLat - 0.25).toFixed(4)}`;
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=Meest&viewbox=${box}&bounded=1&countrycodes=ua&format=jsonv2&accept-language=uk&limit=25`,
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
            const parsed = parseOsmItem(item, cleanCity || "city");
            if (parsed && !warehouses.some((w) => w.ref === parsed.ref)) {
              warehouses.push(parsed);
            }
          }
        }
      } catch (radiusErr) {
        console.warn("Meest radius search failed", radiusErr);
      }
    }

    clearTimeout(timeout);

    if (userLat != null && userLon != null) {
      warehouses.sort((a, b) => {
        if (a.latitude != null && a.longitude != null && b.latitude != null && b.longitude != null) {
          const distA = getDistanceKm(userLat, userLon, a.latitude, a.longitude);
          const distB = getDistanceKm(userLat, userLon, b.latitude, b.longitude);
          return distA - distB;
        }
        if (a.latitude != null && a.longitude != null) return -1;
        if (b.latitude != null && b.longitude != null) return 1;
        return 0;
      });
    }

    cache.set(cacheKey, { data: warehouses, expiry: Date.now() + CACHE_TTL_MS });
    return Response.json(warehouses);
  } catch (error) {
    console.warn("Error fetching Meest warehouses", error);
    return Response.json([]);
  }
}
