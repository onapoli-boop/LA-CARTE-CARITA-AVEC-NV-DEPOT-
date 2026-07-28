import { createClient } from "@/lib/supabase/server";
import { WheelSegmentRow } from "@/components/admin/wheel-segment-row";
import { TotalProbabilityBadge } from "@/components/admin/total-probability-badge";
import { AddSegmentButton } from "@/components/admin/add-segment-button";

export default async function AdminWheelPage() {
  const supabase = await createClient();

  const { data: segments } = await supabase
    .from("wheel_segments")
    .select("id, label, type, points_value, probability")
    .order("sort_order", { ascending: true });

  const total = (segments ?? []).reduce((sum, s) => sum + Number(s.probability), 0);

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 600, marginBottom: 6 }}>
        Roue de la chance
      </h1>
      <p style={{ fontSize: 13.5, opacity: 0.55, marginTop: 0, marginBottom: 16 }}>
        La somme des probabilités doit atteindre 100% pour que la roue soit cohérente.
      </p>

      <div style={{ marginBottom: 20 }}>
        <TotalProbabilityBadge total={total} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {(segments ?? []).map((segment) => (
          <WheelSegmentRow key={segment.id} segment={segment} />
        ))}
        <AddSegmentButton disabled={(segments?.length ?? 0) >= 8} />
      </div>
    </div>
  );
}
