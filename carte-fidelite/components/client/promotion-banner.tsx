export function PromotionBanner({
  promotion,
}: {
  promotion: { title: string; description: string | null };
}) {
  return (
    <div
      style={{
        marginTop: 30,
        background: "linear-gradient(135deg, rgba(205,167,106,0.14), rgba(205,167,106,0.04))",
        border: "1px solid rgba(205,167,106,0.5)",
        borderRadius: 18,
        padding: 20,
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "rgba(205,167,106,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.6">
          <path d="M20.6 12.6L12 21.2 2.8 12 2.8 3.2 12 3.2z" />
          <circle cx="7.3" cy="7.8" r="1" fill="var(--color-primary)" />
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.08em",
            color: "var(--color-primary)",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          Promotion du moment
        </div>
        <div style={{ fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 600, marginTop: 4 }}>
          {promotion.title}
        </div>
        {promotion.description && (
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4, lineHeight: 1.4 }}>
            {promotion.description}
          </div>
        )}
      </div>
    </div>
  );
}
