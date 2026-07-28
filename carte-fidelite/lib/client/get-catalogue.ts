import { createClient } from "@/lib/supabase/server";

export interface CatalogueItem {
  id: string;
  category: string | null;
  name: string;
  points_cost: number;
}

export interface CatalogueData {
  items: CatalogueItem[];
  pointsBalance: number;
}

export async function getCatalogueData(): Promise<CatalogueData | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [itemsRes, profileRes] = await Promise.all([
    supabase
      .from("rewards")
      .select("id, category, name, points_cost")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase.from("profiles").select("points_balance").eq("id", user.id).single(),
  ]);

  return {
    items: itemsRes.data ?? [],
    pointsBalance: profileRes.data?.points_balance ?? 0,
  };
}
