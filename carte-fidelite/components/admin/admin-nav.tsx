"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/auth/actions";

const TABS = [
  { label: "Branding", path: "/admin/branding" },
  { label: "Tableau de bord", path: "/admin" },
  { label: "Catalogue", path: "/admin/catalogue" },
  { label: "Roue", path: "/admin/wheel" },
  { label: "Tirages", path: "/admin/draws" },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div
      style={{
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        position: "sticky",
        top: 0,
        background: "var(--color-background)",
        zIndex: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 4,
          padding: "14px 20px 0",
          overflowX: "auto",
        }}
      >
        {TABS.map((tab) => {
          const isActive = pathname === tab.path;
          return (
            <Link
              key={tab.path}
              href={tab.path}
              style={{
                padding: "8px 14px",
                fontSize: 13.5,
                fontWeight: 500,
                whiteSpace: "nowrap",
                color: isActive ? "var(--color-primary)" : "rgba(255,255,255,0.55)",
                borderBottom: isActive
                  ? "2px solid var(--color-primary)"
                  : "2px solid transparent",
              }}
            >
              {tab.label}
            </Link>
          );
        })}
        <div style={{ marginLeft: "auto", flexShrink: 0 }}>
          <form action={logout}>
            <button
              type="submit"
              style={{
                background: "none",
                border: "none",
                padding: "8px 14px",
                fontSize: 13.5,
                color: "#e08a6a",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Déconnexion
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
