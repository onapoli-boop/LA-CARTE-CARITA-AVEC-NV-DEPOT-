export async function register() {}

// Capture les erreurs serveur (Server Components, Server Actions, etc.) et
// les écrit dans une table Supabase de debug, puisque les logs Netlify sont
// payants sur ce compte. À SUPPRIMER une fois le bug identifié.
export async function onRequestError(
  err: unknown,
  request: { path?: string },
  _context: unknown
) {
  try {
    const message =
      err instanceof Error
        ? `${err.name}: ${err.message}\n${err.stack ?? ""}`
        : String(err);

    await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/debug_logs`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""}`,
        },
        body: JSON.stringify({
          message: `[${request?.path ?? "?"}] ${message}`.slice(0, 4000),
        }),
      }
    );
  } catch {
    // On ignore : mieux vaut ne pas planter en essayant de logger un plantage.
  }
}
