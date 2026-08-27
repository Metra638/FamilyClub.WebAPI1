"use client";

import { useState } from "react";
import { AsYouType } from "libphonenumber-js";
import { authService } from "@/lib/api/services";
import { readApiErrorMessage } from "@/lib/api/readApiError";

type RegisterSectionProps = {
  onGoToLogin: () => void;
};

const CONTENT_WIDTH = 460;
const INPUT_HEIGHT = 48;

const manualCountries = [
  { code: "ua", dial: "+380" },
  { code: "pl", dial: "+48" },
  { code: "es", dial: "+34" },
  { code: "fr", dial: "+33" },
  { code: "cz", dial: "+420" },
  { code: "ie", dial: "+353" },
  { code: "gb", dial: "+44" },
];

export default function RegisterSection({ onGoToLogin }: RegisterSectionProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [detectedCountry, setDetectedCountry] = useState("ua");
  const [hasMatch, setHasMatch] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

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

  const handleRegister = async () => {
    if (
      !formData.email ||
      !formData.password ||
      formData.password !== formData.confirmPassword
    ) {
      setError("Перевірте поля та переконайтесь, що паролі збігаються.");
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
      setError("Потрібно погодитись з умовами використання.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await authService.apiAuthClubMemberRegisterPost({
        registerClubMemberDto: {
          email: formData.email.trim(),
          password: formData.password,
          name: formData.firstName.trim() || undefined,
          surname: formData.lastName.trim() || undefined,
          phoneNumber: phone.trim(),
        },
      });
      onGoToLogin();
    } catch (err) {
      setError(await readApiErrorMessage(err, "Помилка реєстрації. Можливо, email уже зайнятий."));
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);

  return (
    <div style={{ width: "460px" }} className="flex flex-col items-center">
      <div
        style={{
          width: "460px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          marginTop: "4px",
        }}
      >
        <label
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 600,
            fontSize: "17px",
            lineHeight: "100%",
            color: "var(--color-black)",
          }}
        >
          Ваше ім`я
        </label>
        <input
          type="text"
          placeholder="Введіть логін"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          className="register-input"
          style={{
            width: "460px",
            height: "44px",
            borderRadius: "9px",
            padding: "8px 16px",
            backgroundColor: "var(--color-white)",
            boxShadow: "0px 0px 10px 0px #00000040",
            outline: "none",
            border: "none",
            fontFamily: "var(--font-sans)",
            fontWeight: 400,
            fontSize: "18px",
            lineHeight: "150%",
            letterSpacing: "-0.011em",
            color: "var(--color-black)",
          }}
        />
      </div>

      <div
        style={{
          width: "460px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          marginTop: "4px",
        }}
      >
        <label
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 600,
            fontSize: "17px",
            lineHeight: "100%",
            color: "var(--color-black)",
          }}
        >
          Ваше прізвище *
        </label>
        <input
          type="text"
          name="lastName"
          placeholder="Прізвище"
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          className="register-input"
          style={{
            width: "460px",
            height: "44px",
            borderRadius: "9px",
            padding: "8px 16px",
            backgroundColor: "var(--color-white)",
            boxShadow: "0px 0px 10px 0px #00000040",
            outline: "none",
            border: "none",
            fontFamily: "var(--font-sans)",
            fontWeight: 400,
            fontSize: "18px",
            lineHeight: "150%",
            letterSpacing: "-0.011em",
            color: "var(--color-black)",
          }}
        />
      </div>

      <div
        style={{
          width: "460px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          position: "relative",
          marginTop: "4px",
        }}
      >
        <label
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 600,
            fontSize: "17px",
            lineHeight: "100%",
            color: "var(--color-black)",
          }}
        >
          Номер телефону *
        </label>

        <div style={{ display: "flex", width: "460px", height: "44px", position: "relative" }}>
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              width: "118px",
              height: "44px",
              borderTopLeftRadius: "9px",
              borderBottomLeftRadius: isDropdownOpen ? "0px" : "9px",
              background: "#F5F3EE",
              boxShadow: "0px 0px 10px 0px #00000040",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 11,
            }}
          >
            <div style={{ width: "32px", height: "24px", borderRadius: "4px", overflow: "hidden" }}>
              {hasMatch && (
                <span className={`fi fi-${detectedCountry}`} style={{ width: "100%", height: "100%" }} />
              )}
            </div>
            <span
              style={{
                marginLeft: "10px",
                width: 0,
                height: 0,
                borderLeft: "5px solid transparent",
                borderRight: "5px solid transparent",
                borderTop: "7px solid #242424",
                transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            />
          </div>

          <input
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="+380"
            style={{
              width: "342px",
              height: "44px",
              borderTopRightRadius: "9px",
              borderBottomRightRadius: "9px",
              background: "#F5F3EE",
              boxShadow: "0px 0px 10px 0px #00000040",
              padding: "8px 16px",
              fontFamily: "var(--font-sans)",
              fontSize: "18px",
              border: "none",
              outline: "none",
            }}
          />
        </div>

        {isDropdownOpen && (
          <>
            <div
              style={{ position: "fixed", inset: 0, zIndex: 10 }}
              onClick={() => setIsDropdownOpen(false)}
            />
            <div
              style={{
                position: "absolute",
                top: "44px",
                left: 0,
                width: "118px",
                backgroundColor: "#F5F3EE",
                borderBottomLeftRadius: "9px",
                borderBottomRightRadius: "9px",
                boxShadow: "0px 10px 10px 0px #00000040",
                zIndex: 12,
                padding: "4px 0",
                borderTop: "1px solid rgba(0,0,0,0.05)",
              }}
            >
              {manualCountries.map((c) => (
                <div
                  key={c.code}
                  onClick={() => {
                    setDetectedCountry(c.code);
                    setPhone(c.dial);
                    setIsDropdownOpen(false);
                  }}
                  style={{
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                  className="country-hover-item"
                >
                  <div style={{ width: "32px", height: "24px", borderRadius: "2px", overflow: "hidden" }}>
                    <span className={`fi fi-${c.code}`} style={{ width: "100%", height: "100%" }} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div
        style={{
          width: "460px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          marginTop: "4px",
        }}
      >
        <label
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 600,
            fontSize: "17px",
            lineHeight: "100%",
            color: "var(--color-black)",
          }}
        >
          Електронна пошта *
        </label>
        <input
          type="email"
          name="email"
          placeholder="Введіть email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="register-input"
          style={{
            width: "460px",
            height: "44px",
            borderRadius: "9px",
            padding: "8px 16px",
            backgroundColor: "#F5F3EE",
            boxShadow: "0px 0px 10px 0px #00000040",
            outline: "none",
            border: "none",
            fontFamily: "var(--font-sans)",
            fontWeight: 400,
            fontSize: "18px",
            lineHeight: "150%",
            letterSpacing: "-0.011em",
            color: "var(--color-black)",
          }}
        />
      </div>

      <div className="flex flex-col mt-2" style={{ width: "460px" }}>
        <label
          style={{
            height: "22px",
            fontWeight: 600,
            fontSize: "17px",
            lineHeight: "100%",
            color: "#242424",
          }}
        >
          Пароль *
        </label>
        <span
          style={{
            fontWeight: 400,
            fontSize: "13px",
            lineHeight: "120%",
            color: "#242424",
            marginTop: "2px",
          }}
        >
          Мінімум 6 символів: велика літера, мала літера та цифра
        </span>

        <div className="flex flex-col gap-[6px] w-[460px] mt-1.5">
          <div className="relative w-[460px] h-[44px]">
            <input
              type={isPasswordVisible ? "text" : "password"}
              placeholder="Введіть пароль"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full h-full rounded-[9px] px-4 py-[8px] pr-[50px] bg-[#F5F3EE] shadow-[0px_0px_10px_0px_#00000040] outline-none text-[18px] leading-[150%] tracking-[-0.011em]"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-[28px] h-[28px] flex items-center justify-center"
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
                alt="toggle visibility"
                style={{ width: "24px", height: "19px" }}
              />
            </button>
          </div>

          <div className="relative w-[460px] h-[44px]">
            <input
              type={isPasswordVisible ? "text" : "password"}
              placeholder="Підтвердження паролю"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className="w-full h-full rounded-[9px] px-4 py-[8px] pr-[50px] bg-[#F5F3EE] shadow-[0px_0px_10px_0px_#00000040] outline-none text-[18px] leading-[150%] tracking-[-0.011em]"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-[28px] h-[28px] flex items-center justify-center"
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
                alt="toggle"
                style={{ width: "24px", height: "19px" }}
              />
            </button>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          width: "460px",
          marginTop: "6px",
          gap: "12px",
        }}
      >
        <div
          onClick={() => setFormData({ ...formData, agreeToTerms: !formData.agreeToTerms })}
          style={{
            width: "24px",
            height: "24px",
            position: "relative",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              border: "2.5px solid #242424",
              backgroundColor: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
          >
            {formData.agreeToTerms && (
              <div
                style={{
                  position: "absolute",
                  width: "8px",
                  height: "16px",
                  border: "solid #242424",
                  borderWidth: "0 3px 3px 0",
                  transform: "rotate(45deg)",
                  top: "0px",
                  left: "11px",
                  animation: "tickPop 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                }}
              />
            )}
          </div>
        </div>

        <span
          style={{
            fontFamily: "Source Sans Pro",
            fontWeight: 400,
            fontSize: "17px",
            lineHeight: "140%",
            letterSpacing: "-0.011em",
            color: "#242424",
            cursor: "pointer",
            userSelect: "none",
          }}
          onClick={() => setFormData({ ...formData, agreeToTerms: !formData.agreeToTerms })}
        >
          Погоджуюсь з умовами використання
        </span>
      </div>

      <div
        style={{
          width: "460px",
          marginTop: "4px",
          fontFamily: "Source Sans Pro",
          fontWeight: 400,
          fontSize: "13px",
          lineHeight: "125%",
          color: "#242424",
          opacity: 0.85,
        }}
      >
        Реєструючись, ви погоджуєтеся на зберігання і використання компанією “Libria” наданих вами
        особистих даних відповідно до чинного законодавства України про недоторканність особистої
        інформації.
      </div>

      {error && (
        <p style={{ color: "#8b0000", fontSize: "16px", width: "460px", marginTop: "6px" }}>
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleRegister}
        disabled={loading}
        style={{
          width: "460px",
          height: "44px",
          marginTop: "8px",
          backgroundColor: "#005B33",
          borderRadius: "50px",
          padding: "8px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0px 0px 10px 0px #00000040",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1,
          transition: "all 0.2s ease",
        }}
        className="hover:brightness-110 active:scale-[0.98]"
      >
        <span
          style={{
            fontFamily: "Source Sans Pro",
            fontWeight: 600,
            fontSize: "19px",
            lineHeight: "150%",
            letterSpacing: "-0.011em",
            color: "#F5F3EE",
          }}
        >
          {loading ? "Завантаження..." : "Зареєструватися"}
        </span>
      </button>

      <div className="flex items-center justify-center w-full py-0.5 gap-4 my-1.5" style={{ width: "460px" }}>
        <div className="flex-1 border-t border-[#242424]/40" />
        <span className="font-sans text-[16px] text-[#242424] whitespace-nowrap">
          або
        </span>
        <div className="flex-1 border-t border-[#242424]/40" />
      </div>

      <button
        type="button"
        onClick={() => handleExternalLogin("Google")}
        className="w-full rounded-[9px] bg-white shadow-[0px_0px_10px_0px_#00000033] flex items-center justify-center gap-3 border-0 cursor-pointer hover:brightness-95 active:scale-[0.98] transition"
        style={{ width: "460px", height: "42px", marginBottom: "6px" }}
      >
        <img
          src="/images/Layout/Footer/GoogleBrandIcon.svg"
          alt="Google"
          className="w-[20px] h-[20px] object-contain"
        />
        <span className="font-sans text-[17px] text-[#242424]">
          Продовжити через Google
        </span>
      </button>

      <div
        style={{
          width: "460px",
          marginTop: "10px",
          paddingBottom: "10px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p
          style={{
            fontFamily: "Source Sans Pro, sans-serif",
            fontWeight: 400,
            fontSize: "18px",
            lineHeight: "150%",
            letterSpacing: "-0.011em",
            textAlign: "center",
            color: "#242424",
            margin: 0,
          }}
        >
          Вже маєте акаунт?{" "}
          <button
            type="button"
            onClick={onGoToLogin}
            style={{
              cursor: "pointer",
              color: "#005B33",
              fontWeight: 700,
              background: "none",
              border: "none",
              padding: 0,
              fontFamily: "inherit",
              fontSize: "inherit",
              lineHeight: "inherit",
              textDecoration: "underline",
            }}
          >
            Увійти
          </button>
        </p>
      </div>

      <style jsx>{`
        .register-input::placeholder {
          color: var(--color-black);
          opacity: 0.5;
        }
        .country-hover-item:hover {
          background-color: #e0c3a9;
        }
        @keyframes tickPop {
          from {
            opacity: 0;
            transform: rotate(45deg) scale(0.5);
          }
          to {
            opacity: 1;
            transform: rotate(45deg) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
