import type { LoyaltyTier } from "@/lib/settings/get-home-data";

export function TierProgress({
  tiers,
  currentTier,
}: {
  tiers: LoyaltyTier[];
  currentTier: LoyaltyTier | null;
}) {
  return (
    <div>
      <div style={{ marginTop: 30, fontFamily: "var(--font-heading)", fontSize: 19, fontWeight: 600 }}>
        Mon statut
      </div>
      <div style={{ display: "flex", alignItems: "center", marginTop: 16 }}>
        {tiers.map((tier, i) => {
          const isActive = currentTier?.id === tier.id;
          const hasLine = i < tiers.length - 1;
          return (
            <div key={tier.id} style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: isActive ? "rgba(205,167,106,0.15)" : "rgba(255,255,255,0.05)",
                    border: `1.5px solid ${isActive ? "var(--color-primary)" : "rgba(255,255,255,0.15)"}`,
                    fontSize: 20,
                    color: isActive ? "var(--color-primary)" : "rgba(255,255,255,0.6)",
                  }}
                >
                  {tier.icon_glyph}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    color: isActive ? "var(--color-primary)" : "rgba(255,255,255,0.6)",
                  }}
                >
                  {tier.name}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{tier.min_points} pts</div>
              </div>
              {hasLine && (
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.15)", margin: "0 -4px -26px" }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
