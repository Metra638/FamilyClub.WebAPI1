"use client";

import { PlatformSettingsProvider } from "@/lib/platformSettings/PlatformSettingsContext";
import PlatformSettingsEffects from "@/lib/platformSettings/PlatformSettingsEffects";
import MaintenanceGate from "@/lib/platformSettings/MaintenanceGate";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { MascotShelfProvider } from "@/lib/mascot/MascotShelfContext";

export default function UserSiteProviders({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ThemeProvider>
            <PlatformSettingsProvider>
                <PlatformSettingsEffects />
                <MascotShelfProvider>
                    <MaintenanceGate>{children}</MaintenanceGate>
                </MascotShelfProvider>
            </PlatformSettingsProvider>
        </ThemeProvider>
    );
}
