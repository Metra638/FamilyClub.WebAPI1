"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "@/lib/i18n/LocaleProvider";
import "./ink-assistant.css";
import { INK_ASSETS, type InkPhase } from "./inkAssets";
import InkChatPanel from "./InkChatPanel";
import InkHouse from "./InkHouse";
import InkPlayGame from "./game/InkPlayGame";
import { playBellSound } from "./playBellSound";
import { useSpriteAnimation } from "./useSpriteAnimation";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}

export default function InkAssistant() {
  const t = useTranslations();
  const reducedMotion = usePrefersReducedMotion();
  const [phase, setPhase] = useState<InkPhase>("idle");
  const [gameKey, setGameKey] = useState(0);

  const handleActivate = useCallback(() => {
    if (phase !== "idle") return;
    if (reducedMotion) {
      setPhase("open");
      return;
    }
    playBellSound();
    setPhase("ringing");
  }, [phase, reducedMotion]);

  const handleBellComplete = useCallback(() => {
    setPhase((current) => (current === "ringing" ? "emerging" : current));
  }, []);

  const handleEmergeComplete = useCallback(() => {
    setPhase((current) => (current === "emerging" ? "open" : current));
  }, []);

  useEffect(() => {
    if (phase === "ringing" && reducedMotion) {
      setPhase("open");
    }
  }, [phase, reducedMotion]);

  const jumpFrame = useSpriteAnimation({
    frames: INK_ASSETS.jumpDown,
    active: phase === "emerging" && !reducedMotion,
    frameMs: 100,
    loops: 1,
    onComplete: handleEmergeComplete,
  });

  useEffect(() => {
    if (phase !== "emerging") return;
    if (reducedMotion) {
      setPhase("open");
      return;
    }
    const t = window.setTimeout(() => setPhase("open"), 900);
    return () => window.clearTimeout(t);
  }, [phase, reducedMotion]);

  const handleClose = useCallback(() => {
    setPhase("idle");
  }, []);

  const handlePlayGame = useCallback(() => {
    setGameKey((k) => k + 1);
    setPhase("playing");
  }, []);

  const handleExitGame = useCallback(() => {
    setPhase("open");
  }, []);

  const handlePlayAgain = useCallback(() => {
    setGameKey((k) => k + 1);
    setPhase("playing");
  }, []);

  useEffect(() => {
    if (phase !== "open") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, handleClose]);

  const showCat = phase === "emerging" || phase === "open";
  const catSrc =
    phase === "emerging" && !reducedMotion ? jumpFrame : INK_ASSETS.lying;

  return (
    <>
      {phase === "playing" && (
        <InkPlayGame
          key={gameKey}
          onExit={handleExitGame}
          onPlayAgain={handlePlayAgain}
        />
      )}

      <div
        className={`pointer-events-none fixed bottom-6 right-2 z-40 hidden md:block lg:right-6 ${
          phase === "playing" ? "invisible" : ""
        }`}
        aria-live="polite"
      >
        <div className="pointer-events-auto flex items-end gap-2 lg:gap-3">
          {phase === "open" && (
            <InkChatPanel onClose={handleClose} onPlayGame={handlePlayGame} />
          )}

          {showCat && (
            <div className="ink-cat-in mb-10 h-[130px] w-[200px] shrink-0">
              <img
                src={catSrc}
                alt={t("ink.catAlt")}
                className="h-full w-full object-contain object-bottom drop-shadow-md"
                draggable={false}
              />
            </div>
          )}

          <div className="relative flex flex-col items-center">
            <InkHouse
              phase={phase === "playing" ? "open" : phase}
              onActivate={handleActivate}
              onBellComplete={handleBellComplete}
              reducedMotion={reducedMotion}
            />

            <p
              className={`mt-1 max-w-[160px] text-center font-serif text-[11px] leading-tight text-[#005B33]/80 ${
                phase === "idle" ? "" : "invisible"
              }`}
              aria-hidden={phase !== "idle"}
            >
              {t("ink.hint")}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
