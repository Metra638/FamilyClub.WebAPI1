"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslations } from "@/lib/i18n/LocaleProvider";
import "./ink-assistant.css";
import { INK_ASSETS, type InkPhase } from "./inkAssets";
import InkCatFigure, { type InkCatActivity } from "./InkCatFigure";
import InkChatPanel from "./InkChatPanel";
import InkHouse from "./InkHouse";
import InkPlayGame from "./game/InkPlayGame";
import { playBellSound } from "./playBellSound";
import { useSpriteAnimation } from "./useSpriteAnimation";
import { useMascotShelf } from "@/lib/mascot/MascotShelfContext";

/** Fallback widths if refs are not ready yet (match InkChatPanel / InkCatFigure / InkHouse). */
const CHAT_W_FALLBACK = 300;
const CAT_W_FALLBACK = 504;
const HOUSE_W_FALLBACK = 315;
const ROW_GAP_PX = 12;
const VIEW_SAFE_PX = 16;

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
  const { isCatOnShelf, toggleCatOnShelf, returnCatToHouse } = useMascotShelf();
  const [phase, setPhase] = useState<InkPhase>("idle");
  const [gameKey, setGameKey] = useState(0);
  const [activity, setActivity] = useState<InkCatActivity>("idle");
  const [userTyping, setUserTyping] = useState(false);
  /** Stack chat above cat+house only when the horizontal row would overflow the viewport. */
  const [stackChat, setStackChat] = useState(false);
  const chatMeasureRef = useRef<HTMLDivElement>(null);
  const catMeasureRef = useRef<HTMLDivElement>(null);
  const houseMeasureRef = useRef<HTMLDivElement>(null);

  const handleActivate = useCallback(() => {
    if (phase !== "idle") return;
    if (isCatOnShelf) {
      returnCatToHouse();
    }
    if (reducedMotion) {
      setPhase("open");
      return;
    }
    playBellSound();
    setPhase("ringing");
  }, [phase, reducedMotion, isCatOnShelf, returnCatToHouse]);

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
    const timer = window.setTimeout(() => setPhase("open"), 900);
    return () => window.clearTimeout(timer);
  }, [phase, reducedMotion]);

  const handleClose = useCallback(() => {
    setPhase("idle");
    setActivity("idle");
    setUserTyping(false);
  }, []);

  const handlePlayGame = useCallback(() => {
    setGameKey((k) => k + 1);
    setPhase("playing");
    setActivity("idle");
    setUserTyping(false);
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
  const chatOpen = phase === "open";

  useLayoutEffect(() => {
    if (!chatOpen) {
      setStackChat(false);
      return;
    }

    const measure = () => {
      const chatW =
        chatMeasureRef.current?.offsetWidth || CHAT_W_FALLBACK;
      const catW = showCat
        ? catMeasureRef.current?.offsetWidth || CAT_W_FALLBACK
        : 0;
      const houseW =
        houseMeasureRef.current?.offsetWidth || HOUSE_W_FALLBACK;
      const gaps = ROW_GAP_PX * (showCat ? 2 : 1);
      const rowNeeds = chatW + catW + houseW + gaps + VIEW_SAFE_PX;
      setStackChat(window.innerWidth < rowNeeds);
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [chatOpen, showCat]);

  const chatPanel = chatOpen ? (
    <div
      ref={chatMeasureRef}
      className={stackChat ? undefined : "relative -top-[60px]"}
    >
      <InkChatPanel
        onClose={handleClose}
        onPlayGame={handlePlayGame}
        onActivityChange={setActivity}
        onUserTypingChange={setUserTyping}
        reducedMotion={reducedMotion}
      />
    </div>
  ) : null;

  const catFigure = showCat ? (
    <div ref={catMeasureRef}>
      <InkCatFigure
        emerging={phase === "emerging" && !reducedMotion}
        jumpFrame={jumpFrame}
        activity={activity}
        userTyping={userTyping}
        reducedMotion={reducedMotion}
        alt={t("ink.catAlt")}
      />
    </div>
  ) : null;

  const houseBlock = (
    <div ref={houseMeasureRef} className="relative flex flex-col items-center">
      <InkHouse
        phase={phase === "playing" ? "open" : phase}
        onActivate={handleActivate}
        onBellComplete={handleBellComplete}
        reducedMotion={reducedMotion}
        isCatOnShelf={isCatOnShelf}
        onCatClick={toggleCatOnShelf}
      />

      <p
        className={`mt-1 max-w-[170px] text-center font-serif text-[11px] leading-tight text-[var(--color-green)]/80 ${
          phase === "idle" ? "" : "invisible"
        }`}
        aria-hidden={phase !== "idle"}
      >
        {isCatOnShelf ? t("ink.hintOnShelf") : t("ink.hint")}
      </p>
    </div>
  );

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
        className={`pointer-events-none fixed bottom-6 right-0 z-40 hidden md:block lg:right-0 ${
          phase === "playing" ? "invisible" : ""
        }`}
        aria-live="polite"
      >
        {stackChat && chatOpen ? (
          <div className="pointer-events-auto flex flex-col items-end gap-2">
            {chatPanel}
            <div className="flex items-end gap-2 lg:gap-3">
              {catFigure}
              {houseBlock}
            </div>
          </div>
        ) : (
          <div className="pointer-events-auto flex items-end gap-2 lg:gap-3">
            {chatPanel}
            {catFigure}
            {houseBlock}
          </div>
        )}
      </div>
    </>
  );
}
