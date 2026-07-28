"use client";

import { useState, useTransition } from "react";
import {
  bumpProbability,
  setSegmentLabel,
  setSegmentType,
  setSegmentPointsValue,
  removeWheelSegment,
} from "@/lib/admin/actions";

export interface WheelSegmentData {
  id: string;
  label: string;
  type: "points" | "gift" | "discount";
  points_value: number | null;
  probability: number;
}

const TYPE_OPTIONS: { value: WheelSegmentData["type"]; label: string }[] = [
  { value: "points", label: "★ Points" },
  { value: "gift", label: "🎁 Cadeau" },
  { value: "discount", label: "🏷 Réduction" },
];

export function WheelSegmentRow({ segment }: { segment: WheelSegmentData }) {
  const [isPending, startTransition] = useTransition();
  const [label, setLabel] = useState(segment.label);
  const [error, setError] = useState<string | null>(null);

  function bump(delta: number) {
    startTransition(async () => {
      const res = await bumpProbability(segment.id, delta);
      setError(res.error ?? null);
    });
  }

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        opacity: isPending ? 0.6 : 1,
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <select
          value={segment.type}
          onChange={(e) =>
            startTransition(() => setSegmentType(segment.id, e.target.value as WheelSegmentData["type"]))
          }
          style={{ ...smallInputStyle, flexShrink: 0, width: 130 }}
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={() => startTransition(() => setSegmentLabel(segment.id, label))}
          style={{ ...smallInputStyle, flex: 1 }}
        />

        <button
          onClick={() => startTransition(() => removeWheelSegment(segment.id))}
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: "1px solid rgba(224,138,106,0.4)",
            background: "none",
            color: "#e08a6a",
            fontSize: 12,
            cursor: "pointer",
            flexShrink: 0,
          }}
          aria-label="Supprimer"
        >
          ✕
        </button>
      </div>

      {segment.type === "points" && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12.5, opacity: 0.6 }}>Points gagnés :</span>
          <input
            type="number"
            min={0}
            defaultValue={segment.points_value ?? 0}
            onBlur={(e) =>
              startTransition(() => setSegmentPointsValue(segment.id, Number(e.target.value)))
            }
            style={{ ...smallInputStyle, width: 70 }}
          />
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 12.5, opacity: 0.6 }}>Probabilité :</span>
        <StepButton symbol="−" onClick={() => bump(-2.5)} />
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-primary)", minWidth: 46, textAlign: "center" }}>
          {segment.probability}%
        </span>
        <StepButton symbol="+" onClick={() => bump(2.5)} />
      </div>

      {error && <p style={{ color: "#e08a6a", fontSize: 12, margin: 0 }}>{error}</p>}
    </div>
  );
}

function StepButton({ symbol, onClick }: { symbol: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 24,
        height: 24,
        borderRadius: "50%",
        border: "1px solid rgba(205,167,106,0.5)",
        background: "none",
        color: "var(--color-primary)",
        fontSize: 14,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {symbol}
    </button>
  );
}

const smallInputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  padding: "8px 10px",
  fontSize: 13.5,
  color: "inherit",
  fontFamily: "var(--font-body)",
};
