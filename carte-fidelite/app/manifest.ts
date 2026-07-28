import type { MetadataRoute } from "next";
import { getBusinessSettings } from "@/lib/settings/get-settings";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getBusinessSettings();

  if (!settings) {
    return { name: "Carte de fidélité", start_url: "/", display: "standalone" };
  }

  return {
    name: settings.pwa_name ?? settings.name,
    short_name: settings.pwa_short_name ?? settings.name,
    description: `Programme de fidélité ${settings.name}`,
    start_url: "/",
    display: "standalone",
    background_color: settings.background_color,
    theme_color: settings.pwa_theme_color ?? settings.background_color,
    icons: [
      settings.pwa_icon_192 && {
        src: settings.pwa_icon_192,
        sizes: "192x192",
        type: "image/png",
      },
      settings.pwa_icon_512 && {
        src: settings.pwa_icon_512,
        sizes: "512x512",
        type: "image/png",
      },
    ].filter(Boolean) as MetadataRoute.Manifest["icons"],
  };
}
