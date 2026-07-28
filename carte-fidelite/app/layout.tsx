import type { Metadata } from "next";
import { getBusinessSettings } from "@/lib/settings/get-settings";
import { buildCssVariables, buildGoogleFontsHref } from "@/lib/settings/theme";
import { SettingsProvider } from "@/components/providers/settings-provider";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getBusinessSettings();
  if (!settings) return {};

  return {
    title: settings.pwa_name ?? settings.name,
    description: `Programme de fidélité ${settings.name}`,
    manifest: "/manifest.webmanifest",
    icons: settings.pwa_icon_192
      ? [{ rel: "icon", url: settings.pwa_icon_192 }]
      : undefined,
    themeColor: settings.pwa_theme_color ?? settings.background_color,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getBusinessSettings();

  // Base fraîchement déployée, pas encore configurée -> message clair plutôt
  // qu'un plantage silencieux. En pratique, un script de déploiement insère
  // toujours une ligne business_settings avant la mise en ligne.
  if (!settings) {
    return (
      <html lang="fr">
        <body>
          <div style={{ padding: 40, fontFamily: "sans-serif" }}>
            Configuration du commerce introuvable. Vérifie que la table
            `business_settings` contient bien une ligne.
          </div>
        </body>
      </html>
    );
  }

  const cssVariables = buildCssVariables(settings);
  const googleFontsHref = buildGoogleFontsHref(settings);

  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link href={googleFontsHref} rel="stylesheet" />
      </head>
      <body
        style={{
          ...cssVariables,
          backgroundColor: "var(--color-background)",
          color: "var(--color-text)",
          fontFamily: "var(--font-body)",
          margin: 0,
        }}
      >
        <SettingsProvider settings={settings}>{children}</SettingsProvider>
      </body>
    </html>
  );
}
