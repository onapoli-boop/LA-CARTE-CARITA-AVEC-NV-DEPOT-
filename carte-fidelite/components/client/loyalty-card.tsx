import { useSettings } from "@/components/providers/settings-provider";
import type { ClientProfile, LoyaltyTier } from "@/lib/settings/get-home-data";

export function LoyaltyCard({
  profile,
  nextTier,
}: {
  profile: ClientProfile;
  nextTier: LoyaltyTier | null;
}) {
  const settings = useSettings();
  const mainWord = (settings.brand_word ?? settings.name).toUpperCase();
  const subWord = settings.brand_subword?.toUpperCase() ?? "";
  const initials = settings.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const progressPct = nextTier
    ? Math.min(100, Math.round((profile.points_balance / nextTier.min_points) * 100))
    : 100;

  return (
    <div
      style={{
        marginTop: 22,
        background:
          "linear-gradient(135deg,#26201a 0%,#171310 22%,#0d0a07 45%,#1c1712 60%,#0d0a07 78%,#211b15 100%)",
        border: "1px solid rgba(205,167,106,0.5)",
        borderRadius: 22,
        padding: "20px 22px",
        height: 200,
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
        boxShadow:
          "0 22px 40px -12px rgba(0,0,0,0.7), 0 4px 10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.6), inset 1px 0 0 rgba(255,255,255,0.04)",
      }}
    >
      <div
        style={{
          position: "absolute",
          right: -10,
          top: 60,
          fontFamily: "var(--font-heading)",
          fontSize: 150,
          color: "rgba(255,255,255,0.03)",
          lineHeight: 1,
        }}
      >
        {initials}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontFamily: "var(--font-heading)", fontSize: 22, color: "var(--color-secondary)" }}>
            {mainWord[0]}
          </span>
          <span style={{ fontFamily: "var(--font-heading)", fontSize: 19, letterSpacing: "0.08em" }}>
            {mainWord}
          </span>
        </div>
        <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
          <path d="M13 2c3 2 5 5 5 6s-2 4-5 6" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.5" />
          <path d="M10 4c2.2 1.5 3.6 3 3.6 4s-1.4 2.5-3.6 4" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.75" />
          <path d="M7 6c1.2 1 2 2 2 2s-.8 1-2 2" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </svg>
      </div>

      {subWord && (
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "var(--color-secondary)", marginTop: 2 }}>
          {subWord}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 10, position: "relative" }}>
        <div
          style={{
            width: 34,
            height: 25,
            borderRadius: 6,
            background: "linear-gradient(160deg, var(--color-primary), var(--color-secondary))",
            position: "relative",
            flexShrink: 0,
          }}
        >
          <div style={{ position: "absolute", inset: 4, border: "1px solid rgba(0,0,0,0.35)", borderRadius: 3 }} />
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 34, fontWeight: 600, lineHeight: 1 }}>
            {profile.points_balance}
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>
            {settings.points_label}
          </div>
        </div>
      </div>

      {nextTier && (
        <div style={{ marginTop: 10, position: "relative" }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Prochain palier</div>
          <div style={{ fontSize: 14, color: "var(--color-primary)", marginTop: 1, fontWeight: 500 }}>
            {nextTier.name}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 7 }}>
            <div style={{ flex: 1, height: 7, borderRadius: 4, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
              <div
                style={{
                  width: `${progressPct}%`,
                  height: "100%",
                  borderRadius: 4,
                  background: "linear-gradient(90deg, var(--color-secondary), var(--color-primary))",
                }}
              />
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", whiteSpace: "nowrap" }}>
              {profile.points_balance} / {nextTier.min_points} pts
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
