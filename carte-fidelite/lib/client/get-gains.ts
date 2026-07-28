import { createClient } from "@/lib/supabase/server";

export interface GainItem {
  id: string;
  source: "wheel" | "catalogue";
  label: string;
  points_spent: number;
  status: "pending" | "available" | "used" | "expired";
  created_at: string;
}

export async function getGains(): Promise<GainItem[] | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("user_rewards")
    .select("id, source, label, points_spent, status, created_at")
    .eq("profile_id", user.id)
    .neq("status", "expired")
    .order("created_at", { ascending: false });

  return (data ?? []) as GainItem[];
}
