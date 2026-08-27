"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authService } from "@/lib/api/services";
import { loginErrorMessage } from "@/lib/auth/loginErrorMessage";
import { setAuthSession } from "@/lib/auth/tokenStorage";
import AuthBrandLogo from "./AuthBrandLogo";

type LoginSectionProps = {
  onGoToRegister: () => void;
};

const CONTENT_WIDTH = 460;
const INPUT_HEIGHT = 52;

export default function LoginSection({ onGoToRegister }: LoginSectionProps) {
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [formData, setFormData] = useState({ login: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    const email = formData.login.trim();
    if (!email || !formData.password) {
      setError("Будь ласка, заповніть усі поля");
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

      if (!response.token) {
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

  const handleExternalLogin = (provider: "Google") => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
    window.location.href = `${apiBase}/api/AuthClubMember/external-login?provider=${provider}`;
  };

  return (
    <div
      style={{ width: CONTENT_WIDTH }}
      className="flex flex-col items-center"
    >
      <AuthBrandLogo className="mb-8" widthClassName="w-[160px] md:w-[180px]" />

      <form
        onSubmit={handleLogin}
        style={{ width: CONTENT_WIDTH }}
        className="flex flex-col gap-5 items-center"
      >
        <div className="w-full flex flex-col gap-2.5">
          <label className="font-sans font-semibold text-[24px] text-[#242424]">
            Email
          </label>
          <input
            type="email"
            autoComplete="email"
            value={formData.login}
            onChange={(e) =>
              setFormData({ ...formData, login: e.target.value })
            }
            placeholder="Введіть email"
            className="outline-none transition-shadow focus:shadow-md w-full rounded-[9px] px-4 bg-white shadow-[0px_0px_10px_0px_#00000033] font-sans text-[18px] text-[#242424] placeholder:text-[#242424]/50"
            style={{ height: INPUT_HEIGHT }}
          />
        </div>

        <div className="w-full flex flex-col gap-2.5">
          <div className="flex justify-between items-center w-full gap-2">
            <label className="font-sans font-semibold text-[24px] text-[#242424]">
              Пароль
            </label>
            <Link
              href="/forgot-password"
              className="text-[16px] text-[#242424] hover:underline whitespace-nowrap"
            >
              Забули пароль?
            </Link>
          </div>

          <div
            className="relative w-full"
            style={{ height: INPUT_HEIGHT }}
          >
            <input
              type={isPasswordVisible ? "text" : "password"}
              placeholder="Введіть пароль"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="outline-none w-full h-full rounded-[9px] pl-4 pr-12 bg-white shadow-[0px_0px_10px_0px_#00000033] font-sans text-[18px] text-[#242424] placeholder:text-[#242424]/50"
            />
            <button
              type="button"
              disabled={loading}
              className="absolute flex items-center justify-center top-1/2 right-3 -translate-y-1/2 w-7 h-7 bg-transparent border-0 cursor-pointer"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={() => setIsPasswordVisible((v) => !v)}
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
                className="w-6 h-6 object-contain"
              />
            </button>
          </div>
        </div>

        {error && (
          <p className="text-[#8b0000] text-[16px] w-full m-0">{error}</p>
        )}

        <label className="w-full flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 accent-[var(--color-green)]"
          />
          <span className="text-[16px] text-[#242424]">Запамʼятати мене</span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-[9px] bg-[var(--color-green)] shadow-[0px_0px_10px_0px_#00000040] flex items-center justify-center border-0 cursor-pointer hover:brightness-110 active:scale-[0.98] disabled:opacity-70 transition"
          style={{ height: INPUT_HEIGHT }}
        >
          <span className="font-sans text-[20px] text-white">
            {loading ? "..." : "Увійти"}
          </span>
        </button>

        <div className="flex items-center justify-center w-full py-1 gap-5">
          <div className="flex-1 border-t border-[#242424]" />
          <span className="font-sans text-[18px] text-[#242424] whitespace-nowrap">
            або
          </span>
          <div className="flex-1 border-t border-[#242424]" />
        </div>

        <button
          type="button"
          onClick={() => handleExternalLogin("Google")}
          className="w-full rounded-[9px] bg-white shadow-[0px_0px_10px_0px_#00000033] flex items-center justify-center gap-3 border-0 cursor-pointer hover:brightness-95 active:scale-[0.98] transition"
          style={{ height: INPUT_HEIGHT }}
        >
          <img
            src="/images/Layout/Footer/GoogleBrandIcon.svg"
            alt="Google"
            className="w-[22px] h-[22px] object-contain"
          />
          <span className="font-sans text-[18px] text-[#242424]">
            Продовжити через Google
          </span>
        </button>

        <span className="mt-1 font-sans text-[18px] text-[#242424] inline-flex whitespace-nowrap gap-1.5">
          Немає аккаунту?{" "}
          <button
            type="button"
            onClick={onGoToRegister}
            className="text-[var(--color-green)] font-semibold bg-transparent border-0 p-0 cursor-pointer hover:underline"
          >
            Зареєструватися.
          </button>
        </span>
      </form>
    </div>
  );
}
