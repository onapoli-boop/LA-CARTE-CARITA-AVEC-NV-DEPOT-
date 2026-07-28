-- =============================================================================
-- SEED — À PERSONNALISER POUR CHAQUE NOUVEAU COMMERÇANT
-- Remplace les valeurs de la SECTION 1 (et adapte paliers/catalogue/roue).
-- Exemple ci-dessous : "Carita Caen". À exécuter APRÈS schema.sql.
-- =============================================================================

-- SECTION 1 — Identité & charte graphique
insert into public.business_settings (
  name, brand_word, brand_subword,
  primary_color, secondary_color, background_color, text_color,
  font_heading, font_body, points_label,
  welcome_bonus_points, scan_cooldown_minutes,
  pwa_name, pwa_short_name, pwa_theme_color
) values (
  'Carita Caen', 'CARITA', 'CAEN',
  '#e0bb7e', '#cda76a', '#0b0906', '#ffffff',
  'Playfair Display', 'Inter', 'pts',
  50, 60,
  'Carita Caen', 'Carita', '#0b0906'
);

-- SECTION 2 — Paliers de fidélité
insert into public.loyalty_tiers (name, min_points, icon_glyph, sort_order) values
  ('Découverte', 0,   '★', 1),
  ('Privilège',  150, '♛', 2),
  ('Signature',  350, '◆', 3),
  ('Icône',      600, '✦', 4);

-- SECTION 3 — Catalogue
insert into public.rewards (category, name, points_cost, is_active, sort_order) values
  ('Soins',     'Soin Visage Signature',    200, true,  1),
  ('Soins',     'Rituel Corps Prestige',    350, true,  2),
  ('Coiffure',  'Coiffure & Brushing',      150, true,  3),
  ('Produits',  'Coffret Produits Carita',  250, false, 4),
  ('Bien-être', 'Manucure Alchimie',        120, true,  5);

-- SECTION 4 — Roue (total = 100%)
insert into public.wheel_segments (label, type, points_value, probability, is_dark, sort_order) values
  ('+50 points',        'points',   50,  12.5, false, 1),
  ('-10% (réduction)',  'discount', null, 12.5, true,  2),
  ('Soin offert',       'gift',     null, 12.5, false, 3),
  ('+30 points',        'points',   30,  12.5, true,  4),
  ('Brushing offert',   'gift',     null, 12.5, false, 5),
  ('+20 points',        'points',   20,  12.5, true,  6),
  ('-15% (réduction)',  'discount', null, 12.5, false, 7),
  ('+100 points',       'points',   100, 12.5, true,  8);

-- SECTION 5 — Promotion
insert into public.promotions (title, description, is_active, starts_at, ends_at) values
  ('-15% sur les soins visage', 'Profitez-en jusqu''au 31 juillet', true, now(), now() + interval '30 days');

-- Le PREMIER compte créé via /signup devient automatiquement admin.
