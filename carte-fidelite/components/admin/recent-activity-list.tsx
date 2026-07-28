import type { RecentActivityRow } from "@/lib/admin/get-dashboard-data";

export function RecentActivityList({ entries }: { entries: RecentActivityRow[] }) {
  if (entries.length === 0) {
    return <p style={{ fontSize: 13, opacity: 0.5 }}>Aucune activité pour le moment.</p>;
  }

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      {entries.map((entry, i) => (
        <div
          key={entry.id}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "13px 16px",
            borderBottom: i < entries.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{entry.client_name}</div>
            <div style={{ fontSize: 12.5, opacity: 0.5, marginTop: 1 }}>{entry.type}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 13.5,
                fontWeight: 600,
                color: entry.points_delta >= 0 ? "var(--color-primary)" : "rgba(255,255,255,0.4)",
              }}
            >
              {entry.points_delta >= 0 ? "+" : ""}
              {entry.points_delta} pts
            </div>
            <div style={{ fontSize: 11.5, opacity: 0.4, marginTop: 1 }}>
              {new Date(entry.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
