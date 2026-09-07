"use client";

import { usePathname } from "next/navigation";
import AuthPageClient from "./components/AuthPageClient";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginOrRegister =
    pathname.endsWith("/login") || pathname.endsWith("/register");

  if (!isLoginOrRegister) {
    return <>{children}</>;
  }

  return (
    <>
      <AuthPageClient />
      {children}
    </>
  );
}
