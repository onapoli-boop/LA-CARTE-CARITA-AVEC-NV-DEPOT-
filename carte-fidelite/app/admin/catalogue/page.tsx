import { createClient } from "@/lib/supabase/server";
import { RewardRow } from "@/components/admin/reward-row";
import { AddRewardButton } from "@/components/admin/add-reward-button";

export default async function AdminCataloguePage() {
  const supabase = await createClient();

  const { data: rewards } = await supabase
    .from("rewards")
    .select("id, category, name, points_cost, is_active")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 600, marginBottom: 6 }}>
        Catalogue
      </h1>
      <p style={{ fontSize: 13.5, opacity: 0.55, marginTop: 0, marginBottom: 24 }}>
        Les modifications sont enregistrées automatiquement et visibles immédiatement côté client.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {(rewards ?? []).map((reward) => (
          <RewardRow key={reward.id} reward={reward} />
        ))}
        <AddRewardButton />
      </div>
    </div>
  );
}
