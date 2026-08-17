import { useState } from "react";
import { Paperclip, Upload, X, FileText, Image as ImageIcon, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type FileUploadInputProps = {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  bucket?: string;
  folder?: string;
  accept?: string;
};

export function FileUploadInput({
  value,
  onChange,
  bucket = "fin-attachments",
  folder = "comprovantes",
  accept = "image/*,application/pdf",
}: FileUploadInputProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

      const { data, error: uploadErr } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { upsert: true });

      if (uploadErr) {
        throw uploadErr;
      }

      // Generate public URL (or path)
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      onChange(publicUrlData.publicUrl);
    } catch (err: any) {
      setError(err?.message ?? "Erro ao fazer upload do arquivo.");
    } finally {
      setUploading(false);
    }
  }

  function handleRemove() {
    onChange(null);
  }

  const isPdf = value?.toLowerCase().endsWith(".pdf");

  return (
    <div className="space-y-2">
      {value ? (
        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            {isPdf ? (
              <FileText className="h-4 w-4 shrink-0 text-red-400" />
            ) : (
              <ImageIcon className="h-4 w-4 shrink-0 text-emerald-400" />
            )}
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-xs text-slate-200 underline hover:text-primary"
            >
              {value.split("/").pop() || "Ver Anexo"}
            </a>
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white"
              title="Abrir anexo"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-red-400"
            title="Remover anexo"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 bg-white/[0.02] px-4 py-3 text-xs text-slate-400 transition hover:border-primary/50 hover:bg-white/[0.04]">
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Enviando arquivo...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 text-slate-400" />
                <span>Clique para anexar comprovante (PDF ou imagem)</span>
              </>
            )}
            <input
              type="file"
              accept={accept}
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
