-- =============================================================================
-- CARTE DE FIDÉLITÉ DIGITALE — SCHÉMA SINGLE-TENANT
-- =============================================================================
-- Un commerçant = une base Supabase = ce schéma appliqué tel quel.
-- Pas de tenant_id : l'isolation entre commerçants se fait au niveau du
-- projet Supabase (chacun a le sien), pas au niveau des lignes.
-- =============================================================================

create extension if not exists "pgcrypto";

create type public.user_role as enum ('client', 'admin', 'superadmin');
create type public.activity_type as enum ('purchase', 'wheel_spin', 'welcome_bonus', 'reward_redeem', 'manual_adjustment', 'tier_upgrade');
create type public.reward_source as enum ('catalogue', 'wheel');
create type public.reward_status as enum ('pending', 'available', 'used', 'expired');
create type public.wheel_segment_type as enum ('points', 'gift', 'discount');

-- -----------------------------------------------------------------------------
-- TABLE: business_settings — une seule ligne par déploiement.
-- -----------------------------------------------------------------------------
create table public.business_settings (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  brand_word          text,  -- ligne principale du logo texte (ex: "CARITA"). Si vide, dérivé de `name`.
  brand_subword       text,  -- sous-ligne du logo texte (ex: "CAEN"). Optionnelle.

  logo_url            text,
  card_banner_url     text,
  primary_color       text not null default '#111111',
  secondary_color     text not null default '#666666',
  background_color    text not null default '#0b0906',
  text_color          text not null default '#ffffff',
  font_heading        text not null default 'Inter',
  font_body           text not null default 'Inter',
  points_label        text not null default 'points',

  welcome_bonus_points integer not null default 0,
  scan_token          text not null default replace(gen_random_uuid()::text, '-', ''),
  scan_cooldown_minutes integer not null default 60,

  pwa_name            text,
  pwa_short_name      text,
  pwa_icon_192        text,
  pwa_icon_512        text,
  pwa_theme_color     text,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

comment on table public.business_settings is 'Config du commerçant. Une seule ligne par déploiement (voir trigger singleton).';

create or replace function public.prevent_multiple_business_settings()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if (select count(*) from public.business_settings) >= 1 then
    raise exception 'Une seule ligne de configuration est autorisée dans business_settings.';
  end if;
  return new;
end;
$$;

create trigger trg_business_settings_singleton
  before insert on public.business_settings
  for each row execute function public.prevent_multiple_business_settings();

-- -----------------------------------------------------------------------------
-- TABLE: profiles
-- -----------------------------------------------------------------------------
create table public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  role                public.user_role not null default 'client',

  full_name           text,
  email               text,
  phone               text,
  avatar_url          text,

  points_balance      integer not null default 0,
  member_since        timestamptz not null default now(),
  notif_push_enabled  boolean not null default true,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  constraint points_balance_non_negative check (points_balance >= 0)
);

create index idx_profiles_role on public.profiles(role);

-- -----------------------------------------------------------------------------
-- TABLE: loyalty_tiers
-- -----------------------------------------------------------------------------
create table public.loyalty_tiers (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  min_points          integer not null default 0,
  icon_glyph          text,
  sort_order          integer not null default 0,
  created_at          timestamptz not null default now(),

  constraint min_points_non_negative check (min_points >= 0)
);

create unique index uniq_loyalty_tiers_minpoints on public.loyalty_tiers(min_points);

-- -----------------------------------------------------------------------------
-- TABLE: rewards
-- -----------------------------------------------------------------------------
create table public.rewards (
  id                  uuid primary key default gen_random_uuid(),
  category            text,
  name                text not null,
  description         text,
  points_cost         integer not null,
  image_url           text,
  is_active           boolean not null default true,
  sort_order          integer not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  constraint points_cost_positive check (points_cost >= 0)
);

create index idx_rewards_active on public.rewards(is_active);

-- -----------------------------------------------------------------------------
-- TABLE: wheel_segments
-- -----------------------------------------------------------------------------
create table public.wheel_segments (
  id                  uuid primary key default gen_random_uuid(),
  label               text not null,
  type                public.wheel_segment_type not null default 'points',
  points_value        integer,
  probability         numeric(5,2) not null default 0,
  is_dark             boolean not null default false,
  sort_order          integer not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  constraint probability_range check (probability >= 0 and probability <= 100)
);

-- -----------------------------------------------------------------------------
-- TABLE: activity_logs (append-only)
-- -----------------------------------------------------------------------------
create table public.activity_logs (
  id                  uuid primary key default gen_random_uuid(),
  profile_id          uuid not null references public.profiles(id) on delete cascade,
  type                public.activity_type not null,
  points_delta        integer not null,
  description         text,
  created_by          uuid references public.profiles(id),
  created_at          timestamptz not null default now()
);

create index idx_activity_logs_profile_id on public.activity_logs(profile_id);
create index idx_activity_logs_profile_created on public.activity_logs(profile_id, created_at desc);

