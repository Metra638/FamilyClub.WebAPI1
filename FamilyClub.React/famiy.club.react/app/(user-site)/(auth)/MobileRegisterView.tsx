"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AsYouType } from "libphonenumber-js";
import { authService } from "@/lib/api/services";
import { readApiErrorMessage } from "@/lib/api/readApiError";

export default function MobileRegisterView() {
  const router = useRouter();

  // Password visibility
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Phone and country dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [detectedCountry, setDetectedCountry] = useState("ua");
  const [hasMatch, setHasMatch] = useState(true);

  const manualCountries = [
    { code: "ua", dial: "+380", name: "UA" },
    { code: "pl", dial: "+48", name: "PL" },
    { code: "es", dial: "+34", name: "ES" },
    { code: "fr", dial: "+33", name: "FR" },
    { code: "cz", dial: "+420", name: "CZ" },
    { code: "ie", dial: "+353", name: "IE" },
    { code: "gb", dial: "+44", name: "GB" },
  ];

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleExternalLogin = (provider: "Google") => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
    window.location.href = `${apiBase}/api/AuthClubMember/external-login?provider=${provider}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const allowedChars = /^[0-9+\-().\s]*$/;

    if (allowedChars.test(input)) {
      const parser = new AsYouType();
      const formatted = parser.input(input);
      const country = parser.getCountry();

      setPhone(formatted);

      if (country) {
        setDetectedCountry(country.toLowerCase());
        setHasMatch(true);
      } else if (input.length === 0) {
        setDetectedCountry("ua");
        setHasMatch(true);
      } else {
        setHasMatch(false);
      }
    }
  };

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.email || !formData.password || !formData.lastName || !formData.firstName) {
      setError("Будь ласка, заповніть всі обов'язкові поля");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Паролі не співпадають");
      return;
    }
    if (formData.password.length < 6) {
      setError("Пароль має містити щонайменше 6 символів.");
      return;
    }
    if (!/[A-ZА-ЯІЇЄҐ]/.test(formData.password) || !/[a-zа-яіїєґ]/.test(formData.password) || !/\d/.test(formData.password)) {
      setError("Пароль має містити велику літеру, малу літеру та цифру.");
      return;
    }
    if (!phone || phone.replace(/\D/g, "").length < 8) {
      setError("Введіть коректний номер телефону.");
      return;
    }
    if (!formData.agreeToTerms) {
      setError("Необхідно погодитись з умовами використання");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await authService.apiAuthClubMemberRegisterPost({
        registerClubMemberDto: {
          name: formData.firstName.trim(),
          surname: formData.lastName.trim(),
          email: formData.email.trim(),
          phoneNumber: phone.trim(),
          password: formData.password,
        },
      });
      router.push("/login");
    } catch (err) {
      setError(
        await readApiErrorMessage(
          err,
          "Помилка під час реєстрації або користувач вже існує"
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <div className="flex md:hidden fixed inset-0 z-[100] bg-[#c7a381] flex-col justify-between items-center py-6 px-5 overflow-y-auto min-h-screen font-['Source_Sans_Pro',sans-serif]">
      {/* Back Button */}
      <div className="w-full flex justify-start pt-2 px-1 max-w-[372px]">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-[40px] h-[40px] rounded-full bg-[#f5f3ee]/50 flex items-center justify-center text-[20px] text-[#242424] hover:bg-[#f5f3ee] transition-colors active:scale-95"
          aria-label="Назад"
        >
          ←
        </button>
      </div>

      {/* Top Section: Logo */}
      <div className="flex flex-col items-center justify-center mt-2 mb-4">
        <img
          src="/images/login register/mobile-logo.png"
          alt="LIBRELLIS"
          className="w-[240px] sm:w-[280px] h-auto object-contain pointer-events-none drop-shadow-[0px_2px_4px_rgba(0,0,0,0.15)]"
        />
      </div>

      {/* Form Section */}
      <form
        onSubmit={handleRegister}
        className="w-full max-w-[372px] flex flex-col gap-[14px] my-auto"
      >
        {/* Error message if any */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-[9px] px-4 py-2.5 text-center text-[#242424] font-medium text-[15px]">
            {error}
          </div>
        )}

        {/* First Name Input */}
        <div className="flex flex-col gap-[8px] w-full">
          <label className="text-[20px] font-semibold text-[#242424] leading-normal">
            Ваше ім'я
          </label>
          <div className="bg-[#f5f3ee] h-[50px] w-full rounded-[9px] px-[20px] py-[10px] drop-shadow-[0px_0px_5px_rgba(0,0,0,0.25)] flex items-center">
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              placeholder="Введіть ваше ім'я"
              className="w-full bg-transparent outline-none text-[16px] text-[#242424] placeholder:text-[#242424]/50 tracking-[-0.176px]"
            />
          </div>
        </div>

        {/* Last Name Input */}
        <div className="flex flex-col gap-[8px] w-full">
          <label className="text-[20px] font-semibold text-[#242424] leading-normal">
            Ваше прізвище *
          </label>
          <div className="bg-[#f5f3ee] h-[50px] w-full rounded-[9px] px-[20px] py-[10px] drop-shadow-[0px_0px_5px_rgba(0,0,0,0.25)] flex items-center">
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              placeholder="Введіть прізвище"
              className="w-full bg-transparent outline-none text-[16px] text-[#242424] placeholder:text-[#242424]/50 tracking-[-0.176px]"
            />
          </div>
        </div>

        {/* Phone Input with Country Dropdown */}
        <div className="flex flex-col gap-[8px] w-full relative">
          <label className="text-[20px] font-semibold text-[#242424] leading-normal">
            Номер телефону *
          </label>
          <div className="flex w-full h-[50px] relative drop-shadow-[0px_0px_5px_rgba(0,0,0,0.25)]">
            {/* Left Country Flag Box */}
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-[85px] h-[50px] bg-[#f5f3ee] rounded-l-[9px] flex items-center justify-center cursor-pointer border-r border-[#242424]/10 select-none z-20"
            >
              <div className="w-[26px] h-[18px] rounded-[2px] overflow-hidden bg-gray-200 flex-shrink-0">
                {hasMatch && (
                  <span
                    className={`fi fi-${detectedCountry}`}
                    style={{ width: "100%", height: "100%", display: "block" }}
                  />
                )}
              </div>
              <span
                className="ml-2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#242424] transition-transform duration-200"
                style={{
                  transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </div>

            {/* Right Phone Input */}
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="+380"
              className="flex-1 h-[50px] bg-[#f5f3ee] rounded-r-[9px] px-[15px] outline-none text-[16px] text-[#242424] placeholder:text-[#242424]/50 tracking-[-0.176px]"
            />
          </div>

          {/* Country Flag Dropdown */}
          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute top-[82px] left-0 w-[120px] bg-[#f5f3ee] rounded-b-[9px] shadow-xl z-20 py-1 border-t border-[#242424]/10 max-h-[160px] overflow-y-auto">
                {manualCountries.map((c) => (
                  <div
                    key={c.code}
                    onClick={() => {
                      setDetectedCountry(c.code);
                      setPhone(c.dial);
                      setIsDropdownOpen(false);
                    }}
                    className="h-[40px] px-3 flex items-center gap-2 cursor-pointer hover:bg-[#e0c3a9] transition-colors"
                  >
                    <div className="w-[22px] h-[16px] rounded-[2px] overflow-hidden bg-gray-200 flex-shrink-0">
                      <span
                        className={`fi fi-${c.code}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "block",
                        }}
                      />
                    </div>
                    <span className="text-[14px] text-[#242424] font-medium">
                      {c.dial}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Email Input */}
        <div className="flex flex-col gap-[8px] w-full">
          <label className="text-[20px] font-semibold text-[#242424] leading-normal">
            Електронна пошта *
          </label>
          <div className="bg-[#f5f3ee] h-[50px] w-full rounded-[9px] px-[20px] py-[10px] drop-shadow-[0px_0px_5px_rgba(0,0,0,0.25)] flex items-center">
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Введіть email"
              className="w-full bg-transparent outline-none text-[16px] text-[#242424] placeholder:text-[#242424]/50 tracking-[-0.176px]"
            />
          </div>
        </div>

        {/* Password Inputs Section */}
        <div className="flex flex-col gap-[8px] w-full mt-1">
          <div className="flex flex-col">
            <label className="text-[20px] font-semibold text-[#242424] leading-normal">
              Пароль *
            </label>
            <span className="text-[13px] text-[#242424]/80 leading-snug mt-[2px]">
              Мінімум 6 символів: велика літера, мала літера та цифра
            </span>
          </div>

          {/* Enter Password */}
          <div className="bg-[#f5f3ee] h-[50px] w-full rounded-[9px] px-[20px] py-[10px] drop-shadow-[0px_0px_5px_rgba(0,0,0,0.25)] flex items-center justify-between gap-2 mt-1">
            <input
              type={isPasswordVisible ? "text" : "password"}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Введіть пароль"
              className="w-full bg-transparent outline-none text-[16px] text-[#242424] placeholder:text-[#242424]/50 tracking-[-0.176px]"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="flex-shrink-0 w-[30px] h-[30px] flex items-center justify-center transition-opacity"
              aria-label="Показати або приховати пароль"
            >
              <img
                src={
                  isPasswordVisible
                    ? isHovered
                      ? "/images/login register/eye-closed-hover.svg"
                      : "/images/login register/eye-closed-default.svg"
                    : isHovered
                      ? "/images/login register/eye-open-hover.svg"
                      : "/images/login register/eye-open-default.svg"
                }
                alt="Toggle Password"
                className="w-[24px] h-[24px] object-contain"
              />
            </button>
          </div>

          {/* Confirm Password */}
          <div className="bg-[#f5f3ee] h-[50px] w-full rounded-[9px] px-[20px] py-[10px] drop-shadow-[0px_0px_5px_rgba(0,0,0,0.25)] flex items-center justify-between gap-2 mt-2">
            <input
              type={isPasswordVisible ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              placeholder="Підтвердження паролю"
              className="w-full bg-transparent outline-none text-[16px] text-[#242424] placeholder:text-[#242424]/50 tracking-[-0.176px]"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="flex-shrink-0 w-[30px] h-[30px] flex items-center justify-center transition-opacity"
              aria-label="Показати або приховати пароль"
            >
              <img
                src={
                  isPasswordVisible
                    ? isHovered
                      ? "/images/login register/eye-closed-hover.svg"
                      : "/images/login register/eye-closed-default.svg"
                    : isHovered
                      ? "/images/login register/eye-open-hover.svg"
                      : "/images/login register/eye-open-default.svg"
                }
                alt="Toggle Password"
                className="w-[24px] h-[24px] object-contain"
              />
            </button>
          </div>
        </div>

        {/* Terms of Use Checkbox */}
        <div className="flex items-start gap-3 mt-3 cursor-pointer select-none">
          <div
            onClick={() =>
              setFormData({
                ...formData,
                agreeToTerms: !formData.agreeToTerms,
              })
            }
            className="w-[24px] h-[24px] rounded-full border-[2.5px] border-[#242424] flex items-center justify-center flex-shrink-0 mt-[2px] transition-all hover:bg-[#242424]/5"
          >
            {formData.agreeToTerms && (
              <div className="w-[7px] h-[13px] border-r-[3px] border-b-[3px] border-[#242424] rotate-45 -mt-1" />
            )}
          </div>
          <span
            onClick={() =>
              setFormData({
                ...formData,
                agreeToTerms: !formData.agreeToTerms,
              })
            }
            className="text-[16px] text-[#242424] font-normal leading-snug"
          >
            Погоджуюсь з умовами використання
          </span>
        </div>

        {/* Legal Disclaimer */}
        <p className="text-[13px] text-[#242424]/80 leading-snug mt-[2px]">
          Реєструючись, ви погоджуєтеся на зберігання і використання компанією
          “Libria” наданих вами особистих даних відповідно до чинного
          законодавства України про недоторканність особистої інформації.
        </p>

        {/* Submit Register Button */}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 bg-[#005b33] h-[50px] w-full rounded-[9px] px-[20px] py-[10px] drop-shadow-[0px_0px_5px_rgba(0,0,0,0.25)] flex items-center justify-center text-[24px] text-white tracking-[-0.264px] transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? "Завантаження..." : "Зареєструватися"}
        </button>

        {/* Divider "або" */}
        <div className="flex items-center justify-between gap-4 w-full my-[6px]">
          <div className="flex-1 h-[1px] bg-[#242424]" />
          <span className="text-[20px] text-[#242424] tracking-[-0.22px]">
            або
          </span>
          <div className="flex-1 h-[1px] bg-[#242424]" />
        </div>

        {/* Google Login Button */}
        <button
          type="button"
          onClick={() => handleExternalLogin("Google")}
          className="bg-[#f5f3ee] h-[54px] w-full rounded-[9px] px-[20px] py-[10px] drop-shadow-[0px_0px_5px_rgba(0,0,0,0.25)] flex items-center justify-center gap-[15px] transition-all hover:brightness-95 active:scale-[0.98]"
        >
          <img
            src="/images/Layout/Footer/GoogleBrandIcon.svg"
            alt="Google"
            className="w-[34px] h-[34px] object-contain flex-shrink-0"
          />
          <span className="text-[20px] text-[#242424] tracking-[-0.22px] font-normal whitespace-nowrap">
            Продовжити через Google
          </span>
        </button>

        {/* Bottom Navigation */}
        <div className="w-full text-center mt-3 mb-4">
          <p className="text-[#242424] text-[18px] leading-normal font-normal">
            Вже маєте акаунт?{" "}
            <Link
              href="/login"
              className="text-[#005b33] font-bold underline hover:opacity-80"
            >
              Увійти
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
