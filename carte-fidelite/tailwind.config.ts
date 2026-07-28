import type { Config } from "tailwindcss";

/**
 * Les couleurs ne sont JAMAIS des valeurs fixes ici : elles pointent vers les
 * variables CSS injectées par TenantLayout (buildTenantCssVariables).
 * Ainsi `className="bg-primary text-body"` s'adapte automatiquement au
 * commerçant actif, sans aucune référence en dur à une couleur ou une police.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        background: "var(--color-background)",
        "on-background": "var(--color-text)",
      },
      fontFamily: {
        heading: ["var(--font-heading)"],
        body: ["var(--font-body)"],
      },
    },
  },
  plugins: [],
};

export default config;
