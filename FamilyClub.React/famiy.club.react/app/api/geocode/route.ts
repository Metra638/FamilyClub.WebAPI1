export const dynamic = "force-dynamic";

export interface NearbySettlement {
  name: string;
  dist?: number;
  lat?: number;
  lon?: number;
}

export interface GeocodeResult {
  settlement?: string;
  candidates: string[];
  nearbySettlements: NearbySettlement[];
  oblast?: string;
}

const cache = new Map<string, { data: GeocodeResult; expiry: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24;

import { getClientIp, novaPoshtaRateLimiter } from "@/lib/api/rateLimiter";

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
  const rawLat = (searchParams.get("lat") || "").trim().replace(",", ".");
  const rawLon = (searchParams.get("lon") || "").trim().replace(",", ".");

  if (!rawLat || !rawLon || isNaN(Number(rawLat)) || isNaN(Number(rawLon))) {
    return Response.json({ error: "lat and lon are required and must be numbers" }, { status: 400 });
  }

  const numLat = Number(rawLat);
  const numLon = Number(rawLon);

  const cacheKey = `${numLat.toFixed(3)}_${numLon.toFixed(3)}`;
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
  let nearbySettlements: NearbySettlement[] = [];
  let oblast: string | undefined = undefined;
  let parsedAddr: any = null;

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
      parsedAddr = json?.address || {};

      if (parsedAddr.village) candidates.push(parsedAddr.village);
      if (parsedAddr.town) candidates.push(parsedAddr.town);
      if (parsedAddr.city) candidates.push(parsedAddr.city);
      if (parsedAddr.hamlet) candidates.push(parsedAddr.hamlet);
      if (parsedAddr.suburb) candidates.push(parsedAddr.suburb);
      if (parsedAddr.municipality) candidates.push(clean(parsedAddr.municipality));
      if (parsedAddr.county) candidates.push(clean(parsedAddr.county));
      if (parsedAddr.state_district) candidates.push(clean(parsedAddr.state_district));

      oblast = parsedAddr.state || undefined;
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

  // Find nearby settlements within ~10km (to show nearest branches in neighboring villages/towns)
  try {
    const opController = new AbortController();
    const opTimeout = setTimeout(() => opController.abort(), 3500);
    const q = `[out:json][timeout:3];node(around:10000,${numLat},${numLon})["place"~"^(village|town|suburb|city)$"];out body;`;
    const opRes = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        "User-Agent": "FamilyClub-Store/1.0 (https://familyclub.ua; admin@familyclub.ua)",
      },
      body: `data=${encodeURIComponent(q)}`,
      signal: opController.signal,
    });
    clearTimeout(opTimeout);

    if (opRes.ok) {
      const opData = await opRes.json();
      if (Array.isArray(opData?.elements)) {
        const places = opData.elements
          .filter((el: any) => el.tags && (el.tags["name:uk"] || el.tags.name))
          .map((el: any) => {
            const name = (el.tags["name:uk"] || el.tags.name).trim();
            const dist = getDistanceKm(numLat, numLon, el.lat, el.lon);
            return { name, dist, lat: el.lat, lon: el.lon };
          })
          .sort((a: any, b: any) => a.dist - b.dist);

        for (const p of places) {
          if (!nearbySettlements.some((s) => s.name.toLowerCase() === p.name.toLowerCase())) {
            nearbySettlements.push(p);
          }
        }
      }
    }
  } catch (overpassErr) {
    console.warn("Overpass nearby settlements failed", overpassErr);
  }

  // Fallback 1: Nominatim bounding box search for settlements
  if (nearbySettlements.length < 2) {
    try {
      const minLon = (numLon - 0.12).toFixed(4);
      const maxLat = (numLat + 0.12).toFixed(4);
      const maxLon = (numLon + 0.12).toFixed(4);
      const minLat = (numLat - 0.12).toFixed(4);

      const nomBoxRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=селище+село&viewbox=${minLon},${maxLat},${maxLon},${minLat}&bounded=1&countrycodes=ua&format=jsonv2&accept-language=uk&limit=10`,
        {
          headers: {
            "User-Agent": "FamilyClub-Store/1.0 (https://familyclub.ua; admin@familyclub.ua)",
            Accept: "application/json",
          },
        }
      );
      if (nomBoxRes.ok) {
        const nomBoxData = await nomBoxRes.json();
        for (const item of nomBoxData) {
          const cleanName = (item.name || "").replace(/^(смт|с\.|селище|село)\s*/i, "").trim();
          if (cleanName && cleanName.length > 2) {
            const dist = getDistanceKm(numLat, numLon, parseFloat(item.lat), parseFloat(item.lon));
            if (!nearbySettlements.some((s) => s.name.toLowerCase() === cleanName.toLowerCase())) {
              nearbySettlements.push({ name: cleanName, dist, lat: parseFloat(item.lat), lon: parseFloat(item.lon) });
            }
          }
        }
        nearbySettlements.sort((a, b) => (a.dist ?? 0) - (b.dist ?? 0));
      }
    } catch (nomBoxErr) {
      console.warn("Nominatim viewbox settlement search failed", nomBoxErr);
    }
  }

  // Fallback 2: Municipality search (e.g. hromada covers neighboring settlements)
  if (nearbySettlements.length < 2 && parsedAddr?.municipality && parsedAddr.municipality.includes("громада")) {
    try {
      const mRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(parsedAddr.municipality)}&countrycodes=ua&format=jsonv2&accept-language=uk&limit=10`,
        {
          headers: {
            "User-Agent": "FamilyClub-Store/1.0 (https://familyclub.ua; admin@familyclub.ua)",
            Accept: "application/json",
          },
        }
      );
      if (mRes.ok) {
        const mData = await mRes.json();
        for (const item of mData) {
          const cleanName = (item.name || "").replace(/^(смт|с\.|селище|село)\s*/i, "").trim();
          if (cleanName && !cleanName.includes("громада") && cleanName.length > 2) {
            const dist = getDistanceKm(numLat, numLon, parseFloat(item.lat), parseFloat(item.lon));
            if (!nearbySettlements.some((s) => s.name.toLowerCase() === cleanName.toLowerCase())) {
              nearbySettlements.push({ name: cleanName, dist, lat: parseFloat(item.lat), lon: parseFloat(item.lon) });
            }
          }
        }
        nearbySettlements.sort((a, b) => (a.dist ?? 0) - (b.dist ?? 0));
      }
    } catch (mErr) {
      console.warn("Municipality members search failed", mErr);
    }
  }

  for (const s of nearbySettlements) {
    if (!candidates.includes(s.name)) {
      candidates.push(s.name);
    }
  }

  const uniqueCandidates = Array.from(new Set(candidates.map((c) => c.trim()).filter(Boolean)));

  if (uniqueCandidates.length === 0) {
    return Response.json({ error: "Geocoding failed to identify location" }, { status: 500 });
  }

  const result: GeocodeResult = {
    settlement: uniqueCandidates[0],
    candidates: uniqueCandidates,
    nearbySettlements,
    oblast,
  };

  cache.set(cacheKey, { data: result, expiry: Date.now() + CACHE_TTL_MS });

  return Response.json(result);
}

