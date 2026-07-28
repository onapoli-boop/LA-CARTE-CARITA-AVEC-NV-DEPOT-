import { redirect } from "next/navigation";
import { getGains } from "@/lib/client/get-gains";
import { BottomNav } from "@/components/client/bottom-nav";

const STATUS_STYLE: Record<string, { label: string; bg: string; color: string }> = {
  pending: { label: "À valider", bg: "rgba(224,138,106,0.15)", color: "#e0a88a" },
  available: { label: "Disponible", bg: "rgba(224,187,126,0.15)", color: "var(--color-primary)" },
  used: { label: "Utilisé", bg: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" },
};

function detailLine(g: { source: string; points_spent: number; created_at: string }): string {
  const date = new Date(g.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
  if (g.source === "wheel") return `Gagné à la roue · ${date}`;
  return `Échange catalogue · ${g.points_spent} pts`;
}

export default async function GainsPage() {
  const gains = await getGains();
  if (!gains) redirect("/login");

  const newCount = gains.filter((g) => g.status === "pending" || g.status === "available").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div style={{ flex: 1, overflow: "auto", padding: "60px 24px 30px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 26, fontWeight: 600 }}>Mes gains</h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
          {newCount > 0 ? `${newCount} gain${newCount > 1 ? "s" : ""} à découvrir` : "Vos récompenses"}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 24 }}>
          {gains.length === 0 ? (
            <p style={{ fontSize: 14, opacity: 0.5 }}>
              Aucun gain pour le moment. Tentez votre chance à la roue !
            </p>
          ) : (
            gains.map((g) => {
              const st = STATUS_STYLE[g.status] ?? STATUS_STYLE.used;
              return (
                <div
                  key={g.id}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 18,
                    padding: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      border: "1.5px solid var(--color-secondary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--color-secondary)" strokeWidth="1.3">
                      <rect x="2" y="7" width="16" height="11" rx="1" />
                      <path d="M2 10h16" />
                      <path d="M10 7v11" />
                      <path d="M10 7C7 7 6 5.5 6 4.2C6 3 7 2 8.2 2C9.7 2 10 4.5 10 7z" />
                      <path d="M10 7c3 0 4-1.5 4-2.8C14 3 13 2 11.8 2C10.3 2 10 4.5 10 7z" />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 500 }}>{g.label}</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
                      {detailLine(g)}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "6px 12px",
                      borderRadius: 20,
                      background: st.bg,
                      color: st.color,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {st.label}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      <BottomNav pendingGainsCount={newCount} />
    </div>
  );
}
