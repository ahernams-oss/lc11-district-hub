import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const FIVE_YEARS = 60 * 60 * 24 * 365 * 5;

export const uploadPopupImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ file: z.string().min(1), filename: z.string().min(1) }))
  .handler(async ({ data }) => {
    const match = data.file.match(/^data:([\w/\-+.]+);base64,(.+)$/);
    if (!match) {
      throw new Error("Formato base64 inválido");
    }

    const mime = match[1];
    const buffer = Buffer.from(match[2], "base64");

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];
    if (!allowedTypes.includes(mime)) {
      throw new Error("Tipo de arquivo não permitido. Use PNG, JPEG, WEBP ou GIF.");
    }

    const safe = data.filename.replace(/[^\w.\-]+/g, "_");
    const path = `popups/${Date.now()}-${safe}`;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.storage
      .from("site-images")
      .upload(path, buffer, { contentType: mime, upsert: false });
    if (error) throw new Error(error.message);

    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from("site-images")
      .createSignedUrl(path, FIVE_YEARS);
    if (signErr || !signed?.signedUrl) {
      throw new Error("Falha ao obter URL da imagem");
    }
    return { url: signed.signedUrl };
  });
