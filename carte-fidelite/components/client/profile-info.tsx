"use client";

import { useState, useTransition, useActionState } from "react";
import { useSettings } from "@/components/providers/settings-provider";
import { updateProfile, toggleNotifications, type ProfileFormState } from "@/lib/client/profile-actions";

const initial: ProfileFormState = undefined;

export function ProfileInfo({
  profile,
  email,
}: {
  profile: { full_name: string | null; phone: string | null; notif_push_enabled: boolean };
  email: string;
}) {
  const settings = useSettings();
  const [state, formAction, isPending] = useActionState(updateProfile, initial);
  const [notif, setNotif] = useState(profile.notif_push_enabled);
  const [, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <section>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={sectionLabel}>Informations</span>
          <button
            onClick={() => setEditing((v) => !v)}
            style={{ background: "none", border: "none", color: "var(--color-secondary)", fontSize: 13, cursor: "pointer" }}
          >
            {editing ? "Fermer" : "Modifier"}
          </button>
        </div>

        {editing ? (
          <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <LabeledInput label="Nom complet" name="full_name" defaultValue={profile.full_name ?? ""} />
            <LabeledInput label="Téléphone" name="phone" defaultValue={profile.phone ?? ""} type="tel" />
            <div style={{ ...rowStyle, opacity: 0.6 }}>
              <span style={rowKey}>Email</span>
              <span style={rowVal}>{email}</span>
            </div>
            {state?.error && <p style={{ color: "#e08a6a", fontSize: 13, margin: 0 }}>{state.error}</p>}
            {state?.success && <p style={{ color: "var(--color-primary)", fontSize: 13, margin: 0 }}>Enregistré.</p>}
            <button
              type="submit"
              disabled={isPending}
              style={{
                marginTop: 4,
                background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
                color: "#20160a",
                fontWeight: 600,
                fontSize: 14,
                padding: "11px",
                borderRadius: 24,
                border: "none",
                cursor: isPending ? "default" : "pointer",
              }}
            >
              {isPending ? "..." : "Enregistrer"}
            </button>
          </form>
        ) : (
          <div style={cardStyle}>
            <Row k="Email" v={email} />
            <Row k="Téléphone" v={profile.phone ?? "—"} last={false} />
            <Row k="Institut" v={settings.name} last />
          </div>
        )}
      </section>

      <section>
        <div style={{ ...sectionLabel, marginBottom: 12 }}>Préférences</div>
        <div style={{ ...cardStyle, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px" }}>
          <span style={{ fontSize: 15 }}>Notifications push</span>
          <button
            onClick={() => {
              const next = !notif;
              setNotif(next);
              startTransition(() => toggleNotifications(next));
            }}
            style={{
              width: 52,
              height: 30,
              borderRadius: 16,
              border: "none",
              background: notif
                ? "linear-gradient(135deg, var(--color-primary), var(--color-secondary))"
                : "rgba(255,255,255,0.18)",
              position: "relative",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 3,
                left: notif ? 25 : 3,
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "#fff",
                transition: "left 0.2s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.35)",
              }}
            />
          </button>
        </div>
      </section>
    </div>
  );
}

function Row({ k, v, last }: { k: string; v: string; last?: boolean }) {
  return (
    <div style={{ ...rowStyle, borderBottom: last ? "none" : "1px solid rgba(255,255,255,0.07)" }}>
      <span style={rowKey}>{k}</span>
      <span style={rowVal}>{v}</span>
    </div>
  );
}

function LabeledInput({
  label,
  name,
  defaultValue,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span style={{ fontSize: 12.5, opacity: 0.6 }}>{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 10,
          padding: "11px 14px",
          fontSize: 15,
          color: "#fff",
          fontFamily: "var(--font-body)",
        }}
      />
    </label>
  );
}

const sectionLabel: React.CSSProperties = {
  fontSize: 12,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.4)",
};
const cardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  overflow: "hidden",
};
const rowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "16px 18px",
};
const rowKey: React.CSSProperties = { fontSize: 15, color: "rgba(255,255,255,0.55)" };
const rowVal: React.CSSProperties = { fontSize: 15, fontWeight: 500 };
