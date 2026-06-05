import { createFileRoute } from "@tanstack/react-router";
import { jsonResponse, optionsResponse, errorResponse } from "@/lib/public-api-cors";

export const Route = createFileRoute("/api/public/eventos")({
  server: {
    handlers: {
      OPTIONS: async () => optionsResponse(),
      GET: async () => {
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data, error } = await supabaseAdmin
            .from("events")
            .select("id, title, description, location, starts_at, ends_at, tag, cover_url, created_at, updated_at")
            .order("starts_at", { ascending: true, nullsFirst: false });
          if (error) throw error;
          return jsonResponse({ data: data ?? [] });
        } catch (e: any) {
          return errorResponse(e?.message ?? "Erro ao carregar eventos");
        }
      },
    },
  },
});
