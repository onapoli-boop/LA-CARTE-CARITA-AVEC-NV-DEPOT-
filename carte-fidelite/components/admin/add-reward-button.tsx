"use client";

import { useTransition } from "react";
import { addReward } from "@/lib/admin/actions";

export function AddRewardButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => addReward())}
      disabled={isPending}
      style={{
        marginTop: 4,
        border: "1px dashed rgba(205,167,106,0.5)",
        borderRadius: 16,
        padding: 16,
        textAlign: "center",
        color: "var(--color-primary)",
        fontSize: 14,
        fontWeight: 500,
        background: "none",
        cursor: isPending ? "default" : "pointer",
        width: "100%",
      }}
    >
      {isPending ? "Ajout..." : "+ Ajouter une récompense"}
    </button>
  );
}
