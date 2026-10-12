"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";

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
  const [isCatOnShelf, setIsCatOnShelf] = useState<boolean>(false);
  const [activeShelfIndex, setActiveShelfIndex] = useState<number>(0);
  const [availableShelves, setAvailableShelves] = useState<number[]>([]);
  const availableShelvesRef = useRef<number[]>([]);
  availableShelvesRef.current = availableShelves;

  const registerShelf = useCallback((index: number) => {
    setAvailableShelves((prev) => {
      if (prev.includes(index)) return prev;
      return [...prev, index].sort((a, b) => a - b);
    });

    return () => {
      setAvailableShelves((prev) => prev.filter((i) => i !== index));
    };
  }, []);

  const scrollToShelf = useCallback((shelfIdx: number) => {
    // Delay slightly to let DOM mount or stabilize
    setTimeout(() => {
      const el =
        document.getElementById(`book-shelf-${shelfIdx}`) ||
        document.querySelector(`[data-shelf-index="${shelfIdx}"]`) ||
        document.getElementById("shelf-cat-anchor");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 120);
  }, []);

  const releaseCatToShelf = useCallback(() => {
    const list = availableShelvesRef.current;
    const targetShelf =
      list.length > 0 ? list[Math.floor(Math.random() * list.length)] : 0;

    setActiveShelfIndex(targetShelf);
    setIsCatOnShelf(true);
    scrollToShelf(targetShelf);
  }, [scrollToShelf]);

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

