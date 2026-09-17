import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const FIVE_YEARS = 60 * 60 * 24 * 365 * 5;

const ALLOWED = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "image/svg+xml"];

export const uploadSiteImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      file: z.string().min(1),
      filename: z.string().min(1),
      folder: z.string().min(1).max(60).default("content"),
    }),
  )
  .handler(async ({ data }) => {
    const match = data.file.match(/^data:([\w/\-+.]+);base64,(.+)$/);
    if (!match) throw new Error("Formato base64 inválido");

    const mime = match[1];
    if (!ALLOWED.includes(mime)) {
      throw new Error("Tipo de arquivo não permitido. Use PNG, JPEG, WEBP ou GIF.");
    }
    const buffer = Buffer.from(match[2], "base64");

    const safeFolder = data.folder.replace(/[^\w-]+/g, "_");
    const safeName = data.filename.replace(/[^\w.\-]+/g, "_");
    const path = `${safeFolder}/${Date.now()}-${safeName}`;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.storage
      .from("site-images")
      .upload(path, buffer, { contentType: mime, upsert: false });
    if (error) throw new Error(error.message);

    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from("site-images")
      .createSignedUrl(path, FIVE_YEARS);
    if (signErr || !signed?.signedUrl) throw new Error("Falha ao obter URL da imagem");

    return { url: signed.signedUrl };
  });
