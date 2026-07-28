"use client";

import { logout } from "@/lib/auth/actions";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        style={{
          background: "none",
          border: "none",
          textAlign: "center",
          padding: 14,
          color: "#e08a6a",
          fontSize: 15,
          fontWeight: 500,
          cursor: "pointer",
          width: "100%",
        }}
      >
        Se déconnecter
      </button>
    </form>
  );
}
