export const dynamic = "force-dynamic";

export interface NovaPoshtaWarehouse {
  ref: string;
  description: string;
  number: string;
  shortAddress: string;
}

const cache = new Map<string, { data: NovaPoshtaWarehouse[]; expiry: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

const POSTBOX_TYPE_REF = "f9316480-5f2d-425d-bc2c-ac7cd29decf0";

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
  const cityRef = (searchParams.get("cityRef") || "").trim();
  const type = (searchParams.get("type") || "branch").trim().toLowerCase();
  const search = (searchParams.get("search") || "").trim();

  if (!cityRef) {
    return Response.json([]);
  }

  const cacheKey = `${cityRef}_${type}_${search.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    return Response.json(cached.data);
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const methodProperties: Record<string, any> = {
      CityRef: cityRef,
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
      signal: controller.signal,
    });
    clearTimeout(timeout);

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

    const warehouses: NovaPoshtaWarehouse[] = rawList.map((w) => ({
      ref: w.Ref,
      description: w.Description,
      number: w.Number,
      shortAddress: w.ShortAddress || w.Description,
    }));

    cache.set(cacheKey, { data: warehouses, expiry: Date.now() + CACHE_TTL_MS });

    return Response.json(warehouses);
  } catch (error) {
    console.warn("Error fetching warehouses from Nova Poshta", error);
    return Response.json([]);
  }
}

