import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Trash2, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAllMusic, isMusicLive, type SiteMusic } from "@/lib/site-music";
import { uploadSiteAudio } from "@/lib/audio-upload.functions";

export const Route = createFileRoute("/admin/musica")({
  head: () => ({ meta: [{ title: "Música do Site — Painel Admin" }, { name: "robots", content: "noindex" }] }),
  component: MusicaAdmin,
});

const toLocal = (iso: string) => {
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
const empty = { id: "", title: "", file_url: "", start_at: "", end_at: "", volume: 50, loop: true, active: true };

function MusicaAdmin() {
  const { data = [], isLoading } = useAllMusic();
  const qc = useQueryClient();
  const upload = useServerFn(uploadSiteAudio);
  const [form, setForm] = useState<typeof empty>(empty);
  const [busy, setBusy] = useState(false);
  const refresh = () => qc.invalidateQueries({ queryKey: ["site_music"] });

  async function onFile(f: File) {
    setBusy(true);
    try {
      const b64 = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result as string);
        r.onerror = rej;
        r.readAsDataURL(f);
      });
      const { url } = await upload({ data: { file: b64, filename: f.name } });
      setForm((s) => ({ ...s, file_url: url, title: s.title || f.name.replace(/\.[^.]+$/, "") }));
      toast.success("Arquivo enviado");
    } catch (e: any) {
      toast.error(e.message ?? "Falha no envio");
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!form.title || !form.file_url || !form.start_at || !form.end_at) return toast.error("Preencha título, arquivo, início e fim.");
    if (new Date(form.end_at) <= new Date(form.start_at)) return toast.error("O fim deve ser depois do início.");
    const row = {
      title: form.title, file_url: form.file_url, volume: form.volume, loop: form.loop, active: form.active,
      start_at: new Date(form.start_at).toISOString(), end_at: new Date(form.end_at).toISOString(),
    };
    const { error } = form.id
      ? await supabase.from("site_music").update(row).eq("id", form.id)
      : await supabase.from("site_music").insert(row);
    if (error) return toast.error(error.message);
    toast.success("Música salva");
    setForm(empty);
    refresh();
  }

  async function del(m: SiteMusic) {
    if (!confirm(`Excluir "${m.title}"?`)) return;
    const { error } = await supabase.from("site_music").delete().eq("id", m.id);
    if (error) toast.error(error.message); else refresh();
  }

  const now = new Date();
  const input = "mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm";

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Música do Site</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        A música toca na página principal somente entre a data/hora de início e de fim. Alguns navegadores só liberam o som após o visitante clicar na página.
      </p>

      <div className="mt-6 grid gap-4 rounded-md border bg-card p-4 sm:grid-cols-2">
        <label className="text-sm sm:col-span-2">Arquivo de música (MP3, WAV, OGG, M4A — até 20 MB)
          <input type="file" accept="audio/*" disabled={busy} className={input} onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
          {busy && <span className="text-xs text-muted-foreground">Enviando...</span>}
          {form.file_url && <audio controls src={form.file_url} className="mt-2 w-full" />}
        </label>
        <label className="text-sm sm:col-span-2">Título
          <input className={input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </label>
        <label className="text-sm">Início (data e hora)
          <input type="datetime-local" className={input} value={form.start_at} onChange={(e) => setForm({ ...form, start_at: e.target.value })} />
        </label>
        <label className="text-sm">Fim (data e hora)
          <input type="datetime-local" className={input} value={form.end_at} onChange={(e) => setForm({ ...form, end_at: e.target.value })} />
        </label>
        <label className="text-sm">Volume: {form.volume}%
          <input type="range" min={0} max={100} className="mt-2 w-full" value={form.volume} onChange={(e) => setForm({ ...form, volume: Number(e.target.value) })} />
        </label>
        <div className="flex items-center gap-6 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.loop} onChange={(e) => setForm({ ...form, loop: e.target.checked })} /> Repetir</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Ativa</label>
        </div>
        <div className="flex gap-2 sm:col-span-2">
          <button onClick={save} disabled={busy} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            {form.id ? "Salvar alterações" : "Adicionar música"}
          </button>
          {form.id && <button onClick={() => setForm(empty)} className="rounded-md border px-4 py-2 text-sm">Cancelar</button>}
        </div>
      </div>

      {isLoading ? <p className="mt-6 text-muted-foreground">Carregando...</p> : data.length === 0 ? (
        <p className="mt-6 text-muted-foreground">Nenhuma música cadastrada.</p>
      ) : (
        <ul className="mt-6 divide-y rounded-md border bg-card">
          {data.map((m) => {
            const live = isMusicLive(m, now);
            const label = !m.active ? "Inativa" : live ? "Tocando" : new Date(m.start_at) > now ? "Agendada" : "Encerrada";
            return (
              <li key={m.id} className="flex items-center gap-4 p-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-semibold">{m.title}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${live ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{label}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(m.start_at).toLocaleString("pt-BR")} → {new Date(m.end_at).toLocaleString("pt-BR")} · volume {m.volume}%
                  </div>
                </div>
                <button onClick={() => setForm({ ...m, start_at: toLocal(m.start_at), end_at: toLocal(m.end_at) })} className="rounded-md border px-3 py-1.5 text-xs">
                  <Edit className="inline h-3.5 w-3.5" /> Editar
                </button>
                <button onClick={() => del(m)} className="rounded-md border border-destructive/30 px-3 py-1.5 text-xs text-destructive">
                  <Trash2 className="inline h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
