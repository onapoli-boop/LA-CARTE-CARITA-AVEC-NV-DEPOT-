import type { CSSProperties } from "react";
import type { BusinessSettings } from "@/types/settings";

export function buildCssVariables(settings: BusinessSettings): CSSProperties {
  return {
    "--color-primary": settings.primary_color,
    "--color-secondary": settings.secondary_color,
    "--color-background": settings.background_color,
    "--color-text": settings.text_color,
    "--font-heading": `"${settings.font_heading}", serif`,
    "--font-body": `"${settings.font_body}", sans-serif`,
  } as CSSProperties;
}

export function buildGoogleFontsHref(settings: BusinessSettings): string {
  const families = Array.from(
    new Set([settings.font_heading, settings.font_body].filter(Boolean))
  );

  const familyParams = families
    .map((f) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}:wght@400;500;600;700`)
    .join("&");

  return `https://fonts.googleapis.com/css2?${familyParams}&display=swap`;
}