-- -----------------------------------------------------------------------------
-- TABLE: user_rewards
-- -----------------------------------------------------------------------------
create table public.user_rewards (
  id                  uuid primary key default gen_random_uuid(),
  profile_id          uuid not null references public.profiles(id) on delete cascade,
  source              public.reward_source not null,
  reward_id           uuid references public.rewards(id) on delete set null,
  wheel_segment_id    uuid references public.wheel_segments(id) on delete set null,
  label               text not null,
  status              public.reward_status not null default 'pending',
  points_spent        integer not null default 0,
  expires_at          timestamptz,
  validated_by        uuid references public.profiles(id),
  validated_at        timestamptz,
  created_at          timestamptz not null default now()
);

create index idx_user_rewards_profile_id on public.user_rewards(profile_id);
create index idx_user_rewards_status on public.user_rewards(status);

-- -----------------------------------------------------------------------------
-- TABLE: promotions
-- -----------------------------------------------------------------------------
create table public.promotions (
  id                  uuid primary key default gen_random_uuid(),
  title               text not null,
  description         text,
  is_active           boolean not null default false,
  starts_at           timestamptz,
  ends_at             timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- =============================================================================
-- FONCTIONS HELPER
-- =============================================================================

create or replace function public.current_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin_or_above()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_role() in ('admin', 'superadmin'), false)
$$;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_business_settings_updated_at before update on public.business_settings
  for each row execute function public.set_updated_at();
create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trg_rewards_updated_at before update on public.rewards
  for each row execute function public.set_updated_at();
create trigger trg_wheel_segments_updated_at before update on public.wheel_segments
  for each row execute function public.set_updated_at();
create trigger trg_promotions_updated_at before update on public.promotions
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.user_role;
  v_bonus integer;
  v_profile_id uuid;
  v_is_first_user boolean;
begin
  select not exists(select 1 from public.profiles) into v_is_first_user;
  v_role := case when v_is_first_user then 'admin' else 'client' end;

  insert into public.profiles (id, role, full_name, email)
  values (new.id, v_role, new.raw_user_meta_data->>'full_name', new.email)
  returning id into v_profile_id;

  if v_role = 'client' then
    select welcome_bonus_points into v_bonus from public.business_settings limit 1;
    if coalesce(v_bonus, 0) > 0 then
      insert into public.activity_logs (profile_id, type, points_delta, description)
      values (v_profile_id, 'welcome_bonus', v_bonus, 'Bonus de bienvenue');
    end if;
  end if;

  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.apply_points_delta()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set points_balance = points_balance + new.points_delta
  where id = new.profile_id;

  return new;
end;
$$;

create trigger trg_activity_logs_apply_delta
  after insert on public.activity_logs
  for each row execute function public.apply_points_delta();

create or replace function public.check_wheel_probability_total()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_total numeric(6,2);
begin
  select coalesce(sum(probability), 0) into v_total
  from public.wheel_segments
  where id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid);

  if tg_op <> 'DELETE' then
    v_total := v_total + new.probability;
  end if;

  if v_total > 100 then
    raise exception 'La somme des probabilités de la roue dépasse 100%% (actuellement %.2f%%)', v_total;
  end if;

  return coalesce(new, old);
end;
$$;

create trigger trg_wheel_segments_check_total
  before insert or update on public.wheel_segments
  for each row execute function public.check_wheel_probability_total();

create or replace function public.get_current_tier(p_profile_id uuid)
returns public.loyalty_tiers
language sql
stable
security definer
set search_path = public
as $$
  select t.*
  from public.loyalty_tiers t
  join public.profiles p on true
  where p.id = p_profile_id
    and t.min_points <= p.points_balance
  order by t.min_points desc
  limit 1
$$;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

alter table public.business_settings enable row level security;
alter table public.profiles enable row level security;
alter table public.loyalty_tiers enable row level security;
alter table public.rewards enable row level security;
alter table public.wheel_segments enable row level security;
alter table public.activity_logs enable row level security;
alter table public.user_rewards enable row level security;
alter table public.promotions enable row level security;

create policy "business_settings_select_public"
  on public.business_settings for select using (true);
create policy "business_settings_update_admin"
  on public.business_settings for update using (public.is_admin_or_above());

create policy "profiles_select_own"
  on public.profiles for select using (id = auth.uid());
create policy "profiles_select_admin"
  on public.profiles for select using (public.is_admin_or_above());
create policy "profiles_update_own"
  on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles_update_admin"
  on public.profiles for update using (public.is_admin_or_above());

create policy "loyalty_tiers_select_public"
  on public.loyalty_tiers for select using (true);
create policy "loyalty_tiers_write_admin"
  on public.loyalty_tiers for all using (public.is_admin_or_above()) with check (public.is_admin_or_above());

create policy "rewards_select_public"
  on public.rewards for select using (true);
create policy "rewards_write_admin"
  on public.rewards for all using (public.is_admin_or_above()) with check (public.is_admin_or_above());

create policy "wheel_segments_select_public"
  on public.wheel_segments for select using (true);
create policy "wheel_segments_write_admin"
  on public.wheel_segments for all using (public.is_admin_or_above()) with check (public.is_admin_or_above());

create policy "promotions_select_public"
  on public.promotions for select using (true);
