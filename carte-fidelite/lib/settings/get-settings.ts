import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { BusinessSettings } from "@/types/settings";

/**
 * Un déploiement = une base = une seule ligne dans business_settings.
 * `cache()` dédoublonne l'appel au sein d'une même requête serveur
 * (layout + generateMetadata + manifest peuvent tous l'appeler sans coût
 * réseau supplémentaire).
 */
export const getBusinessSettings = cache(
  async (): Promise<BusinessSettings | null> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("business_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("[getBusinessSettings] Erreur:", error.message);
      return null;
    }

    return data as BusinessSettings | null;
  }
);
