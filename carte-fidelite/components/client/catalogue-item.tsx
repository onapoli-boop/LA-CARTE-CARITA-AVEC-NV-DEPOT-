"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSettings } from "@/components/providers/settings-provider";
import { requestExchange } from "@/lib/client/exchange-actions";
import type { CatalogueItem } from "@/lib/client/get-catalogue";

const CATEGORY_GLYPH: Record<string, string> = {
  Soins: "✦",
  Coiffure: "✂",
  Produits: "❖",
  "Bien-être": "♥",
};

export function CatalogueItemCard({
  item,
  pointsBalance,
}: {
  item: CatalogueItem;
  pointsBalance: number;
}) {
  const settings = useSettings();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canAfford = pointsBalance >= item.points_cost;
  const glyph = CATEGORY_GLYPH[item.category ?? ""] ?? "✦";

  function askExchange() {
    startTransition(async () => {
      const res = await requestExchange(item.id);
      if (res.error) {
        setError(res.error);
        return;
      }
      // Rediriger vers le scan en passant la récompense à échanger.
      router.push(`/scan?exchange=${item.id}`);
    });
  }

  return (
    <>
      <button
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 18,
          padding: 14,
          display: "flex",
          gap: 14,
          alignItems: "center",
          width: "100%",
          cursor: "pointer",
          color: "inherit",
          textAlign: "left",
        }}
      >
        <div
          style={{
            width: 68,
            height: 68,
            borderRadius: 12,
            flexShrink: 0,
            background: "linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 25%, transparent), color-mix(in srgb, var(--color-secondary) 10%, transparent))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-secondary)",
            fontSize: 22,
          }}
        >
          {glyph}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.06em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
            {item.category}
          </div>
          <div style={{ fontSize: 15, fontWeight: 500, marginTop: 3 }}>{item.name}</div>
          <div style={{ fontSize: 14, color: "var(--color-primary)", fontWeight: 600, marginTop: 5 }}>
            {item.points_cost} {settings.points_label}
          </div>
        </div>
        <svg width="8" height="14" viewBox="0 0 8 14" style={{ flexShrink: 0 }}>
          <path d="M1 1l6 6-6 6" stroke="var(--color-secondary)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "color-mix(in srgb, var(--color-background) 92%, #fff)",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: "28px 24px 34px",
              width: "100%",
              maxWidth: 430,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 600 }}>
              {item.name}
            </div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
              Coût : {item.points_cost} {settings.points_label} · Votre solde : {pointsBalance}
            </div>

            {!canAfford && (
              <div style={{ fontSize: 13.5, color: "#e08a6a", marginTop: 4 }}>
                Il vous manque {item.points_cost - pointsBalance} {settings.points_label}.
              </div>
            )}
            {error && <div style={{ fontSize: 13.5, color: "#e08a6a", marginTop: 4 }}>{error}</div>}

            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 6, lineHeight: 1.5 }}>
              Vos points seront débités uniquement après validation en salon. Vous
              scannerez le QR au comptoir pour finaliser.
            </div>

            <button
              onClick={askExchange}
              disabled={!canAfford || isPending}
              style={{
                marginTop: 14,
                background: canAfford
                  ? "linear-gradient(135deg, var(--color-primary), var(--color-secondary))"
                  : "rgba(255,255,255,0.1)",
                color: canAfford ? "#20160a" : "rgba(255,255,255,0.4)",
                fontWeight: 600,
                fontSize: 15,
                padding: "14px",
                borderRadius: 28,
                border: "none",
                cursor: canAfford && !isPending ? "pointer" : "default",
              }}
            >
              {isPending ? "..." : "Demander l'échange"}
            </button>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.5)",
                fontSize: 14,
                padding: 10,
                cursor: "pointer",
              }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </>
  );
}
