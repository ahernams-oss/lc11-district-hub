import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { writeFileSync, unlinkSync } from "fs";
import { execSync } from "child_process";

export const uploadPopupImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ file: z.string().min(1), filename: z.string().min(1) }))
  .handler(async ({ data }) => {
    const base64 = data.file;
    const filename = data.filename;

    const match = base64.match(/^data:([\w/\-+.]+);base64,(.+)$/);
    if (!match) {
      throw new Error("Formato base64 inválido");
    }

    const mime = match[1];
    const buffer = Buffer.from(match[2], "base64");

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];
    if (!allowedTypes.includes(mime)) {
      throw new Error("Tipo de arquivo não permitido. Use PNG, JPEG, WEBP ou GIF.");
    }

    const tmpPath = `/tmp/${Date.now()}-${filename}`;
    writeFileSync(tmpPath, buffer);

    try {
      const result = execSync(
        `lovable-assets create --file "${tmpPath}" --filename "${filename}" --content-type "${mime}"`,
        { encoding: "utf-8", timeout: 30000 }
      );
      const json = JSON.parse(result.trim().split("\n").find((l) => l.startsWith("{")) ?? "{}");
      if (!json.url) {
        throw new Error("Falha ao obter URL do upload");
      }
      return { url: json.url };
    } finally {
      try {
        unlinkSync(tmpPath);
      } catch {}
    }
  });
