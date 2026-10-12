"use client";

import { usePlatformSettingsOptional } from "@/lib/platformSettings/PlatformSettingsContext";
import { mediaSrc } from "@/lib/platformSettings/platformSettingsApi";
import { useTheme } from "@/lib/theme/ThemeProvider";

const DEFAULT_LOGO = "/images/main_page/logo.png";

type Props = {
  className?: string;
  /** Max width of the logo image */
  widthClassName?: string;
};

/**
 * Brand logo for auth screens: in day mode on tan panel, inverts to multiply dark
 * text. In night mode on dark panel, uses screen blend so light brand logo stands out.
 */
export default function AuthBrandLogo({
  className = "",
  widthClassName = "w-[180px] md:w-[200px]",
}: Props) {
  const { settings } = usePlatformSettingsOptional();
  const { theme } = useTheme();
  const isNight = theme === "ink-night";
  const src =
    mediaSrc(settings.logoData, settings.logoContentType) ?? DEFAULT_LOGO;
  const alt = settings.companyName || "LIBRELLIS";

  return (
    <div className={`flex justify-center ${className}`}>
      <img
        src={src}
        alt={alt}
        className={`${widthClassName} h-auto object-contain pointer-events-none select-none`}
        style={
          isNight
            ? {
                filter: "none",
                mixBlendMode: "screen",
              }
            : {
                filter: "invert(1)",
                mixBlendMode: "multiply",
              }
        }
      />
    </div>
  );
}
