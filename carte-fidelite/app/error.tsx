"use client";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <div style={{ padding: 24, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
      <h2>Erreur (debug temporaire)</h2>
      <p>message : {error.message}</p>
      <p>digest : {error.digest}</p>
      <p>stack : {error.stack}</p>
    </div>
  );
}
