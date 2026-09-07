"use client";

import { useEffect, useRef, useState } from "react";

type UseSpriteAnimationOptions = {
  frames: readonly string[];
  active: boolean;
  frameMs?: number;
  loops?: number;
  onComplete?: () => void;
};

/**
 * Cycles through sprite frame URLs while `active` is true.
 * When loops finish (or frames are empty), calls onComplete once.
 */
export function useSpriteAnimation({
  frames,
  active,
  frameMs = 90,
  loops = 1,
  onComplete,
}: UseSpriteAnimationOptions) {
  const [frameIndex, setFrameIndex] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!active || frames.length === 0) {
      setFrameIndex(0);
      return;
    }

    let cancelled = false;
    let index = 0;
    let loopCount = 0;
    setFrameIndex(0);

    const id = window.setInterval(() => {
      if (cancelled) return;
      index += 1;
      if (index >= frames.length) {
        loopCount += 1;
        if (loopCount >= loops) {
          window.clearInterval(id);
          onCompleteRef.current?.();
          return;
        }
        index = 0;
      }
      setFrameIndex(index);
    }, frameMs);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [active, frames, frameMs, loops]);

  return active && frames.length > 0 ? frames[frameIndex] : frames[0] ?? "";
}
