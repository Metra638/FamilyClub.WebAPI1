"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "@/lib/i18n/LocaleProvider";
import { INK_ASSETS, type InkPreyKind } from "../inkAssets";

type GamePhase = "playing" | "catching" | "done";
type MoveMode = "walk" | "prepare" | "jump";

type InkPlayGameProps = {
  onExit: () => void;
  onPlayAgain: () => void;
};

/** Current feel = max; typical play is up to 2× slower and randomized each round */
const WALK_SPEED_MAX = 0.11;
const WALK_SPEED_MIN = WALK_SPEED_MAX / 2;
const JUMP_SPEED_MAX = 0.72;
const JUMP_SPEED_MIN = JUMP_SPEED_MAX / 2;
const JUMP_TRIGGER_DIST = 175;
const CATCH_DIST = 52;
const JUMP_COOLDOWN_MS = 1400;
const PREPARE_MS = 580;
const JUMP_MS = 480;
const CAT_W = 280;
const CAT_H = 220;
const CAT_DONE_W = 360;
const CAT_DONE_H = 360;

function pickPrey(): InkPreyKind {
  return Math.random() < 0.5 ? "laser" : "mouse";
}

function pickDurationMs() {
  const minutes = 1 + Math.floor(Math.random() * 5);
  return { minutes, ms: minutes * 60_000 };
}

function pickBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function formatTime(msLeft: number) {
  const total = Math.max(0, Math.ceil(msLeft / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function InkPlayGame({ onExit, onPlayAgain }: InkPlayGameProps) {
  const t = useTranslations();
  const [prey] = useState<InkPreyKind>(() => pickPrey());
  const [duration] = useState(() => pickDurationMs());
  const [phase, setPhase] = useState<GamePhase>("playing");
  const [msLeft, setMsLeft] = useState(duration.ms);
  const [walkFrame, setWalkFrame] = useState(0);
  const [jumpFrame, setJumpFrame] = useState(0);
  const [moveMode, setMoveMode] = useState<MoveMode>("walk");
  const [facingLeft, setFacingLeft] = useState(true);

  const preyPos = useRef({
    x: typeof window !== "undefined" ? window.innerWidth / 2 : 400,
    y: typeof window !== "undefined" ? window.innerHeight / 2 : 300,
  });
  const catPos = useRef({ x: 160, y: 180 });
  const frozenPrey = useRef<{ x: number; y: number } | null>(null);
  const phaseRef = useRef<GamePhase>("playing");
  const moveModeRef = useRef<MoveMode>("walk");
  const jumpUntilRef = useRef(0);
  const prepareUntilRef = useRef(0);
  const jumpCooldownUntilRef = useRef(0);
  const walkSpeedRef = useRef(pickBetween(WALK_SPEED_MIN, WALK_SPEED_MAX));
  const jumpSpeedRef = useRef(pickBetween(JUMP_SPEED_MIN, JUMP_SPEED_MAX));
  const endAtRef = useRef(Date.now() + duration.ms);
  const [, setTick] = useState(0);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    moveModeRef.current = moveMode;
  }, [moveMode]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (phaseRef.current !== "playing") return;
      preyPos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onExit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onExit]);

  useEffect(() => {
    if (phase !== "playing") return;
    const id = window.setInterval(() => {
      const left = endAtRef.current - Date.now();
      setMsLeft(left);
      if (left <= 0) {
        frozenPrey.current = { ...preyPos.current };
        setPhase("catching");
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [phase]);

  const startCatch = (at: { x: number; y: number }) => {
    if (phaseRef.current === "done" || phaseRef.current === "catching") return;
    frozenPrey.current = { ...at };
    phaseRef.current = "catching";
    moveModeRef.current = "jump";
    setMoveMode("jump");
    setPhase("catching");
  };

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let frameAcc = 0;

    const loop = (now: number) => {
      const dt = Math.min(32, now - last);
      last = now;
      const cat = catPos.current;
      const target =
        (phaseRef.current === "catching" || phaseRef.current === "done") &&
        frozenPrey.current
          ? frozenPrey.current
          : preyPos.current;

      const dx = target.x - cat.x;
      const dy = target.y - cat.y;
      const dist = Math.hypot(dx, dy) || 1;

      if (phaseRef.current === "playing") {
        if (
          moveModeRef.current === "walk" &&
          dist < JUMP_TRIGGER_DIST &&
          now >= jumpCooldownUntilRef.current
        ) {
          moveModeRef.current = "prepare";
          setMoveMode("prepare");
          prepareUntilRef.current = now + PREPARE_MS;
          jumpSpeedRef.current = pickBetween(JUMP_SPEED_MIN, JUMP_SPEED_MAX);
          setJumpFrame(0);
        }

        if (moveModeRef.current === "prepare") {
          const stalk = walkSpeedRef.current * 0.25;
          cat.x += dx * stalk * (dt / 16);
          cat.y += dy * stalk * (dt / 16);
          if (Math.abs(dx) > 2) setFacingLeft(dx < 0);

          if (now >= prepareUntilRef.current) {
            moveModeRef.current = "jump";
            setMoveMode("jump");
            jumpUntilRef.current = now + JUMP_MS;
            setJumpFrame(0);
          }
        } else if (moveModeRef.current === "jump") {
          const speed = jumpSpeedRef.current;
          cat.x += dx * speed * (dt / 16);
          cat.y += dy * speed * (dt / 16);
          if (Math.abs(dx) > 2) setFacingLeft(dx < 0);

          frameAcc += dt;
          if (frameAcc > 100) {
            frameAcc = 0;
            setJumpFrame((f) => (f + 1) % INK_ASSETS.game.jump.length);
          }
          if (dist < CATCH_DIST) {
            startCatch(preyPos.current);
          } else if (now >= jumpUntilRef.current) {
            moveModeRef.current = "walk";
            setMoveMode("walk");
            jumpCooldownUntilRef.current = now + JUMP_COOLDOWN_MS;
            walkSpeedRef.current = pickBetween(WALK_SPEED_MIN, WALK_SPEED_MAX);
          }
        } else {
          const speed = walkSpeedRef.current;
          cat.x += dx * speed * (dt / 16);
          cat.y += dy * speed * (dt / 16);
          if (Math.abs(dx) > 2) setFacingLeft(dx < 0);

          if (dist > 10) {
            frameAcc += dt;
            if (frameAcc > 110) {
              frameAcc = 0;
              setWalkFrame((f) => (f + 1) % INK_ASSETS.walk.length);
            }
          }
        }
      } else if (phaseRef.current === "catching") {
        const speed = 0.6;
        cat.x += dx * speed * (dt / 16);
        cat.y += dy * speed * (dt / 16);
        if (Math.abs(dx) > 2) setFacingLeft(dx < 0);
        frameAcc += dt;
        if (frameAcc > 90) {
          frameAcc = 0;
          setJumpFrame((f) => (f + 1) % INK_ASSETS.game.jump.length);
        }
        if (dist < CATCH_DIST && phaseRef.current === "catching") {
          phaseRef.current = "done";
          setPhase("done");
        }
      }

      setTick((tick) => tick + 1);
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- game loop once per mount
  }, []);

  const showPrey = phase === "playing" || phase === "catching";
  const preyPoint =
    (phase === "catching" || phase === "done") && frozenPrey.current
      ? frozenPrey.current
      : preyPos.current;

  const catSrc =
    phase === "done"
      ? prey === "mouse"
        ? INK_ASSETS.game.catWithMouse
        : INK_ASSETS.game.catHappy
      : moveMode === "jump" || phase === "catching"
        ? INK_ASSETS.game.jump[jumpFrame]
        : moveMode === "prepare"
          ? INK_ASSETS.game.jump[0]
          : INK_ASSETS.walk[walkFrame];

  const cat = catPos.current;
  const catW = phase === "done" ? CAT_DONE_W : CAT_W;
  const catH = phase === "done" ? CAT_DONE_H : CAT_H;
  const face = facingLeft ? 1 : -1;
  const crouch =
    moveMode === "prepare"
      ? `scaleX(${face * 1.12}) scaleY(0.78)`
      : `scaleX(${face})`;

  const statusText =
    phase === "playing"
      ? t("ink.game.statusPlaying")
          .replace("{time}", formatTime(msLeft))
          .replace("{minutes}", String(duration.minutes))
          .replace(
            "{prey}",
            prey === "laser" ? t("ink.game.preyLaser") : t("ink.game.preyMouse"),
          )
          .replace(
            "{prepare}",
            moveMode === "prepare" ? t("ink.game.prepareSuffix") : "",
          )
      : phase === "catching"
        ? t("ink.game.catching")
        : t("ink.game.ended");

  return (
    <div
      className="fixed inset-0 z-[60] hidden md:block"
      style={{ cursor: phase === "playing" ? "none" : "auto" }}
      role="dialog"
      aria-label={t("ink.game.aria")}
    >
      <div className="absolute inset-0 bg-black/10" />

      <div className="pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full bg-[#005B33]/90 px-4 py-1.5 font-serif text-sm text-white shadow-md">
        {statusText}
      </div>

      {showPrey && (
        <div
          className="pointer-events-none absolute z-20"
          style={{
            left: preyPoint.x,
            top: preyPoint.y,
            transform: "translate(-50%, -50%)",
          }}
        >
          {prey === "laser" ? (
            <span
              className="block h-3.5 w-3.5 rounded-full bg-red-500 shadow-[0_0_10px_4px_rgba(255,40,40,0.85)]"
              aria-hidden
            />
          ) : (
            <img
              src={INK_ASSETS.game.mouse}
              alt=""
              aria-hidden
              className="h-12 w-auto object-contain drop-shadow"
              draggable={false}
            />
          )}
        </div>
      )}

      <div
        className={`pointer-events-none absolute z-30 ${moveMode === "prepare" ? "ink-cat-prepare" : ""}`}
        style={{
          left: cat.x,
          top: cat.y,
          transform: `translate(-50%, -50%) ${crouch}`,
          width: catW,
          height: catH,
          transition: moveMode === "prepare" ? "transform 0.15s ease-out" : undefined,
        }}
      >
        <img
          src={catSrc}
          alt="Ink"
          className="h-full w-full object-contain drop-shadow-lg"
          draggable={false}
        />
      </div>

      {phase === "done" && (
        <div className="absolute left-1/2 top-1/2 z-40 w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-[14px] border border-[#005B33]/25 bg-[#F5F3EE] p-5 text-center shadow-[0_12px_40px_rgba(36,36,36,0.35)]">
          <p className="font-serif text-lg font-semibold text-[#005B33]">
            {t("ink.game.thanks")}
          </p>
          <p className="mt-2 text-sm leading-snug text-[#242424]">
            {prey === "mouse"
              ? t("ink.game.caughtMouse")
              : t("ink.game.caughtLaser")}
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <button
              type="button"
              onClick={onPlayAgain}
              className="rounded-[8px] bg-[#005B33] px-4 py-2 text-sm font-semibold text-white hover:bg-[#004d2b]"
            >
              {t("ink.game.playAgain")}
            </button>
            <button
              type="button"
              onClick={onExit}
              className="rounded-[8px] border border-[#005B33]/40 bg-white px-4 py-2 text-sm font-semibold text-[#005B33] hover:bg-[#E8F5EF]"
            >
              {t("ink.game.exit")}
            </button>
          </div>
        </div>
      )}

      {phase !== "done" && (
        <div className="absolute bottom-6 left-1/2 z-40 -translate-x-1/2">
          <button
            type="button"
            onClick={onExit}
            className="rounded-full border border-white/40 bg-[#242424]/80 px-5 py-2 text-sm font-medium text-white shadow-md backdrop-blur-sm hover:bg-[#242424]"
          >
            {t("ink.game.exitEsc")}
          </button>
        </div>
      )}
    </div>
  );
}
