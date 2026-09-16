"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import type { UkrposhtaCity } from "@/app/api/ukrposhta/cities/route";
import type { UkrposhtaWarehouse } from "@/app/api/ukrposhta/warehouses/route";
import styles from "./checkout.module.css";

interface UkrposhtaFieldsProps {
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

export default function UkrposhtaFields({
  city,
  setCity,
  cityRef,
  setCityRef,
  branch,
  setBranch,
  branchRef,
  setBranchRef,
  variant = "desktop",
}: UkrposhtaFieldsProps) {
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isBranchOpen, setIsBranchOpen] = useState(false);

  const [cities, setCities] = useState<UkrposhtaCity[]>([]);
  const [warehouses, setWarehouses] = useState<UkrposhtaWarehouse[]>([]);

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
          const res = await fetch(`/api/ukrposhta/cities?q=${encodeURIComponent(q.trim())}`);
          if (res.ok) {
            const data: UkrposhtaCity[] = await res.json();
            setCities(data);
          }
        } catch (err) {
          console.warn("Ukrposhta: error loading cities", err);
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

    const cleanDigits = val.replace(/\D/g, "");
    if (cleanDigits.length === 5) {
      fetchWarehouses("", val);
    } else {
      setBranch("");
      setBranchQuery("");
      setBranchRef?.("");
    }
    fetchCities(val);
  };

  const handleSelectCity = (selected: UkrposhtaCity) => {
    setCity(selected.name);
    setCityQuery(selected.name);
    setCityRef?.(selected.ref);
    setBranch("");
    setBranchQuery("");
    setBranchRef?.("");
    setIsCityOpen(false);
    setIsBranchOpen(true);
    if (/^\d{5}$/.test(selected.ref)) {
      fetchWarehouses(selected.name, selected.ref);
    } else {
      fetchWarehouses(selected.name, "");
    }
  };

  const fetchWarehouses = (targetCity: string, searchVal: string) => {
    const cleanDigits = (searchVal || targetCity).replace(/\D/g, "");
    if (!targetCity && !searchVal && cleanDigits.length < 3) return;

    if (branchDebounceRef.current) clearTimeout(branchDebounceRef.current);

    branchDebounceRef.current = setTimeout(
      async () => {
        setLoadingWarehouses(true);
        try {
          const params = new URLSearchParams();
          if (targetCity) params.set("city", targetCity);
          if (searchVal) params.set("search", searchVal);
          if (userCoords) {
            params.set("lat", String(userCoords.lat));
            params.set("lon", String(userCoords.lon));
          }

          const res = await fetch(`/api/ukrposhta/warehouses?${params.toString()}`);
          if (res.ok) {
            const data: UkrposhtaWarehouse[] = await res.json();
            setWarehouses(data);
          }
        } catch (err) {
          console.warn("Ukrposhta: error loading post offices", err);
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

    const cleanDigits = val.replace(/\D/g, "");

    if (city) {
      const localMatches = warehouses.filter((w) => {
        const descMatch = w.description.toLowerCase().includes(val.toLowerCase());
        const postMatch = w.postcode.includes(val) || (cleanDigits.length >= 3 && w.postcode.includes(cleanDigits));
        const numMatch = w.number.toLowerCase() === val.toLowerCase() || (cleanDigits.length >= 3 && w.number.includes(cleanDigits));
        return descMatch || postMatch || numMatch;
      });

      if (localMatches.length === 0 && (val.trim().length > 1 || cleanDigits.length >= 3)) {
        fetchWarehouses(city, val);
      }
    } else if (cleanDigits.length >= 3) {
      fetchWarehouses("", val);
    }
  };

  const handleSelectBranch = (selected: UkrposhtaWarehouse) => {
    setBranch(selected.description);
    setBranchQuery(selected.description);
    setBranchRef?.(selected.ref || selected.postcode);
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
          const geoRes = await fetch(`/api/novaposhta/geocode?lat=${lat}&lon=${lon}`);
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

          let bestMatch: UkrposhtaCity | null = null;
          for (const cand of candidates) {
            const cityRes = await fetch(`/api/ukrposhta/cities?q=${encodeURIComponent(cand)}`);
            const cityData: UkrposhtaCity[] = cityRes.ok ? await cityRes.json() : [];
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

          fetchWarehouses(bestMatch.name, "");
        } catch (err) {
          console.warn("Ukrposhta nearest search error", err);
          setGeoError("Не вдалося знайти найближче відділення. Спробуйте обрати місто або індекс вручну.");
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
    const cleanDigits = branchQuery.replace(/\D/g, "");
    let result = warehouses;

    if (q && !sortByDistance) {
      result = result.filter((w) => {
        const desc = w.description.toLowerCase();
        const post = w.postcode.toLowerCase();
        const num = w.number.toLowerCase();
        const addr = w.shortAddress.toLowerCase();

        const textMatch = desc.includes(q) || post.includes(q) || num === q || addr.includes(q);
        const digitsMatch =
          cleanDigits.length >= 3 &&
          (post.includes(cleanDigits) || desc.includes(cleanDigits) || num.includes(cleanDigits));

        return textMatch || digitsMatch;
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

  const branchPlaceholder = "Відділення або індекс Укрпошти *";

  const renderWarehouseItem = (w: UkrposhtaWarehouse, mobile = false) => {
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
        } hover:bg-[#E5E0D5] active:bg-[#DCD7CC] cursor-pointer text-[#242424] transition-colors flex items-start justify-between gap-2 border-b border-[#242424]/5 last:border-0`}
      >
        <div className="flex flex-col">
          <span className={`font-semibold ${mobile ? "text-[15px]" : "text-sm"}`}>{w.description}</span>
          {w.shortAddress && w.shortAddress !== w.description && (
            <span className="text-xs text-[#666666]">{w.shortAddress}</span>
          )}
        </div>
        {dist != null && (
          <span className="text-xs font-medium text-[#005b33] whitespace-nowrap shrink-0">
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
        sortByDistance ? "text-[#005b33]" : "text-[#666666]"
      } hover:text-[#005b33] transition-colors disabled:opacity-50 ${
        mobile ? "px-4 py-2" : "px-2 py-1.5"
      }`}
    >
      {geoLoading ? (
        <span className="inline-block size-3 border-2 border-[#005b33] border-t-transparent rounded-full animate-spin" />
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
            id="ukr-delivery-city"
            aria-label="Населений пункт"
            autoComplete="off"
          />
          <div className={styles.deliverySelectIcon} onClick={() => setIsCityOpen((prev) => !prev)}>
            <ChevronDownIcon />
          </div>

          {isCityOpen && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1.5 max-h-64 overflow-y-auto rounded-xl bg-[#F5F3EE] shadow-2xl border border-[#B7895E]/40 py-1.5 animate-fade-in">
              {loadingCities ? (
                <div className="px-4 py-3 text-sm text-[#666666] flex items-center gap-2">
                  <span className="inline-block size-3.5 border-2 border-[#005b33] border-t-transparent rounded-full animate-spin" />
                  Пошук населених пунктів...
                </div>
              ) : cities.length > 0 ? (
                cities.map((item) => (
                  <div
                    key={item.ref + item.name}
                    onClick={() => handleSelectCity(item)}
                    className="px-4 py-2.5 hover:bg-[#E5E0D5] cursor-pointer text-sm text-[#242424] transition-colors flex flex-col border-b border-[#242424]/5 last:border-0"
                  >
                    <span className="font-semibold">{item.short}</span>
                    <span className="text-xs text-[#666666]">{item.name}</span>
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-[#666666]">
                  Населений пункт не знайдено. Спробуйте ввести індекс або іншу назву.
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
              id="ukr-delivery-branch"
              aria-label="Відділення Укрпошти"
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
            <div className="absolute top-full left-0 right-0 z-50 mt-1.5 max-h-64 overflow-y-auto rounded-xl bg-[#F5F3EE] shadow-2xl border border-[#B7895E]/40 py-1.5 animate-fade-in">
              {loadingWarehouses ? (
                <div className="px-4 py-3 text-sm text-[#666666] flex items-center gap-2">
                  <span className="inline-block size-3.5 border-2 border-[#005b33] border-t-transparent rounded-full animate-spin" />
                  Завантаження відділень Укрпошти...
                </div>
              ) : filteredWarehouses.length > 0 ? (
                filteredWarehouses.map((w) => renderWarehouseItem(w))
              ) : !city ? (
                <div className="px-4 py-3 text-sm text-amber-800 bg-amber-50 rounded-lg m-2">
                  Будь ласка, спочатку оберіть населений пункт або введіть 5-значний індекс (наприклад 70-450).
                </div>
              ) : (
                <div className="px-4 py-3 text-sm text-[#666666]">
                  Відділення не знайдені. Спробуйте ввести точний індекс (наприклад 70-450).
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
        <div className="bg-[#f5f3ee] h-[65px] rounded-[9px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.25)] flex items-center justify-between px-5">
          <input
            type="text"
            placeholder="Оберіть населений пункт *"
            value={cityQuery}
            onChange={handleCityChange}
            onFocus={handleCityFocus}
            className="w-full bg-transparent text-[18px] sm:text-[20px] text-[#242424] placeholder:text-[#242424]/70 focus:outline-none"
            autoComplete="off"
          />
          <div onClick={() => setIsCityOpen((prev) => !prev)} className="cursor-pointer text-[#242424] shrink-0">
            <ChevronDownIcon />
          </div>
        </div>

        {isCityOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-xl bg-[#F5F3EE] shadow-2xl border border-[#B7895E]/40 py-1.5">
            {loadingCities ? (
              <div className="px-4 py-3 text-sm text-[#666666] flex items-center gap-2">
                <span className="inline-block size-3.5 border-2 border-[#005b33] border-t-transparent rounded-full animate-spin" />
                Пошук населених пунктів...
              </div>
            ) : cities.length > 0 ? (
              cities.map((item) => (
                <div
                  key={item.ref + item.name}
                  onClick={() => handleSelectCity(item)}
                  className="px-4 py-3 hover:bg-[#E5E0D5] active:bg-[#DCD7CC] cursor-pointer text-[#242424] transition-colors flex flex-col border-b border-[#242424]/5 last:border-0"
                >
                  <span className="font-semibold text-[15px]">{item.short}</span>
                  <span className="text-xs text-[#666666]">{item.name}</span>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-[#666666]">Населений пункт не знайдено</div>
            )}
          </div>
        )}
      </div>

      <div className="relative">
        <div className="bg-[#f5f3ee] h-[65px] rounded-[9px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.25)] flex items-center justify-between px-5">
          <input
            type="text"
            placeholder={branchPlaceholder}
            value={branchQuery}
            onChange={handleBranchChange}
            onFocus={handleBranchFocus}
            className="w-full bg-transparent text-[18px] sm:text-[20px] text-[#242424] placeholder:text-[#242424]/70 focus:outline-none"
            autoComplete="off"
          />
          <div onClick={() => setIsBranchOpen((prev) => !prev)} className="cursor-pointer text-[#242424] shrink-0">
            <ChevronDownIcon />
          </div>
        </div>

        <div className="flex items-center justify-between mt-1 px-1">
          {findNearestButton(true)}
        </div>
        {geoError && <p className="text-xs text-red-600 mt-1 px-1">{geoError}</p>}

        {isBranchOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-xl bg-[#F5F3EE] shadow-2xl border border-[#B7895E]/40 py-1.5">
            {loadingWarehouses ? (
              <div className="px-4 py-3 text-sm text-[#666666] flex items-center gap-2">
                <span className="inline-block size-3.5 border-2 border-[#005b33] border-t-transparent rounded-full animate-spin" />
                Завантаження відділень Укрпошти...
              </div>
            ) : filteredWarehouses.length > 0 ? (
              filteredWarehouses.map((w) => renderWarehouseItem(w, true))
            ) : !city ? (
              <div className="px-4 py-3 text-xs text-amber-800 bg-amber-50 rounded-lg m-2">
                Будь ласка, спочатку оберіть населений пункт або введіть 5-значний індекс (наприклад 70-450).
              </div>
            ) : (
              <div className="px-4 py-3 text-sm text-[#666666]">
                Відділення не знайдені. Введіть точний індекс (наприклад 70-450).
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

