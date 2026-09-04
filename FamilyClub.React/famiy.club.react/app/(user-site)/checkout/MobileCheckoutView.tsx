"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { DeliveryProvider, DeliveryType, PaymentMethod } from "./page";

export type MobileCheckoutViewProps = {
  loading: boolean;
  cartItems: any[];
  success: boolean;
  hasPhysicalItems: boolean;

  firstName: string;
  setFirstName: (val: string) => void;
  lastName: string;
  setLastName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;

  deliveryProvider: DeliveryProvider;
  setDeliveryProvider: (val: DeliveryProvider) => void;
  deliveryType: DeliveryType;
  setDeliveryType: (val: DeliveryType) => void;
  city: string;
  setCity: (val: string) => void;
  branch: string;
  setBranch: (val: string) => void;

  paymentMethod: PaymentMethod;
  setPaymentMethod: (val: PaymentMethod) => void;

  comment: string;
  setComment: (val: string) => void;

  subtotal: number;
  discount: number;
  deliveryCost: number;
  total: number;
  agreed: boolean;
  setAgreed: (val: boolean) => void;
  promoCode: string;
  setPromoCode: (val: string) => void;
  isFormValid: boolean;
  submitting: boolean;
  handleSubmit: () => Promise<void> | void;
  formatPrice: (value: number) => string;
};

// SVG Chevron Down
function ChevronDownIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#242424] shrink-0">
      <path d="M7 10l5 5 5-5H7z" fill="currentColor" />
    </svg>
  );
}

// SVG Radio Button component matching Figma
function RadioBtn({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`size-[36px] rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors shrink-0 ${
        active ? "border-[#005b33]" : "border-[#242424]/70"
      }`}
      role="radio"
      aria-checked={active}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
    >
      {active && <div className="size-[20px] rounded-full bg-[#005b33]" />}
    </div>
  );
}

// Sub Radio Button (slightly smaller for branch/postbox)
function SubRadioBtn({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`size-[28px] rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors shrink-0 ${
        active ? "border-[#005b33]" : "border-[#242424]/70"
      }`}
      role="radio"
      aria-checked={active}
      tabIndex={0}
    >
      {active && <div className="size-[14px] rounded-full bg-[#005b33]" />}
    </div>
  );
}

