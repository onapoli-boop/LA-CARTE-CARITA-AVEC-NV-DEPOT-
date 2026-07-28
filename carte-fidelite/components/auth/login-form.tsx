"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, type AuthFormState } from "@/lib/auth/actions";

const initialState: AuthFormState = undefined;

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label htmlFor="email" style={{ fontSize: 13, opacity: 0.7 }}>Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" style={inputStyle} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label htmlFor="password" style={{ fontSize: 13, opacity: 0.7 }}>Mot de passe</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" style={inputStyle} />
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
        {isPending ? "Connexion..." : "Se connecter"}
      </button>

      <p style={{ textAlign: "center", fontSize: 14, opacity: 0.6 }}>
        Pas encore de compte ? <Link href="/signup" style={{ color: "var(--color-primary)" }}>Inscrivez-vous</Link>
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
