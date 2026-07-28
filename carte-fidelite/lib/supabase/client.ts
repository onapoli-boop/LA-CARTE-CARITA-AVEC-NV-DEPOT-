import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase pour les Client Components ("use client").
 * À appeler à l'intérieur des composants/hooks, jamais au niveau module
 * partagé, pour éviter de fuiter une instance entre requêtes.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
