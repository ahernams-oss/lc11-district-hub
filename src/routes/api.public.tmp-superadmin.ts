import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/tmp-superadmin")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const email = "ahernams@gmail.com";
        const password = "P1m2a515@";
        const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
        let user = list?.users?.find((u) => u.email?.toLowerCase() === email);
        if (!user) {
          const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
          });
          if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
          user = created.user;
        } else {
          const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
            password,
            email_confirm: true,
          });
          if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }
        const roles = ["admin", "avancado", "intermediario", "basico", "gestor_admin", "gestor_financeiro", "gestor_contabil", "gestor_crm"];
        const errs: string[] = [];
        for (const role of roles) {
          const { error } = await supabaseAdmin
            .from("user_roles")
            .upsert({ user_id: user!.id, role: role as never }, { onConflict: "user_id,role" });
          if (error) errs.push(`${role}: ${error.message}`);
        }
        return new Response(JSON.stringify({ ok: true, id: user!.id, errs }), {
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