export default function MobileCheckoutView({
  loading,
  cartItems,
  success,
  hasPhysicalItems,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  email,
  setEmail,
  phone,
  setPhone,
  deliveryProvider,
  setDeliveryProvider,
  deliveryType,
  setDeliveryType,
  city,
  setCity,
  branch,
  setBranch,
  paymentMethod,
  setPaymentMethod,
  comment,
  setComment,
  subtotal,
  discount,
  deliveryCost,
  total,
  agreed,
  setAgreed,
  promoCode,
  setPromoCode,
  isFormValid,
  submitting,
  handleSubmit,
  formatPrice,
}: MobileCheckoutViewProps) {
  const router = useRouter();

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#c7a381] py-6 px-4 font-['Source_Sans_Pro',sans-serif] flex flex-col items-center">
        <h1 className="font-['Lora',serif] font-semibold text-[#242424] text-[24px] text-center my-4">
          Оформлення замовлення
        </h1>
        <div className="bg-[#f5f3ee] rounded-[20px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.25)] p-8 text-center text-[#242424] text-[20px] w-full max-w-[412px] my-auto">
          ⏳ Завантаження...
        </div>
      </div>
    );
  }

  // Empty Cart State
  if (cartItems.length === 0 && !success) {
    return (
      <div className="min-h-screen bg-[#c7a381] py-6 px-4 font-['Source_Sans_Pro',sans-serif] flex flex-col items-center">
        <div className="w-full max-w-[412px] flex items-center gap-4 my-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="size-[40px] rounded-full bg-[#f5f3ee]/50 flex items-center justify-center text-[20px] text-[#242424] hover:bg-[#f5f3ee] active:scale-95 transition-all shrink-0"
            aria-label="Назад"
          >
            ←
          </button>
          <h1 className="font-['Lora',serif] font-semibold text-[#242424] text-[24px] text-center flex-1 pr-10">
            Оформлення замовлення
          </h1>
        </div>
        <div className="bg-[#f5f3ee] rounded-[20px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.25)] p-8 text-center flex flex-col items-center gap-4 w-full max-w-[412px] my-auto">
          <span className="text-[48px]">🛒</span>
          <p className="text-[#242424] text-[20px] leading-snug font-medium">
            Ваш кошик порожній. Додайте товари перед оформленням.
          </p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="bg-[#005b33] text-white font-semibold px-6 py-3 rounded-[9px] text-[18px] shadow hover:bg-[#004828] active:scale-95 transition-all mt-2"
          >
            На головну
          </button>
        </div>
      </div>
    );
  }

  // Success State
  if (success) {
    return (
      <div className="min-h-screen bg-[#c7a381] py-6 px-4 font-['Source_Sans_Pro',sans-serif] flex flex-col items-center justify-center">
        <div className="bg-[#f5f3ee] rounded-[25px] shadow-[0px_0px_20px_0px_rgba(0,0,0,0.3)] p-8 text-center flex flex-col items-center gap-5 w-full max-w-[412px]">
          <div className="size-[70px] rounded-full bg-[#005b33]/15 flex items-center justify-center text-[36px]">
            ✅
          </div>
          <h2 className="font-['Lora',serif] font-bold text-[#242424] text-[26px]">
            Замовлення оформлено!
          </h2>
          <p className="text-[#242424]/80 text-[18px] leading-relaxed">
            Дякуємо за замовлення! Товар додано у розділ «Мої замовлення».
          </p>
          <button
            type="button"
            onClick={() => router.push("/orders")}
            className="bg-[#005b33] text-white font-semibold w-full py-3.5 rounded-[9px] text-[18px] shadow hover:bg-[#004828] active:scale-95 transition-all mt-2"
          >
            Перейти в Мої замовлення
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="bg-[#E5E0D5] text-[#242424] font-semibold w-full py-3.5 rounded-[9px] text-[18px] hover:bg-[#D8D2C5] active:scale-95 transition-all"
          >
            На головну
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#c7a381] pt-[110px] pb-[140px] px-3 sm:px-4 font-['Source_Sans_Pro',sans-serif] flex flex-col items-center text-[#242424]">
      {/* Title */}
      <h1 className="font-['Lora',serif] font-semibold text-[#242424] text-[24px] text-center mb-6 mt-2">
        Оформлення замовлення
      </h1>

      <div className="w-full max-w-[412px] flex flex-col gap-6">
        {/* ── Card 1: Особисті данні ── */}
        <div className="bg-[#f5f3ee] rounded-[20px] p-5 sm:p-6 shadow-[0px_0px_10px_0px_rgba(0,0,0,0.25)] flex flex-col gap-5">
          <h2 className="text-[24px] font-semibold text-[#242424] leading-tight tracking-[-0.264px]">
            Особисті данні
          </h2>
          <div className="flex flex-col gap-4">
            <div className="bg-[#f5f3ee] h-[65px] rounded-[9px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.25)] flex items-center px-5 sm:px-6">
              <input
                type="text"
                placeholder="Ім’я *"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-transparent text-[20px] text-[#242424] placeholder:text-[#242424]/70 focus:outline-none"
              />
            </div>

            <div className="bg-[#f5f3ee] h-[65px] rounded-[9px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.25)] flex items-center px-5 sm:px-6">
              <input
                type="text"
                placeholder="Прізвище *"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-transparent text-[20px] text-[#242424] placeholder:text-[#242424]/70 focus:outline-none"
              />
            </div>

            <div className="bg-[#f5f3ee] h-[65px] rounded-[9px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.25)] flex items-center px-5 sm:px-6">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-[20px] text-[#242424] placeholder:text-[#242424]/70 focus:outline-none"
              />
            </div>

            <div className="bg-[#f5f3ee] h-[65px] rounded-[9px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.25)] flex items-center justify-between px-5 sm:px-6">
              <input
                type="tel"
                placeholder="+ 380 800 555 35 35"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-transparent text-[20px] text-[#242424] placeholder:text-[#242424]/70 focus:outline-none"
              />
              <ChevronDownIcon />
            </div>
          </div>
        </div>

        {/* ── Card 2: Доставка (only for physical items) ── */}
        {hasPhysicalItems && (
          <div className="bg-[#f5f3ee] rounded-[20px] p-5 sm:p-6 shadow-[0px_0px_10px_0px_rgba(0,0,0,0.25)] flex flex-col">
            <h2 className="text-[24px] font-semibold text-[#242424] leading-tight tracking-[-0.44px] mb-5 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
              <span>Доставка</span>
              <span className="font-normal text-[14px] text-[#242424]/50">
                (якщо у вас на замовлення паперова книга)
              </span>
            </h2>

            <div className="flex flex-col">
              {/* Nova Poshta Option */}
              <div
                onClick={() => setDeliveryProvider("nova_poshta")}
                className="py-3 flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <RadioBtn
                    active={deliveryProvider === "nova_poshta"}
                    onClick={() => setDeliveryProvider("nova_poshta")}
                  />
                  <div className="flex flex-col leading-snug">
                    <span className="text-[20px] font-semibold text-[#242424]">Нова пошта</span>
                    <span className="text-[14px] text-[#242424]">
                      <span className="text-[#242424]/50">Термін: </span>2-4 робочі дні
                    </span>
                  </div>
                </div>
                {/* Logo badge */}
                <div className="bg-[#ee3338] text-white px-2.5 py-1 rounded font-bold text-[13px] tracking-wider shadow-sm shrink-0">
                  НОВА ПОШТА
                </div>
              </div>

              {/* Sub-options if Nova Poshta selected */}
              {deliveryProvider === "nova_poshta" && (
                <div className="pl-3 sm:pl-4 pt-2 pb-4 flex flex-col gap-4 border-l-2 border-[#005b33]/20 ml-4 my-2">
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                    <div
                      onClick={() => setDeliveryType("branch")}
                      className="flex items-center gap-2.5 cursor-pointer"
                    >
                      <SubRadioBtn
                        active={deliveryType === "branch"}
                        onClick={() => setDeliveryType("branch")}
                      />
                      <div className="flex flex-col leading-tight">
                        <span className="text-[18px] sm:text-[20px] font-semibold text-[#242424]">Відділення</span>
                        <span className="text-[13px] text-[#242424]/70">Вартість 75 грн</span>
                      </div>
                    </div>

                    <div
                      onClick={() => setDeliveryType("postbox")}
                      className="flex items-center gap-2.5 cursor-pointer"
                    >
                      <SubRadioBtn
                        active={deliveryType === "postbox"}
                        onClick={() => setDeliveryType("postbox")}
                      />
                      <div className="flex flex-col leading-tight">
                        <span className="text-[18px] sm:text-[20px] font-semibold text-[#242424]">Поштомат</span>
                        <span className="text-[13px] text-[#242424]/70">Вартість 70 грн</span>
                      </div>
                    </div>
                  </div>

                  {/* City + Branch Input Boxes */}
                  <div className="flex flex-col gap-3 mt-1">
                    <div className="bg-[#f5f3ee] h-[65px] rounded-[9px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.25)] flex items-center justify-between px-5">
                      <input
                        type="text"
                        placeholder="Оберіть населений пункт *"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-transparent text-[18px] sm:text-[20px] text-[#242424] placeholder:text-[#242424]/70 focus:outline-none"
                      />
                      <ChevronDownIcon />
                    </div>

                    <div className="bg-[#f5f3ee] h-[65px] rounded-[9px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.25)] flex items-center justify-between px-5">
                      <input
                        type="text"
                        placeholder="Відділення Нової пошти *"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full bg-transparent text-[18px] sm:text-[20px] text-[#242424] placeholder:text-[#242424]/70 focus:outline-none"
                      />
                      <ChevronDownIcon />
                    </div>
                  </div>
                </div>
              )}

              <hr className="border-t border-[#242424]/15 my-2" />

              {/* Ukr Poshta Option */}
              <div
                onClick={() => setDeliveryProvider("ukr_poshta")}
                className="py-3 flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <RadioBtn
                    active={deliveryProvider === "ukr_poshta"}
                    onClick={() => setDeliveryProvider("ukr_poshta")}
                  />
                  <div className="flex flex-col leading-snug">
                    <span className="text-[20px] font-semibold text-[#242424]">Укр пошта</span>
                    <span className="text-[14px] text-[#242424]">
                      <span className="text-[#242424]/50">Термін: </span>3-7 робочі дні
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-[#ffcc00] text-[#242424] font-bold px-2.5 py-1 rounded text-[13px] tracking-wide shadow-sm shrink-0">
                  <span className="text-[#00529b]">📍</span> УКРПОШТА
                </div>
              </div>

              <hr className="border-t border-[#242424]/15 my-2" />

              {/* Meest Option */}
              <div
                onClick={() => setDeliveryProvider("meest")}
                className="py-3 flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <RadioBtn
                    active={deliveryProvider === "meest"}
                    onClick={() => setDeliveryProvider("meest")}
                  />
                  <div className="flex flex-col leading-snug">
                    <span className="text-[20px] font-semibold text-[#242424]">Meest</span>
                    <span className="text-[14px] text-[#242424]">
                      <span className="text-[#242424]/50">Термін: </span>2-4 робочі дні
                    </span>
                  </div>
                </div>
                <div className="bg-[#0066b3] text-white font-extrabold italic px-3 py-1 rounded text-[14px] tracking-wide shadow-sm shrink-0">
                  Meest<span className="text-[#ee3338] not-italic ml-0.5">›</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Card 3: Спосіб оплати ── */}
        <div className="bg-[#f5f3ee] rounded-[20px] p-5 sm:p-6 shadow-[0px_0px_10px_0px_rgba(0,0,0,0.25)] flex flex-col">
          <h2 className="text-[24px] font-semibold text-[#242424] mb-3 leading-tight">
            Спосіб оплати
          </h2>

          <div className="flex flex-col">
            {/* Card Online */}
            <div
              onClick={() => setPaymentMethod("card_online")}
              className="py-3.5 flex items-center justify-between gap-3 cursor-pointer border-b border-[#242424]/15"
            >
              <div className="flex items-center gap-3 min-w-0">
                <RadioBtn
                  active={paymentMethod === "card_online"}
                  onClick={() => setPaymentMethod("card_online")}
                />
                <span className="text-[17px] sm:text-[18px] font-semibold text-[#242424] leading-snug">
                  Оплата карткою онлайн
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-extrabold text-[15px] text-[#1a1f71] italic tracking-tight">VISA</span>
                <div className="flex -space-x-1.5 items-center">
                  <div className="size-[15px] rounded-full bg-[#eb001b]/90" />
                  <div className="size-[15px] rounded-full bg-[#f79e1b]/90" />
                </div>
              </div>
            </div>

            {/* Card Dia */}
            <div
              onClick={() => setPaymentMethod("card_dia")}
              className="py-3.5 flex items-center justify-between gap-3 cursor-pointer border-b border-[#242424]/15"
            >
              <div className="flex items-center gap-3 min-w-0">
                <RadioBtn
                  active={paymentMethod === "card_dia"}
                  onClick={() => setPaymentMethod("card_dia")}
                />
                <span className="text-[17px] sm:text-[18px] font-semibold text-[#242424] leading-snug">
                  Оплата карткою онлайн ( Дія.Картка: єПідтримка, єКнига)
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-start sm:self-center mt-1 sm:mt-0">
                <span className="font-extrabold text-[15px] text-[#1a1f71] italic tracking-tight">VISA</span>
                <div className="flex -space-x-1.5 items-center">
                  <div className="size-[15px] rounded-full bg-[#eb001b]/90" />
                  <div className="size-[15px] rounded-full bg-[#f79e1b]/90" />
                </div>
              </div>
            </div>

            {/* Cash on Delivery */}
            <div
              onClick={() => setPaymentMethod("cash_on_delivery")}
              className="py-3.5 flex items-center justify-between gap-3 cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <RadioBtn
                  active={paymentMethod === "cash_on_delivery"}
                  onClick={() => setPaymentMethod("cash_on_delivery")}
                />
                <span className="text-[17px] sm:text-[18px] font-semibold text-[#242424] leading-snug">
                  Оплата під час отримання
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Card 4: Коментар до замовлення (only for physical items) ── */}
        {hasPhysicalItems && (
          <div className="bg-[#f5f3ee] rounded-[20px] p-5 sm:p-6 shadow-[0px_0px_10px_0px_rgba(0,0,0,0.25)] flex flex-col">
            <h2 className="text-[24px] font-semibold text-[#242424] mb-4 leading-tight">
              Коментар до замовлення
            </h2>

            <textarea
              placeholder="Ваш коментар..."
              maxLength={500}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="bg-[#f5f3ee] h-[200px] sm:h-[229px] w-full rounded-[15px] sm:rounded-[20px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.25)] p-5 text-[18px] text-[#242424] placeholder:text-[#242424]/50 focus:outline-none resize-none"
            />
            <span className="text-[14px] text-[#242424] text-right mt-2 font-medium">
              {comment.length}/500 символів
            </span>

            <div className="flex flex-col gap-3 mt-4">
              <button
                type="button"
                onClick={() => {}}
                className="bg-[#005b33] text-white h-[50px] rounded-[9px] px-5 flex items-center justify-start gap-4 font-semibold text-[20px] shadow-md hover:bg-[#004828] active:scale-95 transition-all w-full"
              >
                <span className="text-[22px]">✓</span>
                <span>Підтвердити</span>
              </button>

              <button
                type="button"
                onClick={() => setComment("")}
                className="border-2 border-[#005b33] text-[#005b33] h-[50px] rounded-[9px] px-5 flex items-center justify-start gap-4 font-semibold text-[20px] shadow-sm hover:bg-[#005b33]/10 active:scale-95 transition-all w-full"
              >
                <span className="text-[22px]">✕</span>
                <span>Скасувати</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Card 5: Summary Card ── */}
        <div className="bg-[#f5f3ee] rounded-t-[25px] sm:rounded-[25px] p-5 sm:p-6 shadow-[0px_0px_20px_0px_rgba(0,0,0,0.3)] flex flex-col gap-5 w-full mt-2">
          {/* Paw / Loyalty button */}
          <button
            type="button"
            className="bg-[#6c9a84] text-white rounded-[9px] py-3 px-4 font-semibold text-center w-full shadow-sm hover:opacity-95 active:scale-95 transition-all text-[16px] sm:text-[18px]"
          >
            Застосувати лапки до знижки
          </button>

          {/* Summary Lines */}
          <div className="flex flex-col gap-3.5 px-1">
            <div className="flex justify-between items-center text-[18px] sm:text-[20px]">
              <span className="text-[#242424]/50 font-normal">Сума:</span>
              <span className="text-[#242424] font-semibold">{formatPrice(subtotal)}</span>
            </div>

            <div className="flex justify-between items-center text-[18px] sm:text-[20px]">
              <span className="text-[#242424]/50 font-normal">Знижка:</span>
              <span className="text-[#c81e1e] font-semibold">
                {discount > 0 ? `- ${formatPrice(discount)}` : "0 грн"}
              </span>
            </div>

            <div className="flex justify-between items-center text-[18px] sm:text-[20px]">
              <span className="text-[#242424]/50 font-normal">Вартість доставки:</span>
              <span className="text-[#242424] font-semibold">
                {hasPhysicalItems ? formatPrice(deliveryCost) : "Безкоштовно"}
              </span>
            </div>

            <div className="flex justify-between items-center text-[20px] sm:text-[22px] pt-2">
              <span className="text-[#242424]/50 font-normal">Сума до сплати:</span>
              <span className="text-[#c81e1e] font-bold text-[24px] sm:text-[26px]">
                {formatPrice(total)}
              </span>
            </div>
          </div>

          <hr className="border-t border-[#242424]/15 my-1" />

          {/* Promo code */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[20px] font-semibold text-[#242424]">Є промокод?</span>
            <div className="bg-[#f5f3ee] h-[50px] rounded-[9px] shadow-[0px_0px_5px_rgba(0,0,0,0.25)] flex items-center px-5">
              <input
                type="text"
                placeholder="Промокод..."
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="w-full bg-transparent text-[18px] text-[#242424] placeholder:text-[#242424]/50 focus:outline-none"
              />
            </div>
          </div>

          {/* Checkbox agreement */}
          <div className="flex items-start gap-3 mt-3">
            <input
              type="checkbox"
              id="mobile-checkout-agreement-checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 size-5 accent-[#005b33] rounded cursor-pointer shrink-0"
            />
            <label
              htmlFor="mobile-checkout-agreement-checkbox"
              className="text-[15px] sm:text-[16px] text-[#242424] leading-snug cursor-pointer font-normal"
            >
              Погоджуюсь з{" "}
              <Link href="/privacy-policy" className="text-[#005b33] font-semibold hover:underline">
                Політикою конфіденційності
              </Link>{" "}
              та з{" "}
              <Link href="/terms-of-service" className="text-[#005b33] font-semibold hover:underline">
                Користувацькою угодою
              </Link>
            </label>
          </div>

          {/* Main Order Button */}
          <button
            type="button"
            disabled={!isFormValid || submitting}
            onClick={handleSubmit}
            className="bg-[#005b33] text-white text-[22px] font-semibold h-[56px] w-full rounded-[9px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.25)] flex items-center justify-center gap-2 hover:bg-[#004828] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none mt-3"
          >
            {submitting ? "Оформлення..." : "Замовити"}
          </button>
        </div>
      </div>
    </div>
  );
}
