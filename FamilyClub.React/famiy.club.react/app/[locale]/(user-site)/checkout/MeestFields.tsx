"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import type { MeestCity } from "@/app/api/meest/cities/route";
import type { MeestWarehouse } from "@/app/api/meest/warehouses/route";
import styles from "./checkout.module.css";

interface MeestFieldsProps {
  city: string;
  setCity: (val: string) => void;
  cityRef?: string;
  setCityRef?: (val: string) => void;
  branch: string;
  setBranch: (val: string) => void;
  branchRef?: string;
  setBranchRef?: (val: string) => void;
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

export default function MeestFields({
  city,
  setCity,
  cityRef,
  setCityRef,
  branch,
  setBranch,
  branchRef,
  setBranchRef,
  variant = "desktop",
}: MeestFieldsProps) {
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isBranchOpen, setIsBranchOpen] = useState(false);

  const [cities, setCities] = useState<MeestCity[]>([]);
  const [warehouses, setWarehouses] = useState<MeestWarehouse[]>([]);

  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);

  const [cityQuery, setCityQuery] = useState(city);
  const [branchQuery, setBranchQuery] = useState(branch);

  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [sortByDistance, setSortByDistance] = useState(false);

  const cityDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const branchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (city !== cityQuery) {
      setCityQuery(city);
    }
  }, [city]);

  useEffect(() => {
    if (branch !== branchQuery) {
      setBranchQuery(branch);
    }
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

    cityDebounceRef.current = setTimeout(
      async () => {
        setLoadingCities(true);
        try {
          const res = await fetch(`/api/meest/cities?q=${encodeURIComponent(q.trim())}`);
          if (res.ok) {
            const data: MeestCity[] = await res.json();
            setCities(data);
          }
        } catch (err) {
          console.warn("Meest: error loading cities", err);
        } finally {
          setLoadingCities(false);
        }
      },
      q.length < 2 ? 0 : 350
    );
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
    setCityRef?.("");
    setIsCityOpen(true);
    setBranch("");
    setBranchQuery("");
    setBranchRef?.("");
    fetchCities(val);
  };

  const handleSelectCity = (selected: MeestCity) => {
    setCity(selected.name);
    setCityQuery(selected.name);
    setCityRef?.(selected.ref);
    setBranch("");
    setBranchQuery("");
    setBranchRef?.("");
    setIsCityOpen(false);
    setIsBranchOpen(true);
    fetchWarehouses(selected.name, "");
  };

  const fetchWarehouses = (targetCity: string, searchVal: string, coords?: { lat: number; lon: number }) => {
    if (!targetCity && !searchVal && !coords) return;

    if (branchDebounceRef.current) clearTimeout(branchDebounceRef.current);

    branchDebounceRef.current = setTimeout(
      async () => {
        setLoadingWarehouses(true);
        try {
          const params = new URLSearchParams();
          if (targetCity) params.set("city", targetCity);
          if (searchVal) params.set("search", searchVal);
          const c = coords || userCoords;
          if (c) {
            params.set("lat", String(c.lat));
            params.set("lon", String(c.lon));
          }

          const res = await fetch(`/api/meest/warehouses?${params.toString()}`);
          if (res.ok) {
            const data: MeestWarehouse[] = await res.json();
            setWarehouses(data);
          }
        } catch (err) {
          console.warn("Meest: error loading post offices", err);
        } finally {
          setLoadingWarehouses(false);
        }
      },
      searchVal ? 200 : 0
    );
  };

  const handleBranchFocus = () => {
    setIsBranchOpen(true);
    setIsCityOpen(false);
    if (city && warehouses.length === 0) {
      fetchWarehouses(city, "");
    }
  };

  const handleBranchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBranchQuery(val);
    setBranch(val);
    setBranchRef?.("");
    setIsBranchOpen(true);
    setSortByDistance(false);

    if (city) {
      const localMatches = warehouses.filter((w) => {
        const descMatch = w.description.toLowerCase().includes(val.toLowerCase());
        const numMatch = w.number.toLowerCase() === val.toLowerCase();
        return descMatch || numMatch;
      });

      if (localMatches.length === 0 && val.trim().length > 0) {
        fetchWarehouses(city, val);
      }
    } else if (val.trim().length > 1) {
      fetchWarehouses("", val);
    }
  };

  const handleSelectBranch = (selected: MeestWarehouse) => {
    setBranch(selected.description);
    setBranchQuery(selected.description);
    setBranchRef?.(selected.ref || selected.number);
    setIsBranchOpen(false);

    if (!city && selected.shortAddress) {
      setCity(selected.shortAddress);
      setCityQuery(selected.shortAddress);
    }
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

          let bestMatch: MeestCity | null = null;
          for (const cand of candidates) {
            const cityRes = await fetch(`/api/meest/cities?q=${encodeURIComponent(cand)}`);
            const cityData: MeestCity[] = cityRes.ok ? await cityRes.json() : [];
            if (cityData.length > 0) {
              bestMatch = cityData[0];
              break;
            }
          }

          if (!bestMatch) {
            bestMatch = {
              name: candidates[0],
              short: candidates[0],
              ref: candidates[0],
            };
          }

          setCity(bestMatch.name);
          setCityQuery(bestMatch.name);
          setBranch("");
          setBranchQuery("");
          setSortByDistance(true);
          setIsBranchOpen(true);

          const nearby = Array.isArray(geoData?.nearbySettlements) ? geoData.nearbySettlements : [];
          const allCityNames = [bestMatch.name];
          for (const s of nearby.slice(0, 3)) {
            if (!allCityNames.some((n) => n.toLowerCase().includes(s.name.toLowerCase()))) {
              allCityNames.push(s.name);
            }
          }

          fetchWarehouses(allCityNames.join(","), "", { lat, lon });
        } catch (err) {
          console.warn("Meest nearest search error", err);
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
    let result = warehouses;

    if (branchQuery.trim()) {
      const q = branchQuery.toLowerCase().trim();
      result = result.filter((w) => {
        const desc = w.description.toLowerCase();
        const num = w.number.toLowerCase();
        const addr = w.shortAddress.toLowerCase();
        return desc.includes(q) || num === q || addr.includes(q);
      });
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

  const branchPlaceholder = "Відділення або поштомат Meest *";

  const renderWarehouseItem = (w: MeestWarehouse, mobile = false) => {
    const dist =
      sortByDistance && userCoords && w.latitude != null && w.longitude != null
        ? getDistanceKm(userCoords.lat, userCoords.lon, w.latitude, w.longitude)
        : null;

    return (
      <div
        key={w.ref + w.description}
        onClick={() => handleSelectBranch(w)}
        className={`px-4 ${
          mobile ? "py-3" : "py-2.5"
        } hover:bg-[var(--color-menu-hover)] active:bg-[var(--color-menu-hover)] cursor-pointer text-[var(--foreground-primary)] transition-colors flex items-start justify-between gap-2 border-b border-[var(--foreground-primary)]/5 last:border-0`}
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
      className={`flex items-center gap-1.5 text-xs font-medium ${
        sortByDistance ? "text-[var(--color-green)]" : "text-[var(--color-muted-fg)]"
      } hover:text-[var(--color-green)] transition-colors disabled:opacity-50 ${
        mobile ? "px-4 py-2" : "px-2 py-1.5"
      }`}
    >
      {geoLoading ? (
        <span className="inline-block size-3 border-2 border-[var(--color-green)] border-t-transparent rounded-full animate-spin" />
      ) : (
        <LocationIcon />
      )}
      {geoLoading
        ? "Визначення місця..."
        : sortByDistance
        ? "Сортовано за відстанню"
        : "Знайти найближче відділення"}
    </button>
  );

  if (variant === "desktop") {
    return (
      <div ref={containerRef} className={`${styles.deliverySelectors} mt-3`}>
        <div className={styles.deliverySelect}>
          <input
            className={styles.deliverySelectInput}
            type="text"
            placeholder="Оберіть населений пункт *"
            value={cityQuery}
            onChange={handleCityChange}
            onFocus={handleCityFocus}
            id="meest-delivery-city"
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
                  Населений пункт не знайдено. Спробуйте іншу назву.
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
              id="meest-delivery-branch"
              aria-label="Відділення Meest"
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
              {loadingWarehouses ? (
                <div className="px-4 py-3 text-sm text-[var(--color-muted-fg)] flex items-center gap-2">
                  <span className="inline-block size-3.5 border-2 border-[var(--color-green)] border-t-transparent rounded-full animate-spin" />
                  Завантаження відділень Meest...
                </div>
              ) : filteredWarehouses.length > 0 ? (
                filteredWarehouses.map((w) => renderWarehouseItem(w))
              ) : !city ? (
                <div className="px-4 py-3 text-sm text-amber-800 bg-amber-50 dark:text-amber-200 dark:bg-amber-950/40 dark:border dark:border-amber-800/40 rounded-lg m-2">
                  Будь ласка, спочатку оберіть населений пункт.
                </div>
              ) : (
                <div className="px-4 py-3 text-sm text-amber-900 bg-amber-50 dark:text-amber-200 dark:bg-amber-950/40 dark:border-amber-800/40 rounded-xl m-2 border border-amber-200/70 leading-relaxed">
                  У цьому населеному пункті немає відділень або поштоматів Meest. Будь ласка, оберіть іншу службу доставки (Нова Пошта або Укрпошта) або натисніть «Знайти найближче відділення».
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-3 mt-2">
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
            {loadingWarehouses ? (
              <div className="px-4 py-3 text-sm text-[var(--color-muted-fg)] flex items-center gap-2">
                <span className="inline-block size-3.5 border-2 border-[var(--color-green)] border-t-transparent rounded-full animate-spin" />
                Завантаження відділень Meest...
              </div>
            ) : filteredWarehouses.length > 0 ? (
              filteredWarehouses.map((w) => renderWarehouseItem(w, true))
            ) : !city ? (
              <div className="px-4 py-3 text-xs text-amber-800 bg-amber-50 dark:text-amber-200 dark:bg-amber-950/40 dark:border dark:border-amber-800/40 rounded-lg m-2">
                Будь ласка, спочатку оберіть населений пункт.
              </div>
            ) : (
              <div className="px-4 py-3 text-xs text-amber-900 bg-amber-50 dark:text-amber-200 dark:bg-amber-950/40 dark:border-amber-800/40 rounded-xl m-2 border border-amber-200/70 leading-relaxed">
                У цьому населеному пункті немає відділень або поштоматів Meest. Будь ласка, оберіть іншу службу доставки (Нова Пошта або Укрпошта) або натисніть «Знайти найближче відділення».
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

