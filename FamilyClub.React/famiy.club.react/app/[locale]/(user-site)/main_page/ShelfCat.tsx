"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { INK_ASSETS } from "../components/ink-assistant/inkAssets";
import { useMascotShelf } from "@/lib/mascot/MascotShelfContext";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type CatBehaviorState = "walking" | "napping" | "happy" | "jumping" | "landing";

const HOVER_PHRASES_UK = [
  "Мурр... 🐾",
  "Затишно серед книжок... 📖",
  "Шукаєш щось почитати? ✨",
  "Мур-няв... Погладь мене!",
];

const HOVER_PHRASES_EN = [
  "Purr... 🐾",
  "So cozy among the books... 📖",
  "Looking for a good read? ✨",
  "Purr-meow... Pet me!",
];

const CLICK_PHRASES_UK = [
  "Мур-р-р! ❤️",
  "Дякую за ласку! 🐾",
  "Ти найкращий читач! ✨",
  "Муррр... Так приємно! ❤️",
];

const CLICK_PHRASES_EN = [
  "Purr-r-r! ❤️",
  "Thanks for the love! 🐾",
  "You are the best reader! ✨",
  "Purrr... That feels so nice! ❤️",
];

export default function ShelfCat() {
  const { locale } = useLocale();
  const isUk = locale === "uk";
  const { returnCatToHouse, switchShelf, availableShelves } = useMascotShelf();

  const [xPos, setXPos] = useState<number>(() => Math.floor(22 + Math.random() * 45));
  const [direction, setDirection] = useState<1 | -1>(() => (Math.random() > 0.5 ? 1 : -1));
  const [catState, setCatState] = useState<CatBehaviorState>("landing");
  const [jumpFrame, setJumpFrame] = useState<number>(0);
  const [landingFrame, setLandingFrame] = useState<number>(3);
  const [walkFrameIndex, setWalkFrameIndex] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [bubbleText, setBubbleText] = useState<string | null>(null);
  const [hearts, setHearts] = useState<Array<{ id: number; left: number }>>([]);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  // Перевірка prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Анімація приземлення кота на нову поличку при появі
  useEffect(() => {
    if (reducedMotion) {
      setCatState("walking");
      return;
    }
    const t1 = setTimeout(() => {
      setLandingFrame(4);
    }, 160);
    const t2 = setTimeout(() => {
      setCatState("walking");
    }, 340);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [reducedMotion]);

  const jumpTimersRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    return () => {
      jumpTimersRef.current.forEach(clearTimeout);
    };
  }, []);

  // Функція красивого стрибка на іншу поличку
  const triggerJump = useCallback(() => {
    if (catState === "jumping" || availableShelves.length <= 1) return;
    setCatState("jumping");
    setJumpFrame(0);
    setBubbleText(isUk ? "Стриб! 🐾" : "Hop! 🐾");

    jumpTimersRef.current.forEach(clearTimeout);
    jumpTimersRef.current = [
      setTimeout(() => {
        setJumpFrame(1);
      }, 140),
      setTimeout(() => {
        setJumpFrame(2);
      }, 280),
      setTimeout(() => {
        switchShelf();
      }, 450),
    ];
  }, [catState, availableShelves.length, isUk, switchShelf]);

  // Покадрова анімація ходьби (walk0000 -> walk0003)
  useEffect(() => {
    if (catState !== "walking" || isHovered || reducedMotion) return;

    const frameInterval = setInterval(() => {
      setWalkFrameIndex((prev) => (prev + 1) % INK_ASSETS.walk.length);
    }, 180);

    return () => clearInterval(frameInterval);
  }, [catState, isHovered, reducedMotion]);

  // Рух вздовж полички
  useEffect(() => {
    if (catState !== "walking" || isHovered || reducedMotion) return;

    const moveInterval = setInterval(() => {
      setXPos((curr) => {
        const step = 0.08;
        const next = curr + direction * step;

        if (next >= 82) {
          setDirection(-1);
          return 82;
        }
        if (next <= 14) {
          setDirection(1);
          return 14;
        }
        return next;
      });
    }, 45);

    return () => clearInterval(moveInterval);
  }, [catState, direction, isHovered, reducedMotion]);

  // Чергування ходьби, дрімання та самостійних стрибків між поличками
  useEffect(() => {
    if (isHovered || catState === "happy" || catState === "jumping" || catState === "landing" || reducedMotion) return;

    let timer: NodeJS.Timeout;

    if (catState === "walking") {
      const walkDuration = 18000 + Math.random() * 10000;
      timer = setTimeout(() => {
        // З 50% ймовірністю стрибає на іншу поличку, інакше лягає подрімати
        if (availableShelves.length > 1 && Math.random() > 0.45) {
          triggerJump();
        } else {
          setCatState("napping");
        }
      }, walkDuration);
    } else if (catState === "napping") {
      const napDuration = 7000 + Math.random() * 5000;
      timer = setTimeout(() => {
        if (Math.random() > 0.5) {
          setDirection((d) => (d === 1 ? -1 : 1));
        }
        if (availableShelves.length > 1 && Math.random() > 0.5) {
          triggerJump();
        } else {
          setCatState("walking");
        }
      }, napDuration);
    }

    return () => clearTimeout(timer);
  }, [catState, isHovered, reducedMotion, availableShelves.length, triggerJump]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (catState !== "happy" && catState !== "jumping") {
      const phrases = isUk ? HOVER_PHRASES_UK : HOVER_PHRASES_EN;
      const pick = phrases[Math.floor(Math.random() * phrases.length)];
      setBubbleText(pick);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (catState !== "happy" && catState !== "jumping") {
      setBubbleText(null);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (catState === "jumping" || catState === "landing") return;
    setCatState("happy");

    const phrases = isUk ? CLICK_PHRASES_UK : CLICK_PHRASES_EN;
    const pick = phrases[Math.floor(Math.random() * phrases.length)];
    setBubbleText(pick);

    const id = Date.now();
    setHearts((prev) => [
      ...prev,
      { id, left: 30 + Math.random() * 40 },
    ]);
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== id));
    }, 1500);

    setTimeout(() => {
      setCatState("walking");
      setBubbleText(null);
    }, 3200);
  };

  const currentSrc = (() => {
    if (reducedMotion) return INK_ASSETS.lying;
    if (catState === "happy") return INK_ASSETS.game.catHappy;
    if (catState === "napping") return INK_ASSETS.lying;
    if (catState === "jumping") return INK_ASSETS.jumpDown[jumpFrame] || INK_ASSETS.jumpDown[0];
    if (catState === "landing") return INK_ASSETS.jumpDown[landingFrame] || INK_ASSETS.jumpDown[3];
    return INK_ASSETS.walk[walkFrameIndex] || INK_ASSETS.walk[0];
  })();

  const spriteTransform = (() => {
    if (catState === "happy") return "none";
    if (catState === "jumping") {
      const yOffset = jumpFrame === 1 ? -18 : jumpFrame === 2 ? 22 : 0;
      const xOffset = direction * (jumpFrame === 1 ? 14 : jumpFrame === 2 ? 32 : 0);
      const scaleX = direction === -1 ? "scaleX(-1)" : "scaleX(1)";
      return `translate(${xOffset}px, ${yOffset}px) ${scaleX}`;
    }
    if (catState === "landing") {
      return direction === -1 ? "scaleX(-1)" : "scaleX(1)";
    }
    if (catState === "napping" || reducedMotion) {
      return direction === 1 ? "scaleX(-1)" : "scaleX(1)";
    }
    return direction === -1 ? "scaleX(-1)" : "scaleX(1)";
  })();

  return (
    <div
      className="absolute z-50 select-none pointer-events-auto cursor-pointer"
      style={{
        left: `${reducedMotion ? 50 : xPos}%`,
        bottom: "16px",
        transform: "translateX(-50%)",
        transition: catState === "walking" && !isHovered ? "none" : "left 0.3s ease-out",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={isUk ? "Кіт Інк гуляє по поличці. Натисни, щоб погладити" : "Cat Ink walking on bookshelf. Click to pet"}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick(e as unknown as React.MouseEvent);
        }
      }}
    >
      {/* Хмаринка слів / реакцій */}
      {(bubbleText || isHovered) && (
        <div
          className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap rounded-2xl bg-[var(--background-elevated)] px-3.5 py-1.5 shadow-[0px_4px_14px_rgba(0,0,0,0.35)] border border-[var(--color-green)]/30 text-[12px] font-serif font-medium text-[var(--foreground-primary)] flex flex-col items-center gap-1 animate-fade-in"
          style={{ animation: "ink-panel-in 0.25s ease-out both" }}
        >
          <span>{bubbleText || (isUk ? "Мурр... 🐾" : "Purr... 🐾")}</span>

          {(catState === "happy" || isHovered) && catState !== "jumping" && (
            <div className="flex items-center gap-2 pt-1 border-t border-[var(--color-green)]/20 text-[10px]">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  returnCatToHouse();
                }}
                className="cursor-pointer rounded-full bg-[var(--color-green)] px-2 py-0.5 text-white font-sans hover:opacity-90 transition-opacity"
              >
                {isUk ? "У будиночок 🏠" : "Go home 🏠"}
              </button>
              {availableShelves.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerJump();
                  }}
                  className="cursor-pointer rounded-full bg-amber-700/80 px-2 py-0.5 text-white font-sans hover:opacity-90 transition-opacity"
                >
                  {isUk ? "Стрибнути 🐾" : "Jump shelf 🐾"}
                </button>
              )}
            </div>
          )}

          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 bg-[var(--background-elevated)] border-r border-b border-[var(--color-green)]/30"
          />
        </div>
      )}

      {/* Сердечка при погладжуванні */}
      {hearts.map((h) => (
        <span
          key={h.id}
          className="pointer-events-none absolute font-bold select-none text-red-500 text-sm"
          style={{
            left: `${h.left}%`,
            bottom: "115px",
            animation: "ink-float-heart 1.2s ease-out forwards",
          }}
        >
          ❤️
        </span>
      ))}

      {/* Дрімання Zzz */}
      {catState === "napping" && !isHovered && (
        <span
          className="pointer-events-none absolute text-amber-300 font-serif font-bold text-xs select-none drop-shadow"
          style={{
            right: direction === 1 ? "24px" : "96px",
            top: "-20px",
            animation: "ink-zzz 2.4s ease-in-out infinite",
          }}
        >
          Zzz...
        </span>
      )}

      {/* Контейнер спрайта кота — 225×395px */}
      <div
        className="relative h-[225px] w-[395px] drop-shadow-[0_6px_10px_rgba(0,0,0,0.4)]"
        style={{
          transform: spriteTransform,
          opacity: catState === "jumping" && jumpFrame === 2 ? 0 : 1,
          transition:
            catState === "jumping"
              ? "transform 0.14s ease-out, opacity 0.14s ease-out"
              : "transform 0.2s ease-out, opacity 0.2s ease-out",
        }}
      >
        <img
          src={currentSrc}
          alt={isUk ? "Інк на полиці" : "Ink on bookshelf"}
          className="h-full w-full object-contain object-bottom pointer-events-none"
          draggable={false}
        />
      </div>
    </div>
  );
}
