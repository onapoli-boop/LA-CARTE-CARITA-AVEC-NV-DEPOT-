import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Rafraîchit le token de session Supabase à chaque requête. Sans ce
 * middleware, les Server Components peuvent recevoir un token expiré et
 * l'utilisateur se retrouve déconnecté de façon aléatoire — c'est le piège
 * classique de Supabase + Next.js App Router.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Important : ne pas retirer cet appel, même s'il semble inutilisé.
  // C'est lui qui déclenche le rafraîchissement du token si nécessaire.
  await supabase.auth.getUser();

  return supabaseResponse;
}
