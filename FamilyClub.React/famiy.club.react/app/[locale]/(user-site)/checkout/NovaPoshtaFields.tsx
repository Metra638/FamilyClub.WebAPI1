"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import type { NovaPoshtaCity } from "@/app/api/novaposhta/cities/route";
import type { NovaPoshtaWarehouse } from "@/app/api/novaposhta/warehouses/route";
import styles from "./checkout.module.css";

interface NovaPoshtaFieldsProps {
  city: string;
  setCity: (val: string) => void;
  cityRef: string;
  setCityRef: (val: string) => void;
  branch: string;
  setBranch: (val: string) => void;
  branchRef?: string;
  setBranchRef?: (val: string) => void;
  deliveryType: "branch" | "postbox";
  variant?: "desktop" | "mobile";
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M7 10l5 5 5-5H7z" fill="currentColor" />
    </svg>
  );
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"
        fill="currentColor"
      />
    </svg>
  );
}

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

export default function NovaPoshtaFields({
  city,
  setCity,
  cityRef,
  setCityRef,
  branch,
  setBranch,
  branchRef,
  setBranchRef,
  deliveryType,
  variant = "desktop",
}: NovaPoshtaFieldsProps) {
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isBranchOpen, setIsBranchOpen] = useState(false);

  const [cities, setCities] = useState<NovaPoshtaCity[]>([]);
  const [warehouses, setWarehouses] = useState<NovaPoshtaWarehouse[]>([]);

  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);

  const [cityQuery, setCityQuery] = useState(city);
  const [branchQuery, setBranchQuery] = useState(branch);

  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [sortByDistance, setSortByDistance] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const cityDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const branchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const isSelectingBranchRef = useRef(false);

  useEffect(() => {
    setCityQuery(city);
  }, [city]);

  useEffect(() => {
    setBranchQuery(branch);
  }, [branch]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsCityOpen(false);
        setIsBranchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const fetchCities = (q: string) => {
    if (cityDebounceRef.current) clearTimeout(cityDebounceRef.current);

    cityDebounceRef.current = setTimeout(async () => {
      setLoadingCities(true);
      try {
        const res = await fetch(`/api/novaposhta/cities?q=${encodeURIComponent(q.trim())}`);
        if (res.ok) {
          const data: NovaPoshtaCity[] = await res.json();
          setCities(data);
        }
      } catch (err) {
        console.warn("NovaPoshta: error loading cities", err);
      } finally {
        setLoadingCities(false);
      }
    }, q.length < 2 ? 0 : 350);
  };

  const handleCityFocus = () => {
    setIsCityOpen(true);
    setIsBranchOpen(false);
    if (cities.length === 0 || !cityQuery.trim()) {
      fetchCities("");
    }
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCityQuery(val);
    setCity(val);
    setIsCityOpen(true);
    setCityRef("");
    setBranch("");
    setBranchQuery("");
    setBranchRef?.("");
    setSortByDistance(false);
    fetchCities(val);
  };

  const handleSelectCity = (selected: NovaPoshtaCity) => {
    setCity(selected.name);
    setCityQuery(selected.name);
    setCityRef(selected.ref);
    setBranch("");
    setBranchQuery("");
    setBranchRef?.("");
    setIsCityOpen(false);
    setSortByDistance(false);
    setIsBranchOpen(true);
    fetchWarehouses(selected.ref, deliveryType, "");
  };

  const fetchWarehouses = (
    ref: string,
    type: "branch" | "postbox",
    search: string,
    coords?: { lat: number; lon: number }
  ) => {
    if (!ref) return;

    if (branchDebounceRef.current) clearTimeout(branchDebounceRef.current);

    branchDebounceRef.current = setTimeout(async () => {
      setLoadingWarehouses(true);
      try {
        const c = coords || userCoords;
        let url = `/api/novaposhta/warehouses?cityRef=${encodeURIComponent(ref)}&type=${type}&search=${encodeURIComponent(search.trim())}`;
        if (c) {
          url += `&lat=${c.lat}&lon=${c.lon}`;
        }
        const res = await fetch(url);
        if (res.ok) {
          const data: NovaPoshtaWarehouse[] = await res.json();
          setWarehouses(data);
        }
      } catch (err) {
        console.warn("NovaPoshta: error loading warehouses", err);
      } finally {
        setLoadingWarehouses(false);
      }
    }, search ? 300 : 0);
  };

  useEffect(() => {
    if (isSelectingBranchRef.current) {
      isSelectingBranchRef.current = false;
      return;
    }
    if (cityRef) {
      setBranch("");
      setBranchQuery("");
      setBranchRef?.("");
      setSortByDistance(false);
      fetchWarehouses(cityRef, deliveryType, "");
    }
  }, [deliveryType, cityRef]);

  const handleBranchFocus = () => {
    setIsBranchOpen(true);
    setIsCityOpen(false);
    if (cityRef && warehouses.length === 0) {
      fetchWarehouses(cityRef, deliveryType, "");
    }
  };

  const handleBranchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBranchQuery(val);
    setBranch(val);
    setBranchRef?.("");
    setIsBranchOpen(true);
    setSortByDistance(false);

    if (cityRef) {
      const localMatches = warehouses.filter((w) =>
        w.description.toLowerCase().includes(val.toLowerCase()) ||
        w.number.toLowerCase() === val.toLowerCase()
      );

      if (localMatches.length === 0 && val.trim().length > 1) {
        fetchWarehouses(cityRef, deliveryType, val);
      }
    }
  };

  const handleSelectBranch = (selected: NovaPoshtaWarehouse) => {
    setBranch(selected.description);
    setBranchQuery(selected.description);
    setBranchRef?.(selected.ref);
    if (selected.cityName && selected.cityRef && selected.cityRef !== cityRef) {
      isSelectingBranchRef.current = true;
      setCity(selected.cityName);
      setCityQuery(selected.cityName);
      setCityRef(selected.cityRef);
    }
    setIsBranchOpen(false);
  };

  const handleFindNearest = () => {
    setGeoError(null);

    if (!navigator.geolocation) {
      setGeoError("Геолокація не підтримується цим браузером.");
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setUserCoords({ lat, lon });

        try {
          const geoRes = await fetch(`/api/geocode?lat=${lat}&lon=${lon}`);
          if (!geoRes.ok) throw new Error("geocode failed");
          const geoData = await geoRes.json();
          const candidates: string[] =
            Array.isArray(geoData?.candidates) && geoData.candidates.length > 0
              ? geoData.candidates
              : geoData?.settlement
              ? [geoData.settlement]
              : [];

          if (candidates.length === 0) {
            setGeoError("Не вдалося визначити населений пункт за вашим місцем.");
            setGeoLoading(false);
            return;
          }

          let bestMatch: NovaPoshtaCity | null = null;
          for (const cand of candidates) {
            const cityRes = await fetch(`/api/novaposhta/cities?q=${encodeURIComponent(cand)}`);
            const cityData: NovaPoshtaCity[] = cityRes.ok ? await cityRes.json() : [];
            if (cityData.length > 0) {
              bestMatch = cityData[0];
              break;
            }
          }

          if (!bestMatch) {
            setGeoError(`Населений пункт "${candidates[0]}" не знайдено у Новій пошті.`);
            setGeoLoading(false);
            return;
          }

          isSelectingBranchRef.current = true;
          setCity(bestMatch.name);
          setCityQuery(bestMatch.name);
          setCityRef(bestMatch.ref);
          setBranch("");
          setBranchQuery("");
          setSortByDistance(true);
          setIsBranchOpen(true);

          const allTargetCityRefs = new Set<string>([bestMatch.ref]);
          const nearby = Array.isArray(geoData?.nearbySettlements) ? geoData.nearbySettlements : [];
          for (const s of nearby.slice(0, 4)) {
            if (s.name.toLowerCase() !== candidates[0]?.toLowerCase()) {
              try {
                const nRes = await fetch(`/api/novaposhta/cities?q=${encodeURIComponent(s.name)}`);
                if (nRes.ok) {
                  const nData: NovaPoshtaCity[] = await nRes.json();
                  if (nData.length > 0) {
                    allTargetCityRefs.add(nData[0].ref);
                  }
                }
              } catch (e) {}
            }
          }

          const combinedCityRefs = Array.from(allTargetCityRefs).join(",");
          fetchWarehouses(combinedCityRefs, deliveryType, "", { lat, lon });
        } catch (err) {
          console.warn("Nearest search error", err);
          setGeoError("Не вдалося знайти найближче відділення. Спробуйте обрати місто вручну.");
        } finally {
          setGeoLoading(false);
        }
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError("Доступ до геолокації відхилено. Дозвольте доступ у налаштуваннях браузера.");
        } else {
          setGeoError("Не вдалося визначити місцезнаходження.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const filteredWarehouses = useMemo(() => {
    const q = branchQuery.trim().toLowerCase();
    let result = warehouses;

    if (q && !sortByDistance) {
      result = result.filter(
        (w) =>
          w.description.toLowerCase().includes(q) ||
          w.number.toLowerCase() === q ||
          w.shortAddress.toLowerCase().includes(q)
      );
    }

    if (sortByDistance && userCoords) {
      const withCoords = result.filter((w) => w.latitude != null && w.longitude != null);
      const withoutCoords = result.filter((w) => w.latitude == null || w.longitude == null);

      withCoords.sort((a, b) => {
        const distA = getDistanceKm(userCoords.lat, userCoords.lon, a.latitude!, a.longitude!);
        const distB = getDistanceKm(userCoords.lat, userCoords.lon, b.latitude!, b.longitude!);
        return distA - distB;
      });

      result = [...withCoords, ...withoutCoords];
    }

    return result;
  }, [warehouses, branchQuery, sortByDistance, userCoords]);

  const branchPlaceholder =
    deliveryType === "postbox" ? "Поштомат Нової пошти *" : "Відділення Нової пошти *";

  const renderWarehouseItem = (w: NovaPoshtaWarehouse, mobile = false) => {
    const dist =
      sortByDistance && userCoords && w.latitude != null && w.longitude != null
        ? getDistanceKm(userCoords.lat, userCoords.lon, w.latitude, w.longitude)
        : null;

    return (
      <div
        key={w.ref}
        onClick={() => handleSelectBranch(w)}
        className={`px-4 ${mobile ? "py-3" : "py-2.5"} hover:bg-[var(--color-menu-hover)] active:bg-[var(--color-menu-hover)] cursor-pointer text-[var(--foreground-primary)] transition-colors flex items-start justify-between gap-2 border-b border-[var(--foreground-primary)]/5 last:border-0`}
      >
        <div className="flex flex-col">
          <span className={`font-semibold ${mobile ? "text-[15px]" : "text-sm"}`}>{w.description}</span>
          {w.shortAddress && w.shortAddress !== w.description && (
            <span className="text-xs text-[var(--color-muted-fg)]">{w.shortAddress}</span>
          )}
        </div>
        {dist != null && (
          <span className="text-xs font-medium text-[var(--color-green)] whitespace-nowrap shrink-0">
            {dist < 1 ? `${Math.round(dist * 1000)} м` : `${dist.toFixed(1)} км`}
          </span>
        )}
      </div>
    );
  };

  const findNearestButton = (mobile = false) => (
    <button
      type="button"
      onClick={handleFindNearest}
      disabled={geoLoading}
      className={`flex items-center gap-1.5 text-xs font-medium ${sortByDistance ? "text-[var(--color-green)]" : "text-[var(--color-muted-fg)]"
        } hover:text-[var(--color-green)] transition-colors disabled:opacity-50 ${mobile ? "px-4 py-2" : "px-2 py-1.5"}`}
    >
      {geoLoading ? (
        <span className="inline-block size-3 border-2 border-[var(--color-green)] border-t-transparent rounded-full animate-spin" />
      ) : (
        <LocationIcon />
      )}
      {geoLoading ? "Визначення місця..." : sortByDistance ? "Сортовано за відстанню" : "Знайти найближче"}
    </button>
  );

  if (variant === "desktop") {
    return (
      <div ref={containerRef} className={styles.deliverySelectors}>
        <div className={styles.deliverySelect}>
          <input
            className={styles.deliverySelectInput}
            type="text"
            placeholder="Оберіть населений пункт *"
            value={cityQuery}
            onChange={handleCityChange}
            onFocus={handleCityFocus}
            id="delivery-city"
            aria-label="Населений пункт"
            autoComplete="off"
          />
          <div className={styles.deliverySelectIcon} onClick={() => setIsCityOpen((prev) => !prev)}>
            <ChevronDownIcon />
          </div>

          {isCityOpen && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1.5 max-h-64 overflow-y-auto rounded-xl bg-[var(--background-elevated)] shadow-2xl border border-[var(--color-border-warm)]/40 py-1.5 animate-fade-in">
              {loadingCities ? (
                <div className="px-4 py-3 text-sm text-[var(--color-muted-fg)] flex items-center gap-2">
                  <span className="inline-block size-3.5 border-2 border-[var(--color-green)] border-t-transparent rounded-full animate-spin" />
                  Пошук населених пунктів...
                </div>
              ) : cities.length > 0 ? (
                cities.map((item) => (
                  <div
                    key={item.ref + item.name}
                    onClick={() => handleSelectCity(item)}
                    className="px-4 py-2.5 hover:bg-[var(--color-menu-hover)] cursor-pointer text-sm text-[var(--foreground-primary)] transition-colors flex flex-col border-b border-[var(--foreground-primary)]/5 last:border-0"
                  >
                    <span className="font-semibold">{item.short}</span>
                    <span className="text-xs text-[var(--color-muted-fg)]">{item.name}</span>
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-[var(--color-muted-fg)]">
                  Населений пункт не знайдено. Спробуйте уточнити назву.
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.deliverySelect}>
          <div className="flex items-center justify-between gap-2">
            <input
              className={styles.deliverySelectInput}
              type="text"
              placeholder={branchPlaceholder}
              value={branchQuery}
              onChange={handleBranchChange}
              onFocus={handleBranchFocus}
              id="delivery-branch"
              aria-label="Відділення"
              autoComplete="off"
            />
            <div className={styles.deliverySelectIcon} onClick={() => setIsBranchOpen((prev) => !prev)}>
              <ChevronDownIcon />
            </div>
          </div>

          <div className="flex items-center justify-between mt-1">
            {findNearestButton()}
          </div>
          {geoError && <p className="text-xs text-red-600 mt-1">{geoError}</p>}

          {isBranchOpen && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1.5 max-h-64 overflow-y-auto rounded-xl bg-[var(--background-elevated)] shadow-2xl border border-[var(--color-border-warm)]/40 py-1.5 animate-fade-in">
              {!cityRef && !city ? (
                <div className="px-4 py-3 text-sm text-amber-800 bg-amber-50 dark:text-amber-200 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 rounded-lg m-2">
                  Будь ласка, спочатку оберіть населений пункт зі списку вище.
                </div>
              ) : loadingWarehouses ? (
                <div className="px-4 py-3 text-sm text-[var(--color-muted-fg)] flex items-center gap-2">
                  <span className="inline-block size-3.5 border-2 border-[var(--color-green)] border-t-transparent rounded-full animate-spin" />
                  Завантаження {deliveryType === "postbox" ? "поштоматів" : "відділень"}...
                </div>
              ) : filteredWarehouses.length > 0 ? (
                filteredWarehouses.map((w) => renderWarehouseItem(w))
              ) : (
                <div className="px-4 py-3 text-sm text-[var(--color-muted-fg)]">
                  {deliveryType === "postbox" ? "Поштомати не знайдені в цьому місті." : "Відділення не знайдені."}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-3 mt-1">
      <div className="relative">
        <div className="bg-[var(--background-elevated)] h-[65px] rounded-[9px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.25)] flex items-center justify-between px-5">
          <input
            type="text"
            placeholder="Оберіть населений пункт *"
            value={cityQuery}
            onChange={handleCityChange}
            onFocus={handleCityFocus}
            className="w-full bg-transparent text-[18px] sm:text-[20px] text-[var(--foreground-primary)] placeholder:text-[var(--color-muted-fg)] focus:outline-none"
            autoComplete="off"
          />
          <div onClick={() => setIsCityOpen((prev) => !prev)} className="cursor-pointer text-[var(--foreground-primary)] shrink-0">
            <ChevronDownIcon />
          </div>
        </div>

        {isCityOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-xl bg-[var(--background-elevated)] shadow-2xl border border-[var(--color-border-warm)]/40 py-1.5">
            {loadingCities ? (
              <div className="px-4 py-3 text-sm text-[var(--color-muted-fg)] flex items-center gap-2">
                <span className="inline-block size-3.5 border-2 border-[var(--color-green)] border-t-transparent rounded-full animate-spin" />
                Пошук населених пунктів...
              </div>
            ) : cities.length > 0 ? (
              cities.map((item) => (
                <div
                  key={item.ref + item.name}
                  onClick={() => handleSelectCity(item)}
                  className="px-4 py-3 hover:bg-[var(--color-menu-hover)] active:bg-[var(--color-menu-hover)] cursor-pointer text-[var(--foreground-primary)] transition-colors flex flex-col border-b border-[var(--foreground-primary)]/5 last:border-0"
                >
                  <span className="font-semibold text-[15px]">{item.short}</span>
                  <span className="text-xs text-[var(--color-muted-fg)]">{item.name}</span>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-[var(--color-muted-fg)]">Населений пункт не знайдено</div>
            )}
          </div>
        )}
      </div>

      <div className="relative">
        <div className="bg-[var(--background-elevated)] h-[65px] rounded-[9px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.25)] flex items-center justify-between px-5">
          <input
            type="text"
            placeholder={branchPlaceholder}
            value={branchQuery}
            onChange={handleBranchChange}
            onFocus={handleBranchFocus}
            className="w-full bg-transparent text-[18px] sm:text-[20px] text-[var(--foreground-primary)] placeholder:text-[var(--color-muted-fg)] focus:outline-none"
            autoComplete="off"
          />
          <div onClick={() => setIsBranchOpen((prev) => !prev)} className="cursor-pointer text-[var(--foreground-primary)] shrink-0">
            <ChevronDownIcon />
          </div>
        </div>

        <div className="flex items-center justify-between mt-1 px-1">
          {findNearestButton(true)}
        </div>
        {geoError && <p className="text-xs text-red-600 mt-1 px-1">{geoError}</p>}

        {isBranchOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-xl bg-[var(--background-elevated)] shadow-2xl border border-[var(--color-border-warm)]/40 py-1.5">
            {!cityRef && !city ? (
              <div className="px-4 py-3 text-xs text-amber-800 bg-amber-50 dark:text-amber-200 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 rounded-lg m-2">
                Будь ласка, спочатку оберіть населений пункт зі списку.
              </div>
            ) : loadingWarehouses ? (
              <div className="px-4 py-3 text-sm text-[var(--color-muted-fg)] flex items-center gap-2">
                <span className="inline-block size-3.5 border-2 border-[var(--color-green)] border-t-transparent rounded-full animate-spin" />
                Завантаження {deliveryType === "postbox" ? "поштоматів" : "відділень"}...
              </div>
            ) : filteredWarehouses.length > 0 ? (
              filteredWarehouses.map((w) => renderWarehouseItem(w, true))
            ) : (
              <div className="px-4 py-3 text-sm text-[var(--color-muted-fg)]">
                {deliveryType === "postbox" ? "Поштомати не знайдені." : "Відділення не знайдені."}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}