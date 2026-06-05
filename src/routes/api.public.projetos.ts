import { createFileRoute } from "@tanstack/react-router";
import { jsonResponse, optionsResponse, errorResponse } from "@/lib/public-api-cors";

export const Route = createFileRoute("/api/public/projetos")({
  server: {
    handlers: {
      OPTIONS: async () => optionsResponse(),
      GET: async () => {
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data, error } = await supabaseAdmin
            .from("projects")
            .select("id, title, tag, description, content, cover_url, order_index, created_at, updated_at")
            .order("order_index", { ascending: true });
          if (error) throw error;
          return jsonResponse({ data: data ?? [] });
        } catch (e: any) {
          return errorResponse(e?.message ?? "Erro ao carregar projetos");
        }
      },
    },
  },
});
