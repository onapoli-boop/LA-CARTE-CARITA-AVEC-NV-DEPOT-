"use client";

import { useState, useTransition } from "react";
import {
  toggleRewardActive,
  bumpRewardPoints,
  updateRewardText,
  deleteReward,
} from "@/lib/admin/actions";

export interface RewardRowData {
  id: string;
  category: string | null;
  name: string;
  points_cost: number;
  is_active: boolean;
}

export function RewardRow({ reward }: { reward: RewardRowData }) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(reward.name);
  const [category, setCategory] = useState(reward.category ?? "");
  const [showDelete, setShowDelete] = useState(false);

  const dim = !reward.is_active;

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 18,
        padding: "18px 18px 16px",
        opacity: isPending ? 0.55 : 1,
        transition: "opacity 0.15s",
      }}
      onDoubleClick={() => setShowDelete((v) => !v)}
    >
      {/* Ligne haute : catégorie + nom à gauche, toggle pilule à droite */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            onBlur={() => startTransition(() => updateRewardText(reward.id, "category", category))}
            placeholder="CATÉGORIE"
            style={{
              ...bareInput,
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: dim ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.42)",
            }}
          />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => startTransition(() => updateRewardText(reward.id, "name", name))}
            style={{
              ...bareInput,
              fontSize: 17,
              fontWeight: 600,
              marginTop: 3,
              color: dim ? "rgba(255,255,255,0.4)" : "#fff",
            }}
          />
        </div>

        <Toggle
          on={reward.is_active}
          onClick={() => startTransition(() => toggleRewardActive(reward.id))}
        />
      </div>

      {/* Ligne basse : "Coût" à gauche, stepper à droite */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 18,
        }}
      >
        <span style={{ fontSize: 14.5, color: dim ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.5)" }}>
          Coût
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <StepButton symbol="−" dim={dim} onClick={() => startTransition(() => bumpRewardPoints(reward.id, -10))} />
          <span
            style={{
              fontSize: 17,
              fontWeight: 600,
              color: dim ? "rgba(224,187,126,0.4)" : "var(--color-primary)",
              minWidth: 74,
              textAlign: "center",
            }}
          >
            {reward.points_cost} pts
          </span>
          <StepButton symbol="+" dim={dim} onClick={() => startTransition(() => bumpRewardPoints(reward.id, 10))} />
        </div>
      </div>

      {showDelete && (
        <button
          onClick={() => startTransition(() => deleteReward(reward.id))}
          style={{
            marginTop: 14,
            width: "100%",
            padding: "9px",
            background: "none",
            border: "1px solid rgba(224,138,106,0.4)",
            color: "#e08a6a",
            fontSize: 13,
            borderRadius: 12,
            cursor: "pointer",
          }}
        >
          Supprimer cette récompense
        </button>
      )}
    </div>
  );
}

/** Toggle façon iOS : piste dorée quand actif, grise quand inactif. */
function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 52,
        height: 30,
        borderRadius: 16,
        border: "none",
        background: on
          ? "linear-gradient(135deg, var(--color-primary), var(--color-secondary))"
          : "rgba(255,255,255,0.18)",
        position: "relative",
        cursor: "pointer",
        flexShrink: 0,
        transition: "background 0.2s",
        padding: 0,
      }}
      aria-label={on ? "Désactiver" : "Activer"}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: on ? 25 : 3,
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.35)",
          transition: "left 0.2s",
        }}
      />
    </button>
  );
}

function StepButton({ symbol, dim, onClick }: { symbol: string; dim: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 34,
        height: 34,
        borderRadius: "50%",
        border: `1px solid ${dim ? "rgba(205,167,106,0.25)" : "rgba(205,167,106,0.55)"}`,
        background: "none",
        color: dim ? "rgba(224,187,126,0.4)" : "var(--color-primary)",
        fontSize: 18,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 1,
      }}
    >
      {symbol}
    </button>
  );
}

const bareInput: React.CSSProperties = {
  background: "none",
  border: "none",
  outline: "none",
  color: "inherit",
  fontFamily: "var(--font-body)",
  padding: 0,
  width: "100%",
};
