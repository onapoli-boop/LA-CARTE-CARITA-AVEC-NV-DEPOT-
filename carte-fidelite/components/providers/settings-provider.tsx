"use client";

import { createContext, useContext } from "react";
import type { BusinessSettings } from "@/types/settings";

const SettingsContext = createContext<BusinessSettings | null>(null);

export function SettingsProvider({
  settings,
  children,
}: {
  settings: BusinessSettings;
  children: React.ReactNode;
}) {
  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

/**
 * Hook d'accès à la config du commerce dans n'importe quel Client Component.
 */
export function useSettings(): BusinessSettings {
  const settings = useContext(SettingsContext);
  if (!settings) {
    throw new Error(
      "useSettings() doit être utilisé à l'intérieur d'un <SettingsProvider>. " +
        "Vérifie que le composant est bien monté sous app/layout.tsx."
    );
  }
  return settings;
}
