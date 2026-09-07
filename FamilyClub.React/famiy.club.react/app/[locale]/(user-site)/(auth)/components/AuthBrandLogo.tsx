"use client";

import { usePlatformSettingsOptional } from "@/lib/platformSettings/PlatformSettingsContext";
import { mediaSrc } from "@/lib/platformSettings/platformSettingsApi";

const DEFAULT_LOGO = "/images/main_page/logo.png";

type Props = {
  className?: string;
  /** Max width of the logo image */
  widthClassName?: string;
};

/**
 * Brand logo for auth screens (tan panel): uses platform settings when set,
 * otherwise the default LIBRELLIS mark. Colors are inverted so a light header
 * logo reads as dark on the auth background.
 */
export default function AuthBrandLogo({
  className = "",
  widthClassName = "w-[180px] md:w-[200px]",
}: Props) {
  const { settings } = usePlatformSettingsOptional();
  const src =
    mediaSrc(settings.logoData, settings.logoContentType) ?? DEFAULT_LOGO;
  const alt = settings.companyName || "LIBRELLIS";

  return (
    <div className={`flex justify-center ${className}`}>
      <img
        src={src}
        alt={alt}
        className={`${widthClassName} h-auto object-contain pointer-events-none select-none`}
        style={{
          filter: "invert(1)",
          mixBlendMode: "multiply",
        }}
      />
    </div>
  );
}
