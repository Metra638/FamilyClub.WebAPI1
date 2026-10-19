export const INK_ASSETS = {
  inHouse: "/images/Ink/InkInHouse.png",
  /** House while hovering the bell */
  inHouseOnBell: "/images/Ink/InkInHouse-onBell.png",
  /** House with cat but without the static bell — for ringing overlay */
  inHouseRinging: "/images/Ink/InkInHouseRinging.png",
  outOfHouse: "/images/Ink/InkOutOfHouse.png",
  lying: "/images/Ink/lying.png",
  /** Calm sit facing the viewer (after leaving the house) */
  sit: "/images/Ink/reply0001.png",
  /** Sit while the user is typing a request */
  waitingRequest: "/images/Ink/waiting-request0000.png",
  /** Alternate while Ink thinks about a reply */
  thinking: [
    "/images/Ink/thinking0000.png",
    "/images/Ink/thinking0001.png",
  ],
  ringingBell: [
    "/images/Ink/RingingBell/1.png",
    "/images/Ink/RingingBell/2.png",
    "/images/Ink/RingingBell/3.png",
    "/images/Ink/RingingBell/4.png",
  ],
  jumpUp: [
    "/images/Ink/jump-up0001.png",
    "/images/Ink/jump-up0002.png",
    "/images/Ink/jump-up0003.png",
  ],
  jumpDown: [
    "/images/Ink/jump-down0000.png",
    "/images/Ink/jump-down0001.png",
    "/images/Ink/jump-down0002.png",
    "/images/Ink/jump-down0003.png",
    "/images/Ink/jump-down0004.png",
  ],
  /** Full leap for the play game: crouch-up → air → land */
  jumpLeap: [
    "/images/Ink/jump-up0001.png",
    "/images/Ink/jump-up0002.png",
    "/images/Ink/jump-up0003.png",
    "/images/Ink/jump-down0000.png",
    "/images/Ink/jump-down0001.png",
    "/images/Ink/jump-down0002.png",
    "/images/Ink/jump-down0003.png",
    "/images/Ink/jump-down0004.png",
  ],
  walk: [
    "/images/Ink/walk0000.png",
    "/images/Ink/walk0001.png",
    "/images/Ink/walk0002.png",
    "/images/Ink/walk0003.png",
  ],
  /** Full reply sheet — sit → write */
  reply: [
    "/images/Ink/reply0000.png",
    "/images/Ink/reply0001.png",
    "/images/Ink/reply0002.png",
    "/images/Ink/reply0003.png",
    "/images/Ink/reply0004.png",
    "/images/Ink/reply0005.png",
    "/images/Ink/reply0006.png",
    "/images/Ink/reply0007.png",
  ],
  /** Writing loop while Ink types a reply */
  replyWrite: [
    "/images/Ink/reply0004.png",
    "/images/Ink/reply0005.png",
    "/images/Ink/reply0006.png",
    "/images/Ink/reply0007.png",
    "/images/Ink/reply0006.png",
    "/images/Ink/reply0005.png",
  ],
  game: {
    mouse: "/images/Ink/game/ink-game-mouse.png",
    catHappy: "/images/Ink/game/ink-game-cat-happy.png",
    catWithMouse: "/images/Ink/game/ink-game-cat-with-mouse.png",
  },
} as const;

export type InkPhase = "idle" | "ringing" | "emerging" | "open" | "playing";
export type InkPreyKind = "laser" | "mouse";
