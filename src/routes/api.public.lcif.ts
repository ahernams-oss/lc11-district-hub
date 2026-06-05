import { createFileRoute } from "@tanstack/react-router";
import { jsonResponse, optionsResponse, errorResponse } from "@/lib/public-api-cors";

export const Route = createFileRoute("/api/public/lcif")({
  server: {
    handlers: {
      OPTIONS: async () => optionsResponse(),
      GET: async () => {
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data, error } = await supabaseAdmin
            .from("site_content")
            .select("key, value")
            .eq("key", "lcif")
            .maybeSingle();
          if (error) throw error;
          return jsonResponse({ data: data?.value ?? null });
        } catch (e: any) {
          return errorResponse(e?.message ?? "Erro ao carregar LCIF");
        }
      },
    },
  },
});
