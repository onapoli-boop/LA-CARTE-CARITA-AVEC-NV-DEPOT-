"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup, type AuthFormState } from "@/lib/auth/actions";
import { useSettings } from "@/components/providers/settings-provider";

const initialState: AuthFormState = undefined;

export function SignupForm() {
  const settings = useSettings();
  const [state, formAction, isPending] = useActionState(signup, initialState);

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {settings.welcome_bonus_points > 0 && (
        <div
          style={{
            background: "rgba(205,167,106,0.12)",
            border: "1px solid rgba(205,167,106,0.3)",
            borderRadius: 12,
            padding: "10px 14px",
            fontSize: 13,
            color: "var(--color-secondary)",
          }}
        >
          🎁 {settings.welcome_bonus_points} {settings.points_label} offerts à l&apos;inscription
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label htmlFor="full_name" style={{ fontSize: 13, opacity: 0.7 }}>Nom complet</label>
        <input id="full_name" name="full_name" type="text" required autoComplete="name" style={inputStyle} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label htmlFor="email" style={{ fontSize: 13, opacity: 0.7 }}>Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" style={inputStyle} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label htmlFor="password" style={{ fontSize: 13, opacity: 0.7 }}>Mot de passe</label>
        <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" style={inputStyle} />
        <span style={{ fontSize: 12, opacity: 0.5 }}>8 caractères minimum</span>
      </div>

      {state?.error && <p style={{ color: "#e08a6a", fontSize: 13, margin: 0 }}>{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        style={{
          marginTop: 8,
          background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
          color: "#20160a",
          fontWeight: 600,
          fontSize: 15,
          padding: "15px 28px",
          borderRadius: 30,
          border: "none",
          cursor: isPending ? "default" : "pointer",
          opacity: isPending ? 0.7 : 1,
        }}
      >
        {isPending ? "Création du compte..." : "Créer mon compte"}
      </button>

      <p style={{ textAlign: "center", fontSize: 14, opacity: 0.6 }}>
        Déjà un compte ? <Link href="/login" style={{ color: "var(--color-primary)" }}>Connectez-vous</Link>
      </p>
    </form>
  );
}

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 12,
  padding: "13px 16px",
  fontSize: 15,
  color: "inherit",
  fontFamily: "var(--font-body)",
};
