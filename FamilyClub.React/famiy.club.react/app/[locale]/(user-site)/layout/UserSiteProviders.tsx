"use client";

import { PlatformSettingsProvider } from "@/lib/platformSettings/PlatformSettingsContext";
import PlatformSettingsEffects from "@/lib/platformSettings/PlatformSettingsEffects";
import MaintenanceGate from "@/lib/platformSettings/MaintenanceGate";

export default function UserSiteProviders({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PlatformSettingsProvider>
            <PlatformSettingsEffects />
            <MaintenanceGate>{children}</MaintenanceGate>
        </PlatformSettingsProvider>
    );
}
