export function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <div style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 600, color: "var(--color-primary)" }}>
        {value}
      </div>
      <div style={{ fontSize: 12.5, opacity: 0.7 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, opacity: 0.4 }}>{sub}</div>}
    </div>
  );
}
