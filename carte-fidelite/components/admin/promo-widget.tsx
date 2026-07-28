"use client";

import { useActionState } from "react";
import { updatePromotion, type PromoFormState } from "@/lib/admin/actions";

const initialState: PromoFormState = undefined;

export function PromoWidget({
  promotion,
}: {
  promotion: { title: string; description: string | null; is_active: boolean } | null;
}) {
  const [state, formAction, isPending] = useActionState(updatePromotion, initialState);

  return (
    <form
      action={formAction}
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: 18,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 600, margin: 0 }}>
          Promotion
        </h2>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
          Active
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={promotion?.is_active ?? false}
            style={{ width: 16, height: 16 }}
          />
        </label>
      </div>

      <input
        name="title"
        placeholder="Titre de la promotion"
        defaultValue={promotion?.title ?? ""}
        required
        style={inputStyle}
      />
      <textarea
        name="description"
        placeholder="Description (optionnelle)"
        defaultValue={promotion?.description ?? ""}
        rows={2}
        style={{ ...inputStyle, resize: "vertical", fontFamily: "var(--font-body)" }}
      />

      {state?.error && <p style={{ color: "#e08a6a", fontSize: 12.5, margin: 0 }}>{state.error}</p>}
      {state?.success && (
        <p style={{ color: "var(--color-primary)", fontSize: 12.5, margin: 0 }}>Enregistré.</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        style={{
          alignSelf: "flex-start",
          background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
          color: "#20160a",
          fontWeight: 600,
          fontSize: 13.5,
          padding: "10px 20px",
          borderRadius: 24,
          border: "none",
          cursor: isPending ? "default" : "pointer",
          opacity: isPending ? 0.7 : 1,
        }}
      >
        {isPending ? "..." : "Enregistrer"}
      </button>
    </form>
  );
}

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 10,
  padding: "10px 12px",
  fontSize: 14,
  color: "inherit",
};
