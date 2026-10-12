export const dynamic = "force-dynamic";

export interface NovaPoshtaWarehouse {
  ref: string;
  description: string;
  number: string;
  shortAddress: string;
  latitude?: number;
  longitude?: number;
  cityName?: string;
  cityRef?: string;
}

const cache = new Map<string, { data: NovaPoshtaWarehouse[]; expiry: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

const POSTBOX_TYPE_REF = "f9316480-5f2d-425d-bc2c-ac7cd29decf0";

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

async function fetchWarehousesForCity(
  singleCityRef: string,
  type: string,
  search: string,
  controllerSignal: AbortSignal
): Promise<NovaPoshtaWarehouse[]> {
    const methodProperties: Record<string, any> = {
    CityRef: singleCityRef,
      Limit: "300",
      Page: "1",
    };

    if (search) {
      methodProperties.FindByString = search;
    }

    if (type === "postbox") {
      methodProperties.TypeOfWarehouseRef = POSTBOX_TYPE_REF;
    }

    const npRes = await fetch("https://api.novaposhta.ua/v2.0/json/", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        modelName: "AddressGeneral",
        calledMethod: "getWarehouses",
        methodProperties,
      }),
    signal: controllerSignal,
    });

    if (!npRes.ok) {
      throw new Error(`Nova Poshta getWarehouses responded with HTTP ${npRes.status}`);
    }

    const json = await npRes.json();
    let rawList: any[] = json?.data || [];

    if (type === "branch") {
      // Filter out postboxes
      rawList = rawList.filter((w) => {
        if (w.TypeOfWarehouse === POSTBOX_TYPE_REF) return false;
        const desc = (w.Description || "").toLowerCase();
        if (desc.startsWith("поштомат") || desc.includes("поштомат")) return false;
        return true;
      });
    }

  return rawList.map((w) => {
      const lat = w.Latitude ? parseFloat(w.Latitude) : undefined;
      const lon = w.Longitude ? parseFloat(w.Longitude) : undefined;
    const cName = w.CityDescription || "";
    const sAddr = w.ShortAddress || w.Description;
    const fullShort = cName && !sAddr.toLowerCase().includes(cName.toLowerCase())
      ? `${cName}, ${sAddr}`
      : sAddr;

      return {
        ref: w.Ref,
        description: w.Description,
        number: w.Number,
      shortAddress: fullShort,
        latitude: Number.isFinite(lat) ? lat : undefined,
        longitude: Number.isFinite(lon) ? lon : undefined,
      cityName: cName || undefined,
      cityRef: w.CityRef || singleCityRef,
      };
    });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawCityRef = (searchParams.get("cityRef") || "").trim();
  const type = (searchParams.get("type") || "branch").trim().toLowerCase();
  const search = (searchParams.get("search") || "").trim();
  const latStr = searchParams.get("lat")?.replace(",", ".");
  const lonStr = searchParams.get("lon")?.replace(",", ".");

  if (!rawCityRef) {
    return Response.json([]);
  }

  const cacheKey = `${rawCityRef}_${type}_${search.toLowerCase()}_${latStr || ""}_${lonStr || ""}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiry > Date.now() && Array.isArray(cached.data) && cached.data.length > 0) {
    return Response.json(cached.data);
  }

  const cityRefs = rawCityRef.split(",").map((r) => r.trim()).filter(Boolean);
  const userLat = latStr ? parseFloat(latStr) : null;
  const userLon = lonStr ? parseFloat(lonStr) : null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const warehouseBatches = await Promise.all(
      cityRefs.map(async (ref) => {
        try {
          return await fetchWarehousesForCity(ref, type, search, controller.signal);
        } catch (err) {
          console.warn(`Failed to fetch NP warehouses for cityRef: ${ref}`, err);
          return [];
        }
      })
    );
    clearTimeout(timeout);

    const seenRefs = new Set<string>();
    let warehouses: NovaPoshtaWarehouse[] = [];

    for (const batch of warehouseBatches) {
      for (const w of batch) {
        if (!seenRefs.has(w.ref)) {
          seenRefs.add(w.ref);
          warehouses.push(w);
        }
      }
    }

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

    if (warehouses.length > 0) {
      cache.set(cacheKey, { data: warehouses, expiry: Date.now() + CACHE_TTL_MS });
    }

    return Response.json(warehouses);
  } catch (error) {
    console.warn("Error fetching warehouses from Nova Poshta", error);
    return Response.json([]);
  }
}

