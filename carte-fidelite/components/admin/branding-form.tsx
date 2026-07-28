"use client";

import { useActionState } from "react";
import { updateBranding, type BrandingFormState } from "@/lib/admin/actions";
import type { BusinessSettings } from "@/types/settings";

const initialState: BrandingFormState = undefined;

const FONT_OPTIONS = [
  "Inter",
  "Playfair Display",
  "Cormorant Garamond",
  "Poppins",
  "Montserrat",
  "Lora",
];

export function BrandingForm({ settings }: { settings: BusinessSettings }) {
  const [state, formAction, isPending] = useActionState(updateBranding, initialState);

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <h2 style={sectionTitle}>Identité</h2>

        <Field label="Nom du commerce">
          <input name="name" defaultValue={settings.name} required style={inputStyle} />
        </Field>

        <div style={{ display: "flex", gap: 12 }}>
          <Field label="Ligne principale du logo" hint='ex: "CARITA"'>
            <input name="brand_word" defaultValue={settings.brand_word ?? ""} style={inputStyle} />
          </Field>
          <Field label="Sous-ligne (optionnelle)" hint='ex: "CAEN"'>
            <input name="brand_subword" defaultValue={settings.brand_subword ?? ""} style={inputStyle} />
          </Field>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <Field label="Libellé des points" hint='ex: "points", "pts", "coquillages"'>
            <input name="points_label" defaultValue={settings.points_label} required style={inputStyle} />
          </Field>
          <Field label="Bonus de bienvenue">
            <input
              name="welcome_bonus_points"
              type="number"
              min={0}
              defaultValue={settings.welcome_bonus_points}
              style={inputStyle}
            />
          </Field>
        </div>

        <Field label="Délai entre deux tirages à la roue (minutes)" hint="ex: 60 = un tirage par heure et par cliente">
          <input
            name="scan_cooldown_minutes"
            type="number"
            min={0}
            defaultValue={settings.scan_cooldown_minutes}
            style={inputStyle}
          />
        </Field>
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <h2 style={sectionTitle}>Couleurs</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <ColorField label="Couleur primaire" name="primary_color" defaultValue={settings.primary_color} />
          <ColorField label="Couleur secondaire" name="secondary_color" defaultValue={settings.secondary_color} />
          <ColorField label="Fond" name="background_color" defaultValue={settings.background_color} />
          <ColorField label="Texte" name="text_color" defaultValue={settings.text_color} />
        </div>
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <h2 style={sectionTitle}>Typographie</h2>
        <div style={{ display: "flex", gap: 12 }}>
          <Field label="Police des titres">
            <select name="font_heading" defaultValue={settings.font_heading} style={inputStyle}>
              {FONT_OPTIONS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </Field>
          <Field label="Police du texte courant">
            <select name="font_body" defaultValue={settings.font_body} style={inputStyle}>
              {FONT_OPTIONS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      {state?.error && <p style={{ color: "#e08a6a", fontSize: 13.5, margin: 0 }}>{state.error}</p>}
      {state?.success && (
        <p style={{ color: "var(--color-primary)", fontSize: 13.5, margin: 0 }}>
          Branding mis à jour — visible immédiatement pour tous les clients.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        style={{
          alignSelf: "flex-start",
          background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
          color: "#20160a",
          fontWeight: 600,
          fontSize: 14.5,
          padding: "13px 28px",
          borderRadius: 30,
          border: "none",
          cursor: isPending ? "default" : "pointer",
          opacity: isPending ? 0.7 : 1,
        }}
      >
        {isPending ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
      <label style={{ fontSize: 13, opacity: 0.7 }}>{label}</label>
      {children}
      {hint && <span style={{ fontSize: 11.5, opacity: 0.4 }}>{hint}</span>}
    </div>
  );
}

function ColorField({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, opacity: 0.7 }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="color"
          name={name}
          defaultValue={defaultValue}
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "none",
            padding: 0,
            cursor: "pointer",
          }}
        />
        <span style={{ fontSize: 12, opacity: 0.5, fontFamily: "monospace" }}>{defaultValue}</span>
      </div>
    </div>
  );
}

const sectionTitle: React.CSSProperties = {
  fontFamily: "var(--font-heading)",
  fontSize: 17,
  fontWeight: 600,
  margin: 0,
};

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 10,
  padding: "11px 14px",
  fontSize: 14.5,
  color: "inherit",
  fontFamily: "var(--font-body)",
};
