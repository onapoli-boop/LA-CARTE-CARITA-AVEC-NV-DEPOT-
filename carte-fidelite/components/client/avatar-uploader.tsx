"use client";

import { useState, useRef, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { saveAvatarUrl } from "@/lib/client/profile-actions";

export function AvatarUploader({
  userId,
  initialUrl,
}: {
  userId: string;
  initialUrl: string | null;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (file.size > 3 * 1024 * 1024) {
      setError("Image trop lourde (max 3 Mo).");
      return;
    }

    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/avatar.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, cacheControl: "3600" });

    if (upErr) {
      setError("L'envoi a échoué.");
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    // Cache-buster pour forcer le rafraîchissement de l'image affichée.
    const publicUrl = `${data.publicUrl}?t=${Date.now()}`;
    setUrl(publicUrl);
    startTransition(() => saveAvatarUrl(publicUrl));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <button
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        style={{
          width: 130,
          height: 130,
          borderRadius: "50%",
          border: url ? "none" : "1.5px dashed rgba(205,167,106,0.6)",
          background: url ? `center/cover url(${url})` : "rgba(255,255,255,0.03)",
          color: "rgba(255,255,255,0.5)",
          fontSize: 13,
          cursor: isPending ? "default" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: 14,
          lineHeight: 1.5,
        }}
      >
        {!url && (
          <span>
            {isPending ? "Envoi..." : (
              <>
                Photo de profil
                <br />
                <span style={{ textDecoration: "underline", color: "var(--color-secondary)" }}>
                  parcourir
                </span>
              </>
            )}
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        style={{ display: "none" }}
      />
      {error && <span style={{ fontSize: 12, color: "#e08a6a" }}>{error}</span>}
    </div>
  );
}
