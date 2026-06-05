import { createFileRoute } from "@tanstack/react-router";
import { jsonResponse, optionsResponse, errorResponse } from "@/lib/public-api-cors";

export const Route = createFileRoute("/api/public/governadores")({
  server: {
    handlers: {
      OPTIONS: async () => optionsResponse(),
      GET: async () => {
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data, error } = await supabaseAdmin
            .from("leaders")
            .select("id, category, name, role, year_label, motto, bio, photo_url, order_index")
            .eq("category", "governador")
            .order("order_index", { ascending: true });
          if (error) throw error;
          return jsonResponse({ data: data ?? [] });
        } catch (e: any) {
          return errorResponse(e?.message ?? "Erro ao carregar governadores");
        }
      },
    },
  },
});