create policy "promotions_write_admin"
  on public.promotions for all using (public.is_admin_or_above()) with check (public.is_admin_or_above());

create policy "activity_logs_select_own"
  on public.activity_logs for select using (profile_id = auth.uid());
create policy "activity_logs_select_admin"
  on public.activity_logs for select using (public.is_admin_or_above());
create policy "activity_logs_insert_admin"
  on public.activity_logs for insert with check (public.is_admin_or_above());

create policy "user_rewards_select_own"
  on public.user_rewards for select using (profile_id = auth.uid());
create policy "user_rewards_select_admin"
  on public.user_rewards for select using (public.is_admin_or_above());
create policy "user_rewards_insert_own"
  on public.user_rewards for insert with check (profile_id = auth.uid());
create policy "user_rewards_update_admin"
  on public.user_rewards for update using (public.is_admin_or_above());

revoke execute on function public.current_role() from public, anon, authenticated;
revoke execute on function public.is_admin_or_above() from public, anon, authenticated;
revoke execute on function public.get_current_tier(uuid) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.apply_points_delta() from public, anon, authenticated;
revoke execute on function public.check_wheel_probability_total() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.prevent_multiple_business_settings() from public, anon, authenticated;

-- =============================================================================
-- SCAN EN SALON + LOGIQUE DE TIRAGE ROUE
-- =============================================================================

alter table public.business_settings
  add constraint scan_cooldown_positive check (scan_cooldown_minutes >= 0);

create table public.scan_events (
  id                  uuid primary key default gen_random_uuid(),
  profile_id          uuid not null references public.profiles(id) on delete cascade,
  created_at          timestamptz not null default now(),
  wheel_segment_id    uuid references public.wheel_segments(id) on delete set null,
  played              boolean not null default false
);

create index idx_scan_events_profile_created on public.scan_events(profile_id, created_at desc);

alter table public.scan_events enable row level security;

create policy "scan_events_select_own"
  on public.scan_events for select using (profile_id = auth.uid());
create policy "scan_events_select_admin"
  on public.scan_events for select using (public.is_admin_or_above());

create or replace function public.redeem_scan(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_settings record;
  v_last_scan timestamptz;
  v_scan_id uuid;
begin
  if v_uid is null then raise exception 'Non authentifié'; end if;

  select scan_token, scan_cooldown_minutes into v_settings from public.business_settings limit 1;

  if v_settings.scan_token is null or v_settings.scan_token <> p_token then
    raise exception 'QR code invalide';
  end if;

  perform pg_advisory_xact_lock(hashtext(v_uid::text));

  select max(created_at) into v_last_scan from public.scan_events where profile_id = v_uid;

  if v_last_scan is not null
     and v_last_scan > now() - make_interval(mins => v_settings.scan_cooldown_minutes) then
    raise exception 'COOLDOWN';
  end if;

  insert into public.scan_events (profile_id) values (v_uid) returning id into v_scan_id;
  return v_scan_id;
end;
$$;

create or replace function public.play_wheel(p_scan_id uuid)
returns public.wheel_segments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_scan record;
  v_rand numeric;
  v_cumulative numeric := 0;
  v_total numeric;
  v_segment public.wheel_segments;
begin
  if v_uid is null then raise exception 'Non authentifié'; end if;

  select * into v_scan from public.scan_events
  where id = p_scan_id and profile_id = v_uid for update;

  if v_scan is null then raise exception 'Tirage introuvable'; end if;
  if v_scan.played then raise exception 'Ce tirage a déjà été utilisé'; end if;

  select coalesce(sum(probability), 0) into v_total from public.wheel_segments;
  if v_total <= 0 then raise exception 'Aucun segment configuré'; end if;

  v_rand := random() * v_total;
  for v_segment in select * from public.wheel_segments order by sort_order, id loop
    v_cumulative := v_cumulative + v_segment.probability;
    if v_rand <= v_cumulative then exit; end if;
  end loop;

  update public.scan_events set played = true, wheel_segment_id = v_segment.id where id = p_scan_id;

  if v_segment.type = 'points' then
    insert into public.activity_logs (profile_id, type, points_delta, description)
    values (v_uid, 'wheel_spin', coalesce(v_segment.points_value, 0), 'Tirage à la roue : ' || v_segment.label);
  else
    insert into public.user_rewards (profile_id, source, wheel_segment_id, label, status, points_spent)
    values (v_uid, 'wheel', v_segment.id, v_segment.label, 'pending', 0);
    insert into public.activity_logs (profile_id, type, points_delta, description)
    values (v_uid, 'wheel_spin', 0, 'Tirage à la roue : ' || v_segment.label);
  end if;

  return v_segment;
end;
$$;

revoke execute on function public.redeem_scan(text) from public, anon;
revoke execute on function public.play_wheel(uuid) from public, anon;
grant execute on function public.redeem_scan(text) to authenticated;
grant execute on function public.play_wheel(uuid) to authenticated;

-- =============================================================================
-- STORAGE : bucket public "avatars" pour les photos de profil
-- =============================================================================
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatars_insert_own" on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars_update_own" on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars_delete_own" on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars_select_public" on storage.objects for select
  using (bucket_id = 'avatars');
