import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { SitePage } from "./site-pages";

export const getPublicPage = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const url = process.env["SUPABASE_URL"];
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
    if (!url || !key) throw new Error("Conteúdo temporariamente indisponível");
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      } },
    });
    const result = await client.from("site_pages").select("id,title,slug,menu_key,menu_label,description,body,image_url,sort_order,published")
      .eq("slug", data.slug).eq("published", true).maybeSingle();
    if (result.error) throw new Error("Não foi possível carregar a página");
    return result.data as SitePage | null;
  });