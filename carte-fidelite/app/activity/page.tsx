import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const TYPE_LABELS: Record<string, string> = {
  purchase: "Achat en institut",
  wheel_spin: "Tirage à la roue",
  welcome_bonus: "Bonus de bienvenue",
  reward_redeem: "Récompense échangée",
  manual_adjustment: "Ajustement",
  tier_upgrade: "Palier atteint",
};

export default async function ActivityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: logs } = await supabase
    .from("activity_logs")
    .select("id, type, points_delta, description, created_at")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div style={{ minHeight: "100vh", padding: "60px 24px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        <Link
          href="/"
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            border: "1px solid var(--color-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 600 }}>Mes activités</h1>
      </div>

      {!logs || logs.length === 0 ? (
        <p style={{ fontSize: 14, opacity: 0.5 }}>Aucune activité pour le moment.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {logs.map((log) => (
            <div
              key={log.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "15px 0",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 500 }}>
                  {log.description ?? TYPE_LABELS[log.type] ?? log.type}
                </div>
                <div style={{ fontSize: 13, opacity: 0.45, marginTop: 2 }}>
                  {new Date(log.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: log.points_delta >= 0 ? "var(--color-primary)" : "rgba(255,255,255,0.4)",
                  whiteSpace: "nowrap",
                }}
              >
                {log.points_delta >= 0 ? "+" : ""}
                {log.points_delta} pts
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
