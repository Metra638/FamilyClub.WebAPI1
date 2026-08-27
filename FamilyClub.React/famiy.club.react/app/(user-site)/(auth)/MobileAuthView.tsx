"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/api/services";
import { loginErrorMessage } from "@/lib/auth/loginErrorMessage";
import { setAuthSession } from "@/lib/auth/tokenStorage";
import AuthBrandLogo from "./components/AuthBrandLogo";

export default function MobileAuthView() {
  const router = useRouter();
  const [formData, setFormData] = useState({ login: "", password: "" });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const handleExternalLogin = (provider: "Google") => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
    window.location.href = `${apiBase}/api/AuthClubMember/external-login?provider=${provider}`;
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const email = formData.login.trim();
    if (!email || !formData.password) {
      setError("Будь ласка, заповніть всі поля");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await authService.apiAuthClubMemberLoginPost({
        loginClubMemberDto: {
          username: email,
          password: formData.password,
          rememberMe,
        },
      });

      if (!response?.token) {
        setError("Не вдалося отримати токен. Спробуйте ще раз.");
        return;
      }

      setAuthSession(
        response.token,
        response.clubMember?.id ?? undefined,
        rememberMe
      );
      window.dispatchEvent(new Event("auth-change"));
      router.push("/");
    } catch (err) {
      setError(await loginErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex md:hidden fixed inset-0 z-[100] bg-[#c7a381] flex-col justify-between items-center py-6 px-5 overflow-y-auto min-h-screen font-sans">
      <div className="w-full flex justify-start pt-2 px-1 max-w-[372px]">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-[40px] h-[40px] rounded-full bg-[#f5f3ee]/50 flex items-center justify-center text-[20px] text-[#242424] hover:bg-[#f5f3ee] transition-colors active:scale-95 shadow-sm"
          aria-label="Назад"
        >
          ←
        </button>
      </div>

      <AuthBrandLogo className="mt-2 mb-6" widthClassName="w-[160px]" />

      <form
        onSubmit={handleLogin}
        className="w-full max-w-[372px] flex flex-col gap-[15px] my-auto"
      >
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-[9px] px-4 py-2.5 text-center text-[#242424] font-medium text-[15px]">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-[10px] w-full">
          <label className="text-[20px] font-semibold text-[#242424]">
            Email
          </label>
          <div className="bg-white h-[50px] w-full rounded-[9px] px-[20px] drop-shadow-[0px_0px_5px_rgba(0,0,0,0.25)] flex items-center">
            <input
              type="email"
              autoComplete="email"
              value={formData.login}
              onChange={(e) =>
                setFormData({ ...formData, login: e.target.value })
              }
              placeholder="Введіть email"
              className="w-full bg-transparent outline-none text-[16px] text-[#242424] placeholder:text-[#242424]/50"
            />
          </div>
        </div>

        <div className="flex flex-col gap-[10px] w-full">
          <div className="flex items-end justify-between w-full">
            <label className="text-[20px] font-semibold text-[#242424]">
              Пароль
            </label>
            <Link
              href="/forgot-password"
              className="text-[14px] text-[#242424] hover:underline"
            >
              Забули пароль?
            </Link>
          </div>
          <div className="bg-white h-[50px] w-full rounded-[9px] px-[20px] drop-shadow-[0px_0px_5px_rgba(0,0,0,0.25)] flex items-center justify-between gap-2">
            <input
              type={isPasswordVisible ? "text" : "password"}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Введіть пароль"
              className="w-full bg-transparent outline-none text-[16px] text-[#242424] placeholder:text-[#242424]/50"
            />
            <button
              type="button"
              onClick={() => setIsPasswordVisible((v) => !v)}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="flex-shrink-0 w-[30px] h-[30px] flex items-center justify-center"
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
                alt=""
                className="w-[24px] h-[24px] object-contain"
              />
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 accent-[#005b33]"
          />
          <span className="text-[15px] text-[#242424]">Запамʼятати мене</span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-1 bg-[#005b33] h-[50px] w-full rounded-[9px] drop-shadow-[0px_0px_5px_rgba(0,0,0,0.25)] flex items-center justify-center text-[20px] text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-70"
        >
          {loading ? "Завантаження..." : "Увійти"}
        </button>

        <div className="flex items-center justify-between gap-4 w-full my-1">
          <div className="flex-1 h-px bg-[#242424]" />
          <span className="text-[18px] text-[#242424]">або</span>
          <div className="flex-1 h-px bg-[#242424]" />
        </div>

        <button
          type="button"
          onClick={() => handleExternalLogin("Google")}
          className="bg-white h-[50px] w-full rounded-[9px] drop-shadow-[0px_0px_5px_rgba(0,0,0,0.25)] flex items-center justify-center gap-[15px] hover:brightness-95 active:scale-[0.98]"
        >
          <img
            src="/images/Layout/Footer/GoogleBrandIcon.svg"
            alt="Google"
            className="w-[28px] h-[28px] object-contain"
          />
          <span className="text-[18px] text-[#242424]">
            Продовжити через Google
          </span>
        </button>
      </form>

      <div className="w-full max-w-[392px] text-center mt-6 mb-4">
        <p className="text-[#242424] text-[15px]">
          Немає аккаунту?{" "}
          <Link
            href="/register"
            className="text-[#005b33] font-semibold hover:underline"
          >
            Зареєструватися.
          </Link>
        </p>
      </div>
    </div>
  );
}
