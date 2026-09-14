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
  deliveryType: "branch" | "postbox";
  variant?: "desktop" | "mobile";
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M7 10l5 5 5-5H7z" fill="currentColor" />
    </svg>
  );
}

export default function NovaPoshtaFields({
  city,
  setCity,
  cityRef,
  setCityRef,
  branch,
  setBranch,
  deliveryType,
  variant = "desktop",
}: NovaPoshtaFieldsProps) {
  // Dropdown visibility
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isBranchOpen, setIsBranchOpen] = useState(false);

  // Lists
  const [cities, setCities] = useState<NovaPoshtaCity[]>([]);
  const [warehouses, setWarehouses] = useState<NovaPoshtaWarehouse[]>([]);

  // Loading states
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);

  // Local query inputs to decouple typing from confirmed selection
  const [cityQuery, setCityQuery] = useState(city);
  const [branchQuery, setBranchQuery] = useState(branch);

  // Refs for outside click
  const containerRef = useRef<HTMLDivElement>(null);
  const cityDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const branchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize when external props change
  useEffect(() => {
    setCityQuery(city);
  }, [city]);

  useEffect(() => {
    setBranchQuery(branch);
  }, [branch]);

  // Handle clicking outside to close dropdowns
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

  // ─── 1. Cities Fetching (Debounced & Cached) ───
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
    }, q.length < 2 ? 0 : 350); // 0ms for default/top cities, 350ms debounce when typing
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
    // If user changes city, invalidate previous cityRef and branch
    setCityRef("");
    setBranch("");
    setBranchQuery("");
    fetchCities(val);
  };

  const handleSelectCity = (selected: NovaPoshtaCity) => {
    setCity(selected.name);
    setCityQuery(selected.name);
    setCityRef(selected.ref);
    setBranch("");
    setBranchQuery("");
    setIsCityOpen(false);
    // Immediately open branch dropdown and prefetch warehouses
    setIsBranchOpen(true);
    fetchWarehouses(selected.ref, deliveryType, "");
  };

  // ─── 2. Warehouses Fetching ───
  const fetchWarehouses = (ref: string, type: "branch" | "postbox", search: string) => {
    if (!ref) return;

    if (branchDebounceRef.current) clearTimeout(branchDebounceRef.current);

    branchDebounceRef.current = setTimeout(async () => {
      setLoadingWarehouses(true);
      try {
        const url = `/api/novaposhta/warehouses?cityRef=${encodeURIComponent(ref)}&type=${type}&search=${encodeURIComponent(search.trim())}`;
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

  // Refetch warehouses when deliveryType toggles (branch <-> postbox)
  useEffect(() => {
    if (cityRef) {
      setBranch("");
      setBranchQuery("");
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
    setIsBranchOpen(true);

    if (cityRef) {
      // If we have warehouses cached, check if client search has matches
      const localMatches = warehouses.filter((w) =>
        w.description.toLowerCase().includes(val.toLowerCase()) ||
        w.number.toLowerCase() === val.toLowerCase()
      );

      // If no local matches or user types something specific, query API with debounce
      if (localMatches.length === 0 && val.trim().length > 1) {
        fetchWarehouses(cityRef, deliveryType, val);
      }
    }
  };

  const handleSelectBranch = (selected: NovaPoshtaWarehouse) => {
    setBranch(selected.description);
    setBranchQuery(selected.description);
    setIsBranchOpen(false);
  };

  // Client-side filtering of already fetched warehouses
  const filteredWarehouses = useMemo(() => {
    const q = branchQuery.trim().toLowerCase();
    if (!q) return warehouses;
    return warehouses.filter(
      (w) =>
        w.description.toLowerCase().includes(q) ||
        w.number.toLowerCase() === q ||
        w.shortAddress.toLowerCase().includes(q)
    );
  }, [warehouses, branchQuery]);

  const branchPlaceholder =
    deliveryType === "postbox"
      ? "Поштомат Нової пошти *"
      : "Відділення Нової пошти *";

  // ─── DESKTOP VIEW ───
  if (variant === "desktop") {
    return (
      <div ref={containerRef} className={styles.deliverySelectors}>
        {/* City Select */}
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
          <div
            className={styles.deliverySelectIcon}
            onClick={() => setIsCityOpen((prev) => !prev)}
          >
            <ChevronDownIcon />
          </div>

          {/* City Autocomplete Dropdown */}
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
                  Населений пункт не знайдено. Спробуйте уточнити назву.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Branch Select */}
        <div className={styles.deliverySelect}>
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
          <div
            className={styles.deliverySelectIcon}
            onClick={() => setIsBranchOpen((prev) => !prev)}
          >
            <ChevronDownIcon />
          </div>

          {/* Branch Autocomplete Dropdown */}
          {isBranchOpen && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1.5 max-h-64 overflow-y-auto rounded-xl bg-[#F5F3EE] shadow-2xl border border-[#B7895E]/40 py-1.5 animate-fade-in">
              {!cityRef && !city ? (
                <div className="px-4 py-3 text-sm text-amber-800 bg-amber-50 rounded-lg m-2">
                  Будь ласка, спочатку оберіть населений пункт зі списку вище.
                </div>
              ) : loadingWarehouses ? (
                <div className="px-4 py-3 text-sm text-[#666666] flex items-center gap-2">
                  <span className="inline-block size-3.5 border-2 border-[#005b33] border-t-transparent rounded-full animate-spin" />
                  Завантаження {deliveryType === "postbox" ? "поштоматів" : "відділень"}...
                </div>
              ) : filteredWarehouses.length > 0 ? (
                filteredWarehouses.map((w) => (
                  <div
                    key={w.ref}
                    onClick={() => handleSelectBranch(w)}
                    className="px-4 py-2.5 hover:bg-[#E5E0D5] cursor-pointer text-sm text-[#242424] transition-colors flex flex-col border-b border-[#242424]/5 last:border-0"
                  >
                    <span className="font-semibold">{w.description}</span>
                    {w.shortAddress && w.shortAddress !== w.description && (
                      <span className="text-xs text-[#666666]">{w.shortAddress}</span>
                    )}
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-[#666666]">
                  {deliveryType === "postbox"
                    ? "Поштомати не знайдені в цьому місті."
                    : "Відділення не знайдені."}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── MOBILE VIEW ───
  return (
    <div ref={containerRef} className="flex flex-col gap-3 mt-1">
      {/* City Input */}
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
          <div
            onClick={() => setIsCityOpen((prev) => !prev)}
            className="cursor-pointer text-[#242424] shrink-0"
          >
            <ChevronDownIcon />
          </div>
        </div>

        {/* City Dropdown Mobile */}
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
              <div className="px-4 py-3 text-sm text-[#666666]">
                Населений пункт не знайдено
              </div>
            )}
          </div>
        )}
      </div>

      {/* Branch Input */}
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
          <div
            onClick={() => setIsBranchOpen((prev) => !prev)}
            className="cursor-pointer text-[#242424] shrink-0"
          >
            <ChevronDownIcon />
          </div>
        </div>

        {/* Branch Dropdown Mobile */}
        {isBranchOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-xl bg-[#F5F3EE] shadow-2xl border border-[#B7895E]/40 py-1.5">
            {!cityRef && !city ? (
              <div className="px-4 py-3 text-xs text-amber-800 bg-amber-50 rounded-lg m-2">
                Будь ласка, спочатку оберіть населений пункт зі списку.
              </div>
            ) : loadingWarehouses ? (
              <div className="px-4 py-3 text-sm text-[#666666] flex items-center gap-2">
                <span className="inline-block size-3.5 border-2 border-[#005b33] border-t-transparent rounded-full animate-spin" />
                Завантаження {deliveryType === "postbox" ? "поштоматів" : "відділень"}...
              </div>
            ) : filteredWarehouses.length > 0 ? (
              filteredWarehouses.map((w) => (
                <div
                  key={w.ref}
                  onClick={() => handleSelectBranch(w)}
                  className="px-4 py-3 hover:bg-[#E5E0D5] active:bg-[#DCD7CC] cursor-pointer text-[#242424] transition-colors flex flex-col border-b border-[#242424]/5 last:border-0"
                >
                  <span className="font-semibold text-[15px]">{w.description}</span>
                  {w.shortAddress && w.shortAddress !== w.description && (
                    <span className="text-xs text-[#666666]">{w.shortAddress}</span>
                  )}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-[#666666]">
                {deliveryType === "postbox"
                  ? "Поштомати не знайдені."
                  : "Відділення не знайдені."}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

