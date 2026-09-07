"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  useLocalizedPath,
  useTranslations,
} from "@/lib/i18n/LocaleProvider";

type ChatMessage = {
  id: string;
  from: "ink" | "user";
  text: string;
};

type QuickReply = {
  id: string;
  label: string;
  reply: string;
  href?: string;
  action?: "play";
};

type InkChatPanelProps = {
  onClose: () => void;
  onPlayGame?: () => void;
};

function matchReply(input: string, t: (key: string) => string): string {
  const q = input.toLowerCase().trim();
  if (!q) return t("ink.match.empty");
  if (/(гра|пограт|полюван|лазер|мишк|play|game|laser|mouse)/i.test(q)) {
    return t("ink.match.play");
  }
  if (/(привіт|вітаю|hello|hi|здраст|hey)/i.test(q)) {
    return t("ink.match.hello");
  }
  if (/(рекоменд|порекоменд|що почита|recommend|suggest)/i.test(q)) {
    return t("ink.match.recommend");
  }
  if (/(книг|підібр|read|book|find)/i.test(q)) {
    return t("ink.match.book");
  }
  if (/(підтримк|скарг|допомог|support|контакт|зв.?язат|help|contact)/i.test(q)) {
    return t("ink.match.support");
  }
  if (/(акці|знижк|промо|promo|deal|discount)/i.test(q)) {
    return t("ink.match.promos");
  }
  if (/(доставк|оплат|нова пошта|payment|delivery)/i.test(q)) {
    return t("ink.match.payment");
  }
  if (/(каталог|жанр|автор|shop|product|catalog)/i.test(q)) {
    return t("ink.match.catalog");
  }
  if (/(хто ти|що ти|інк|ink|помічник|who are you|assistant)/i.test(q)) {
    return t("ink.match.who");
  }
  if (/(дякую|thanks|спасиб|thank)/i.test(q)) {
    return t("ink.match.thanks");
  }
  return t("ink.match.fallback");
}

export default function InkChatPanel({ onClose, onPlayGame }: InkChatPanelProps) {
  const t = useTranslations();
  const lp = useLocalizedPath();
  const welcome = t("ink.welcome");

  const quickReplies = useMemo<QuickReply[]>(
    () => [
      {
        id: "play",
        label: t("ink.quick.playLabel"),
        reply: t("ink.quick.playReply"),
        action: "play",
      },
      {
        id: "recommend",
        label: t("ink.quick.recommendLabel"),
        reply: t("ink.quick.recommendReply"),
        href: lp("/pick-book"),
      },
      {
        id: "pickBook",
        label: t("ink.quick.pickBookLabel"),
        reply: t("ink.quick.pickBookReply"),
        href: lp("/pick-book"),
      },
      {
        id: "catalog",
        label: t("ink.quick.catalogLabel"),
        reply: t("ink.quick.catalogReply"),
        href: lp("/products"),
      },
      {
        id: "support",
        label: t("ink.quick.supportLabel"),
        reply: t("ink.quick.supportReply"),
        href: lp("/complaints"),
      },
      {
        id: "promos",
        label: t("ink.quick.promosLabel"),
        reply: t("ink.quick.promosReply"),
        href: lp("/promotions"),
      },
      {
        id: "payment",
        label: t("ink.quick.paymentLabel"),
        reply: t("ink.quick.paymentReply"),
        href: lp("/payment-delivery"),
      },
      {
        id: "who",
        label: t("ink.quick.whoLabel"),
        reply: t("ink.quick.whoReply"),
      },
    ],
    [lp, t],
  );

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", from: "ink", text: welcome },
  ]);
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{ id: "welcome", from: "ink", text: welcome }]);
  }, [welcome]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const pushInk = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `ink-${Date.now()}-${prev.length}`, from: "ink", text },
    ]);
  };

  const pushUser = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}-${prev.length}`, from: "user", text },
    ]);
  };

  const handleQuick = (item: QuickReply) => {
    pushUser(item.label);
    window.setTimeout(() => {
      pushInk(item.reply);
      if (item.action === "play") {
        window.setTimeout(() => onPlayGame?.(), 500);
      }
    }, 280);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    pushUser(text);
    setDraft("");
    window.setTimeout(() => pushInk(matchReply(text, t)), 320);
  };

  return (
    <div
      role="dialog"
      aria-label={t("ink.dialogAria")}
      className="ink-panel-in flex w-[300px] flex-col overflow-hidden rounded-[12px] border border-[#005B33]/30 bg-[#F5F3EE] shadow-[0_8px_28px_rgba(36,36,36,0.28)]"
    >
      <div className="flex items-center justify-between bg-[#005B33] px-3 py-2 text-white">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#F5C542]" aria-hidden />
          <p className="font-serif text-sm font-semibold tracking-wide">Ink</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("ink.closeAria")}
          className="rounded px-2 py-0.5 text-lg leading-none text-white/90 transition-colors hover:bg-white/15 hover:text-white"
        >
          ×
        </button>
      </div>

      <div
        ref={listRef}
        className="flex max-h-[220px] flex-col gap-2 overflow-y-auto px-3 py-3"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[90%] rounded-[10px] px-2.5 py-1.5 text-[13px] leading-snug ${
              m.from === "ink"
                ? "self-start bg-white text-[#242424] shadow-sm"
                : "self-end bg-[#E8F5EF] text-[#005B33]"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5 border-t border-[#005B33]/15 px-3 py-2">
        {quickReplies.map((item) =>
          item.href ? (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => handleQuick(item)}
              className="rounded-full border border-[#005B33]/35 bg-white px-2.5 py-1 text-[11px] font-medium text-[#005B33] transition-colors hover:border-[#005B33] hover:bg-[#E8F5EF]"
            >
              {item.label}
            </Link>
          ) : (
            <button
              key={item.id}
              type="button"
              onClick={() => handleQuick(item)}
              className="rounded-full border border-[#005B33]/35 bg-white px-2.5 py-1 text-[11px] font-medium text-[#005B33] transition-colors hover:border-[#005B33] hover:bg-[#E8F5EF]"
            >
              {item.label}
            </button>
          ),
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-1.5 border-t border-[#005B33]/15 px-2 py-2"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t("ink.placeholder")}
          aria-label={t("ink.messageAria")}
          className="min-w-0 flex-1 rounded-[8px] border border-gray-300 bg-white px-2.5 py-1.5 text-[13px] text-[#242424] outline-none focus:border-[#005B33]"
        />
        <button
          type="submit"
          className="rounded-[8px] bg-[#005B33] px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#004d2b]"
        >
          {t("ink.send")}
        </button>
      </form>
    </div>
  );
}
