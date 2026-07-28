import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export interface LoyaltyTier {
  id: string;
  name: string;
  min_points: number;
  icon_glyph: string | null;
  sort_order: number;
}

export interface ClientProfile {
  id: string;
  full_name: string | null;
  points_balance: number;
  member_since: string;
}

export interface ActivityLogEntry {
  id: string;
  type: string;
  points_delta: number;
  description: string | null;
  created_at: string;
}

export interface HomeData {
  profile: ClientProfile;
  tiers: LoyaltyTier[];
  currentTier: LoyaltyTier | null;
  nextTier: LoyaltyTier | null;
  recentActivity: ActivityLogEntry[];
  activePromotion: { title: string; description: string | null } | null;
}

export const getHomeData = cache(async (): Promise<HomeData | null> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [profileRes, tiersRes, activityRes, promoRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, points_balance, member_since")
      .eq("id", user.id)
      .single(),
    supabase
      .from("loyalty_tiers")
      .select("id, name, min_points, icon_glyph, sort_order")
      .order("sort_order", { ascending: true }),
    supabase
      .from("activity_logs")
      .select("id, type, points_delta, description, created_at")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("promotions")
      .select("title, description")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle(),
  ]);

  if (!profileRes.data) return null;

  const tiers = tiersRes.data ?? [];
  const balance = profileRes.data.points_balance;
  const sorted = [...tiers].sort((a, b) => a.min_points - b.min_points);
  const currentTier = [...sorted].reverse().find((t) => t.min_points <= balance) ?? null;
  const nextTier = sorted.find((t) => t.min_points > balance) ?? null;

  return {
    profile: profileRes.data,
    tiers: sorted,
    currentTier,
    nextTier,
    recentActivity: activityRes.data ?? [],
    activePromotion: promoRes.data ?? null,
  };
});
