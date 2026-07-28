import Link from "next/link";

export function QrScanCard() {
  return (
    <Link
      href="/scan"
      style={{
        marginTop: 16,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 18,
        padding: "18px 18px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          border: "1px solid rgba(205,167,106,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--color-secondary)" strokeWidth="1.4">
          <rect x="1" y="1" width="6" height="6" rx="1" />
          <rect x="13" y="1" width="6" height="6" rx="1" />
          <rect x="1" y="13" width="6" height="6" rx="1" />
          <rect x="13" y="13" width="6" height="6" rx="1" />
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 500 }}>Scanner le QR code en salon</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
          Tentez votre chance à la roue
        </div>
      </div>
      <svg width="8" height="14" viewBox="0 0 8 14" style={{ flexShrink: 0 }}>
        <path d="M1 1l6 6-6 6" stroke="var(--color-secondary)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}
