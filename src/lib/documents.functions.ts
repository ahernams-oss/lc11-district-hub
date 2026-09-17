import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const FIVE_YEARS = 60 * 60 * 24 * 365 * 5;

const ALLOWED_MIME = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "text/plain",
];

export const uploadDocumentFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({ file: z.string().min(1), filename: z.string().min(1) }),
  )
  .handler(async ({ data }) => {
    const match = data.file.match(/^data:([\w/\-+.]+);base64,(.+)$/);
    if (!match) throw new Error("Formato base64 inválido");
    const mime = match[1];
    const buffer = Buffer.from(match[2], "base64");

    if (!ALLOWED_MIME.includes(mime)) {
      throw new Error(
        "Tipo de arquivo não permitido. Use PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX, imagens ou TXT.",
      );
    }

    const safe = data.filename.replace(/[^\w.\-]+/g, "_");
    const path = `documentos/${Date.now()}-${safe}`;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.storage
      .from("site-images")
      .upload(path, buffer, { contentType: mime, upsert: false });
    if (error) throw new Error(error.message);

    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from("site-images")
      .createSignedUrl(path, FIVE_YEARS);
    if (signErr || !signed?.signedUrl) {
      throw new Error("Falha ao obter URL do arquivo");
    }
    return { url: signed.signedUrl };
  });
