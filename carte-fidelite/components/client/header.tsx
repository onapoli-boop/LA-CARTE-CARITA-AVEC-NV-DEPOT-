import Link from "next/link";
import { useSettings } from "@/components/providers/settings-provider";

export function Header() {
  const settings = useSettings();
  const mainWord = (settings.brand_word ?? settings.name).toUpperCase();
  const subWord = settings.brand_subword?.toUpperCase() ?? "";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        marginBottom: 26,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 30,
            letterSpacing: "0.12em",
            lineHeight: 1,
          }}
        >
          {mainWord}
        </div>
        {subWord && (
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.35em",
              color: "var(--color-secondary)",
              marginTop: 4,
            }}
          >
            {subWord}
          </div>
        )}
      </div>

      <Link
        href="/profile"
        style={{
          position: "absolute",
          left: 0,
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      </Link>

      <Link
        href="/activity"
        style={{
          position: "absolute",
          right: 0,
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
          <path
            d="M9 1c-1 0-1.8.8-1.8 1.8v.6C4.6 4 3 6.2 3 8.8v3.6L1.2 15c-.3.5.1 1.1.7 1.1h14.2c.6 0 1-.6.7-1.1L15 12.4V8.8c0-2.6-1.6-4.8-4.2-5.4v-.6C10.8 1.8 10 1 9 1z"
            stroke="currentColor"
            strokeWidth="1.3"
            fill="none"
          />
          <path d="M7 17.5a2 2 0 004 0" stroke="currentColor" strokeWidth="1.3" fill="none" />
        </svg>
        <div
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--color-primary)",
          }}
        />
      </Link>
    </div>
  );
}
