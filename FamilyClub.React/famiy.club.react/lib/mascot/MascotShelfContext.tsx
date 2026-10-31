"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { usePathname } from "next/navigation";

type MascotShelfContextType = {
  isCatOnShelf: boolean;
  activeShelfIndex: number;
  availableShelves: number[];
  registerShelf: (index: number) => () => void;
  toggleCatOnShelf: () => void;
  releaseCatToShelf: () => void;
  returnCatToHouse: () => void;
  switchShelf: () => void;
};

const defaultContext: MascotShelfContextType = {
  isCatOnShelf: false,
  activeShelfIndex: 0,
  availableShelves: [],
  registerShelf: () => () => {},
  toggleCatOnShelf: () => {},
  releaseCatToShelf: () => {},
  returnCatToHouse: () => {},
  switchShelf: () => {},
};

const MascotShelfContext = createContext<MascotShelfContextType>(defaultContext);

export function MascotShelfProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCatOnShelf, setIsCatOnShelf] = useState<boolean>(true);
  const [activeShelfIndex, setActiveShelfIndex] = useState<number>(0);
  const [availableShelves, setAvailableShelves] = useState<number[]>([]);
  const availableShelvesRef = useRef<number[]>([]);
  availableShelvesRef.current = availableShelves;

  // При кожному поверненні на головну сторінку або в каталог кіт знову гуляє
  useEffect(() => {
    const normalized = (pathname || "").replace(/\/+$/, "");
    const isHome = normalized === "" || normalized === "/uk" || normalized === "/en";
    const isCatalog =
      normalized === "/products" ||
      normalized === "/uk/products" ||
      normalized === "/en/products" ||
      normalized.endsWith("/products");

    if (isHome || isCatalog) {
      setIsCatOnShelf(true);
    }
  }, [pathname]);

  // Якщо активна поличка більше не існує серед зареєстрованих поличок — переносимо кота на першу доступну
  useEffect(() => {
    if (availableShelves.length > 0 && !availableShelves.includes(activeShelfIndex)) {
      setActiveShelfIndex(availableShelves[0]);
    }
  }, [availableShelves, activeShelfIndex]);

  const registerShelf = useCallback((index: number) => {
    setAvailableShelves((prev) => {
      if (prev.includes(index)) return prev;
      return [...prev, index].sort((a, b) => a - b);
    });

    return () => {
      setAvailableShelves((prev) => prev.filter((i) => i !== index));
    };
  }, []);

  const releaseCatToShelf = useCallback(() => {
    const list = availableShelvesRef.current;
    const targetShelf =
      list.length > 0 ? list[Math.floor(Math.random() * list.length)] : 0;

    setActiveShelfIndex(targetShelf);
    setIsCatOnShelf(true);
    // Користувача не перекидаємо — скрол залишається на місці
  }, []);

  const switchShelf = useCallback(() => {
    const list = availableShelvesRef.current;
    if (list.length <= 1) return;
    setActiveShelfIndex((current) => {
      const candidates = list.filter((idx) => idx !== current);
      const nextShelf = candidates[Math.floor(Math.random() * candidates.length)] ?? current;
      return nextShelf;
    });
  }, []);

  const returnCatToHouse = useCallback(() => {
    setIsCatOnShelf(false);
  }, []);

  const toggleCatOnShelf = useCallback(() => {
    if (isCatOnShelf) {
      returnCatToHouse();
    } else {
      releaseCatToShelf();
    }
  }, [isCatOnShelf, returnCatToHouse, releaseCatToShelf]);

  return (
    <MascotShelfContext.Provider
      value={{
        isCatOnShelf,
        activeShelfIndex,
        availableShelves,
        registerShelf,
        toggleCatOnShelf,
        releaseCatToShelf,
        returnCatToHouse,
        switchShelf,
      }}
    >
      {children}
    </MascotShelfContext.Provider>
  );
}

export function useMascotShelf(): MascotShelfContextType {
  return useContext(MascotShelfContext);
}

