"use client";

import { useState, useTransition } from "react";
import { addWheelSegment } from "@/lib/admin/actions";

export function AddSegmentButton({ disabled }: { disabled: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <button
        onClick={() =>
          startTransition(async () => {
            const res = await addWheelSegment();
            setError(res.error ?? null);
          })
        }
        disabled={isPending || disabled}
        style={{
          border: "1px dashed rgba(205,167,106,0.5)",
          borderRadius: 16,
          padding: 16,
          textAlign: "center",
          color: disabled ? "rgba(255,255,255,0.3)" : "var(--color-primary)",
          fontSize: 14,
          fontWeight: 500,
          background: "none",
          cursor: isPending || disabled ? "default" : "pointer",
          width: "100%",
        }}
      >
        {disabled ? "8 segments maximum atteint" : isPending ? "Ajout..." : "+ Ajouter un segment"}
      </button>
      {error && <p style={{ color: "#e08a6a", fontSize: 12, marginTop: 6 }}>{error}</p>}
    </div>
  );
}
