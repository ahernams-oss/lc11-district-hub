import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const GRANDES_LEOES_FOLDER_ID = "1DLLdntAMlbkysW3drSSFQOhpBHninJu8";
const GATEWAY = "https://connector-gateway.lovable.dev/google_drive";
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const uploadGrandeLeaoPhotoToDrive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ file: z.string().min(1), filename: z.string().min(1).max(200) }))
  .handler(async ({ data, context }) => {
    const { data: canEdit } = await context.supabase.rpc("can_edit_content", { _user_id: context.userId });
    if (!canEdit) throw new Error("Sem permissão");
    const lovableKey = process.env["LOVABLE_API_KEY"];
    const driveKey = process.env["GOOGLE_DRIVE_API_KEY"];
    if (!lovableKey || !driveKey) throw new Error("Google Drive não configurado");
    const match = data.file.match(/^data:([\w/\-+.]+);base64,(.+)$/);
    if (!match || !match[1] || !match[2]) throw new Error("Formato inválido");
    const mime = match[1];
    if (!ALLOWED.includes(mime)) throw new Error("Use JPG, PNG, WEBP ou GIF.");
    const bytes = Uint8Array.from(atob(match[2]), (c) => c.charCodeAt(0));
    if (bytes.length > 15 * 1024 * 1024) throw new Error("Imagem maior que 15 MB.");

    const headers = { Authorization: `Bearer ${lovableKey}`, "X-Connection-Api-Key": driveKey };
    const boundary = "lp" + crypto.randomUUID();
    const meta = JSON.stringify({
      name: `${Date.now()}-${data.filename.replace(/[^\w.\-]+/g, "_")}`,
      parents: [GRANDES_LEOES_FOLDER_ID],
    });
    const enc = new TextEncoder();
    const head = enc.encode(
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${boundary}\r\nContent-Type: ${mime}\r\n\r\n`,
    );
    const tail = enc.encode(`\r\n--${boundary}--`);
    const body = new Uint8Array(head.length + bytes.length + tail.length);
    body.set(head, 0); body.set(bytes, head.length); body.set(tail, head.length + bytes.length);

    const up = await fetch(`${GATEWAY}/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true&fields=id`, {
      method: "POST",
      headers: { ...headers, "Content-Type": `multipart/related; boundary=${boundary}` },
      body,
    });
    if (!up.ok) throw new Error(`Falha ao enviar ao Drive [${up.status}]: ${await up.text()}`);
    const { id } = (await up.json()) as { id: string };

    const perm = await fetch(`${GATEWAY}/drive/v3/files/${id}/permissions?supportsAllDrives=true`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ role: "reader", type: "anyone" }),
    });
    if (!perm.ok) throw new Error(`Falha ao publicar imagem [${perm.status}]: ${await perm.text()}`);
    return { url: `https://lh3.googleusercontent.com/d/${id}`, id };
  });
