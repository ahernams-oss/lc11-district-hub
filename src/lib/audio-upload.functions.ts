import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const FIVE_YEARS = 60 * 60 * 24 * 365 * 5;
const ALLOWED = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/ogg", "audio/mp4", "audio/x-m4a", "audio/aac", "audio/webm"];

export const uploadSiteAudio = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ file: z.string().min(1), filename: z.string().min(1).max(200) }))
  .handler(async ({ data, context }) => {
    const { data: canEdit } = await context.supabase.rpc("can_edit_content", { _user_id: context.userId });
    if (!canEdit) throw new Error("Sem permissão");
    const match = data.file.match(/^data:([\w/\-+.]+);base64,(.+)$/);
    if (!match) throw new Error("Formato inválido");
    const mime = match[1];
    if (!ALLOWED.includes(mime)) throw new Error("Use um arquivo MP3, WAV, OGG, M4A ou AAC.");
    const buffer = Buffer.from(match[2], "base64");
    if (buffer.length > 20 * 1024 * 1024) throw new Error("Arquivo maior que 20 MB.");
    const path = `musicas/${Date.now()}-${data.filename.replace(/[^\w.\-]+/g, "_")}`;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.storage.from("site-images").upload(path, buffer, { contentType: mime });
    if (error) throw new Error(error.message);
    const { data: signed, error: e2 } = await supabaseAdmin.storage.from("site-images").createSignedUrl(path, FIVE_YEARS);
    if (e2 || !signed?.signedUrl) throw new Error("Falha ao obter URL do arquivo");
    return { url: signed.signedUrl };
  });
