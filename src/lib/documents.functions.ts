import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { writeFileSync, unlinkSync } from "fs";
import { execSync } from "child_process";

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
    const tmpPath = `/tmp/${Date.now()}-${safe}`;
    writeFileSync(tmpPath, buffer);
    try {
      const result = execSync(
        `lovable-assets create --file "${tmpPath}" --filename "${safe}" --content-type "${mime}"`,
        { encoding: "utf-8", timeout: 60000 },
      );
      const text = result.trim();
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      if (start === -1 || end === -1 || end <= start) {
        throw new Error("Saída inválida do upload");
      }
      const json = JSON.parse(text.substring(start, end + 1));
      if (!json.url) throw new Error("Falha ao obter URL do upload");
      return { url: json.url as string };
    } finally {
      try {
        unlinkSync(tmpPath);
      } catch {}
    }
  });
