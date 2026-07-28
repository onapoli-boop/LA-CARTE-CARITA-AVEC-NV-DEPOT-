/**
 * Reflète 1:1 la table `public.business_settings` — une seule ligne par
 * déploiement (un commerçant = une base Supabase = une ligne).
 */
export interface BusinessSettings {
  id: string;
  name: string;
  /** Ligne principale du wordmark (ex: "CARITA"). Si vide, dérivé de `name`. */
  brand_word: string | null;
  /** Sous-ligne du wordmark (ex: "CAEN"). Optionnelle. */
  brand_subword: string | null;

  logo_url: string | null;
  card_banner_url: string | null;
  primary_color: string;
  secondary_color: string;
  background_color: string;
  text_color: string;
  font_heading: string;
  font_body: string;
  points_label: string;

  welcome_bonus_points: number;
  scan_token: string;
  scan_cooldown_minutes: number;

  pwa_name: string | null;
  pwa_short_name: string | null;
  pwa_icon_192: string | null;
  pwa_icon_512: string | null;
  pwa_theme_color: string | null;

  created_at: string;
  updated_at: string;
}
