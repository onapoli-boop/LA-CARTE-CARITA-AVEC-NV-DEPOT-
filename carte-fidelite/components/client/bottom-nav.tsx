"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function BottomNav({ pendingGainsCount = 0 }: { pendingGainsCount?: number }) {
  const pathname = usePathname();

  const color = (path: string) =>
    pathname === path ? "var(--color-primary)" : "rgba(255,255,255,0.45)";

  return (
    <div
      style={{
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        padding: "12px 8px 26px",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        background: "var(--color-background)",
      }}
    >
      <Link
        href="/"
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, color: color("/") }}
      >
        <svg width="22" height="17" viewBox="0 0 22 17" fill="none">
          <rect x="1" y="1" width="20" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
          <rect x="1" y="5" width="20" height="3" fill="currentColor" />
        </svg>
        <span style={{ fontSize: 11, fontWeight: 500 }}>Ma carte</span>
      </Link>

      <Link
        href="/catalogue"
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, color: color("/catalogue") }}
      >
        <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
          <path d="M2 6h15l-1.2 11.5a1 1 0 01-1 .5H4.2a1 1 0 01-1-.9L2 6z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M6 6V4.5a3.5 3.5 0 017 0V6" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span style={{ fontSize: 11, fontWeight: 500 }}>Catalogue</span>
      </Link>

      <Link
        href="/gains"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 5,
          color: color("/gains"),
          position: "relative",
        }}
      >
        <svg width="20" height="19" viewBox="0 0 20 19" fill="none">
          <rect x="1" y="7" width="18" height="11" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <path d="M1 10h18" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 7v11" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M10 7C7.3 7 6.2 5.6 6.2 4.4C6.2 3.3 7.1 2.4 8.2 2.4C9.6 2.4 10 4.7 10 7z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M10 7c2.7 0 3.8-1.4 3.8-2.6c0-1.1-.9-2-2-2C10.4 2.4 10 4.7 10 7z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
        {pendingGainsCount > 0 && (
          <div
            style={{
              position: "absolute",
              top: -4,
              right: -8,
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "var(--color-primary)",
              color: "#20160a",
              fontSize: 10,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {pendingGainsCount}
          </div>
        )}
        <span style={{ fontSize: 11, fontWeight: 500 }}>Mes gains</span>
      </Link>
    </div>
  );
}
