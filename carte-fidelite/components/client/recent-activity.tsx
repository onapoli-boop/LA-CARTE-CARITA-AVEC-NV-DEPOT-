import Link from "next/link";
import type { ActivityLogEntry } from "@/lib/settings/get-home-data";

const TYPE_LABELS: Record<string, string> = {
  purchase: "Achat en institut",
  wheel_spin: "Tirage à la roue",
  welcome_bonus: "Bienvenue",
  reward_redeem: "Récompense échangée",
  manual_adjustment: "Ajustement",
  tier_upgrade: "Palier atteint",
};

export function RecentActivity({ entries }: { entries: ActivityLogEntry[] }) {
  if (entries.length === 0) return null;
  const latest = entries[0];

  return (
    <div>
      <div style={{ marginTop: 30, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontFamily: "var(--font-heading)", fontSize: 19, fontWeight: 600 }}>
          Dernières activités
        </div>
        <Link href="/activity" style={{ color: "var(--color-secondary)", fontSize: 14 }}>
          Voir tout
        </Link>
      </div>

      <Link
        href="/activity"
        style={{
          marginTop: 16,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          padding: 16,
          display: "flex",
          alignItems: "center",
          gap: 14,
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: "1px solid rgba(205,167,106,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8" stroke="var(--color-secondary)" strokeWidth="1.3" />
            <path d="M10 2v8l6 3" stroke="var(--color-secondary)" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 500 }}>
            {TYPE_LABELS[latest.type] ?? latest.type}
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
            {latest.points_delta >= 0 ? "+" : ""}
            {latest.points_delta} points remportés
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
            {new Date(latest.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
          </div>
          <div style={{ fontSize: 15, color: "var(--color-primary)", fontWeight: 600, marginTop: 2 }}>
            {latest.points_delta >= 0 ? "+" : ""}
            {latest.points_delta} pts
          </div>
        </div>
      </Link>
    </div>
  );
}
