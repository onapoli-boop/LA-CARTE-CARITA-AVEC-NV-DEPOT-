"use client";

import { useState, useRef, useTransition } from "react";
import { validateReward, cancelReward } from "@/lib/admin/actions";
import type { DrawRow } from "@/lib/admin/get-draws";

/** Horodatage relatif façon "Aujourd'hui 14:32" / "Hier" / date courte. */
function relativeTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  const hm = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  if (sameDay) return `Aujourd'hui ${hm}`;
  if (isYesterday) return "Hier";
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

const SOURCE_SUFFIX: Record<DrawRow["source"], string> = {
  wheel: " (roue)",
  catalogue: "",
};

export function DrawCard({ draw }: { draw: DrawRow }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isValidated = draw.status === "used";

  function validate() {
    if (isValidated) return;
    startTransition(async () => {
      const res = await validateReward(draw.id);
      setError(res.error ?? null);
    });
  }

  // Appui long (600ms) sur une ligne EN ATTENTE => proposer l'annulation.
  function startLongPress() {
    if (isValidated) return;
    longPressTimer.current = setTimeout(() => {
      if (confirm(`Annuler le gain « ${draw.label} » de ${draw.client_name} ?`)) {
        startTransition(async () => {
          const res = await cancelReward(draw.id);
          setError(res.error ?? null);
        });
      }
    }, 600);
  }
  function cancelLongPress() {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  }

  return (
    <div
      onMouseDown={startLongPress}
      onMouseUp={cancelLongPress}
      onMouseLeave={cancelLongPress}
      onTouchStart={startLongPress}
      onTouchEnd={cancelLongPress}
      style={{
        background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 18,
        padding: "18px 20px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        opacity: isPending ? 0.55 : isValidated ? 0.65 : 1,
        transition: "opacity 0.15s",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 17, fontWeight: 600 }}>{draw.client_name}</div>
        <div style={{ fontSize: 14.5, color: "rgba(255,255,255,0.55)", marginTop: 3 }}>
          {draw.label}
          {SOURCE_SUFFIX[draw.source]}
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
          {relativeTime(draw.validated_at ?? draw.created_at)}
        </div>
        {error && <div style={{ fontSize: 12.5, color: "#e08a6a", marginTop: 6 }}>{error}</div>}
      </div>

      <button
        onClick={validate}
        disabled={isPending || isValidated}
        style={{
          flexShrink: 0,
          padding: "11px 22px",
          borderRadius: 24,
          border: "none",
          fontSize: 14.5,
          fontWeight: 600,
          cursor: isValidated ? "default" : "pointer",
          background: isValidated
            ? "rgba(255,255,255,0.08)"
            : "linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 55%, #000), color-mix(in srgb, var(--color-secondary) 40%, #000))",
          color: isValidated ? "rgba(255,255,255,0.5)" : "var(--color-primary)",
        }}
      >
        {isValidated ? "Validé" : "Valider"}
      </button>
    </div>
  );
}
