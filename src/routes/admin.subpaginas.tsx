import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2, Save, ArrowUp, ArrowDown, ExternalLink, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { uploadContentImage } from "@/lib/leaders";
import { PAGE_MENUS, pageSlug, type SitePage, type PageMenu } from "@/lib/site-pages";

export const Route = createFileRoute("/admin/subpaginas")({
  head: () => ({ meta: [
    { title: "Subpáginas — Painel LC-11" }, { name: "description", content: "Gerenciamento das subpáginas do Distrito LC-11." },
    { property: "og:title", content: "Subpáginas — Painel LC-11" }, { property: "og:description", content: "Gerenciamento de páginas e menus do Distrito LC-11." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" },
  ] }),
  component: SubpagesAdmin,
});
type Draft = Omit<SitePage, "id"> & { id?: string };
const emptyPage = (): Draft => ({ title: "", slug: "", menu_key: "inicio", menu_label: "", description: "", body: "", image_url: "", sort_order: 0, published: false });
const fieldClass = "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

function SubpagesAdmin() {
  const { canEditContent } = useAuth();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("");
  const query = useQuery({ queryKey: ["site-pages", "admin"], queryFn: async () => {
    const { data, error } = await supabase.from("site_pages").select("*").order("sort_order").order("title");
    if (error) throw error;
    return (data ?? []) as SitePage[];
  } });
  const pages = query.data ?? [];
  function patch(values: Partial<Draft>) { setDraft((current) => current ? { ...current, ...values } : current); }
  async function perform(work: () => Promise<void>) {
    setBusy(true); setMessage("");
    try { await work(); await queryClient.invalidateQueries({ queryKey: ["site-pages"] }); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível salvar."); }
    finally { setBusy(false); }
  }
  async function save() {
    if (!draft) return;
    const { id, ...values } = draft;
    if (!values.title.trim() || !values.slug.match(/^[a-z0-9]+(-[a-z0-9]+)*$/)) {
      setMessage("Preencha o título e um endereço válido (letras minúsculas, números e hífens)."); return;
    }
    await perform(async () => {
      const payload = { ...values, title: values.title.trim(), menu_label: values.menu_label.trim() || values.title.trim(), updated_at: new Date().toISOString() };
      const result = id ? await supabase.from("site_pages").update(payload).eq("id", id).select("id").single()
        : await supabase.from("site_pages").insert(payload).select("id").single();
      if (result.error) throw new Error(result.error.code === "23505" ? "Já existe uma página com esse endereço." : result.error.message);
      setDraft(null); setMessage("Página salva.");
    });
  }
  async function updatePage(page: SitePage, values: Partial<SitePage>) {
    const { error, data } = await supabase.from("site_pages").update({ ...values, updated_at: new Date().toISOString() }).eq("id", page.id).select("id").single();
    if (error || !data) throw new Error(error?.message || "Não foi possível atualizar a página.");
  }
  async function move(page: SitePage, direction: -1 | 1) {
    const siblings = pages.filter((item) => item.menu_key === page.menu_key);
    const index = siblings.findIndex((item) => item.id === page.id);
    const other = siblings[index + direction];
    if (!other) return;
    [siblings[index], siblings[index + direction]] = [other, page];
    await perform(async () => {
      for (const [order, item] of siblings.entries()) await updatePage(item, { sort_order: order });
    });
  }
  return <div>
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="font-display text-2xl font-bold">Subpáginas dos Menus</h1>
      <Button disabled={!canEditContent || busy} onClick={() => { setMessage(""); setDraft({ ...emptyPage(), sort_order: pages.length }); }}><Plus />Nova subpágina</Button>
    </div>
    {message && <p role="status" className="mt-4 rounded-md border border-border p-3 text-sm">{message}</p>}
    {!canEditContent && <p className="mt-4 text-muted-foreground">Sua conta não tem permissão para editar conteúdo.</p>}
    {draft && <form onSubmit={(event) => { event.preventDefault(); void save(); }} className="mt-6 space-y-5 border-y border-border py-6">
      <div className="flex items-center justify-between"><h2 className="font-display text-xl font-bold">{draft.id ? "Editar subpágina" : "Nova subpágina"}</h2><Button type="button" variant="ghost" size="icon" title="Fechar edição" disabled={busy} onClick={() => setDraft(null)}><X /></Button></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">Título<input required className={fieldClass} value={draft.title} onChange={(event) => patch({ title: event.target.value, ...(!draft.id && draft.slug === pageSlug(draft.title) ? { slug: pageSlug(event.target.value) } : {}) })} /></label>
        <label className="text-sm font-medium">Menu principal<select aria-label="Menu principal" className={fieldClass} value={draft.menu_key} onChange={(event) => patch({ menu_key: event.target.value as PageMenu })}>{Object.entries(PAGE_MENUS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        <label className="text-sm font-medium">Nome no menu<input className={fieldClass} value={draft.menu_label} placeholder={draft.title} onChange={(event) => patch({ menu_label: event.target.value })} /></label>
        <label className="text-sm font-medium">Endereço da página<input required pattern="[a-z0-9]+(-[a-z0-9]+)*" className={fieldClass} value={draft.slug} onChange={(event) => patch({ slug: event.target.value })} /><span className="mt-1 block text-xs text-muted-foreground">/paginas/{draft.slug}</span></label>
      </div>
      <label className="block text-sm font-medium">Descrição<textarea className={fieldClass} rows={2} value={draft.description} onChange={(event) => patch({ description: event.target.value })} /></label>
      <label className="block text-sm font-medium">Conteúdo<textarea className={fieldClass} rows={12} value={draft.body} onChange={(event) => patch({ body: event.target.value })} /></label>
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm"><Upload className="h-4 w-4" />Imagem<input type="file" accept="image/*" className="sr-only" disabled={busy} onChange={(event) => {
          const file = event.target.files?.[0]; if (!file) return;
          void perform(async () => { patch({ image_url: await uploadContentImage(file) }); });
        }} /></label>
        {draft.image_url && <><img src={draft.image_url} alt="Imagem da subpágina" className="h-20 w-32 rounded-md object-contain" /><Button type="button" variant="ghost" size="icon" title="Remover imagem" onClick={() => patch({ image_url: "" })}><Trash2 /></Button></>}
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.published} onChange={(event) => patch({ published: event.target.checked })} />Publicada</label>
      <div className="flex gap-3"><Button type="submit" disabled={busy || !canEditContent}><Save />{busy ? "Salvando..." : "Salvar página"}</Button><Button type="button" variant="outline" disabled={busy} onClick={() => setDraft(null)}>Cancelar</Button></div>
    </form>}
    <label className="mt-6 block max-w-xs text-sm">Filtrar por menu<select className={fieldClass} value={filter} onChange={(event) => setFilter(event.target.value)}><option value="">Todos os menus</option>{Object.entries(PAGE_MENUS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
    {query.isLoading && <p className="mt-6 text-muted-foreground">Carregando...</p>}
    {query.error && <p role="alert" className="mt-6 text-destructive">Não foi possível carregar as subpáginas.</p>}
    {!query.isLoading && !query.error && pages.length === 0 && <p className="mt-8 text-muted-foreground">Nenhuma subpágina cadastrada.</p>}
    <div className="mt-6 divide-y divide-border">
      {pages.filter((page) => !filter || page.menu_key === filter).map((page) => <div key={page.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
        <div className="min-w-0"><h2 className="break-words font-semibold">{page.title}</h2><p className="text-sm text-muted-foreground">{PAGE_MENUS[page.menu_key]} · /paginas/{page.slug}</p></div>
        <div className="flex flex-wrap items-center gap-1">
          <Button variant="outline" size="sm" disabled={busy || !canEditContent} onClick={() => void perform(() => updatePage(page, { published: !page.published }))}>{page.published ? "Publicada" : "Rascunho"}</Button>
          {page.published && <Button asChild variant="ghost" size="icon" title="Abrir página"><Link to="/paginas/$slug" params={{ slug: page.slug }} target="_blank"><ExternalLink /></Link></Button>}
          <Button variant="ghost" size="icon" title="Mover para cima" disabled={busy || !canEditContent || pages.filter((p) => p.menu_key === page.menu_key)[0]?.id === page.id} onClick={() => void move(page, -1)}><ArrowUp /></Button>
          <Button variant="ghost" size="icon" title="Mover para baixo" disabled={busy || !canEditContent || pages.filter((p) => p.menu_key === page.menu_key).at(-1)?.id === page.id} onClick={() => void move(page, 1)}><ArrowDown /></Button>
          <Button variant="ghost" size="icon" title="Editar subpágina" disabled={busy || !canEditContent} onClick={() => { setDraft(page); setMessage(""); window.scrollTo({ top: 0, behavior: "smooth" }); }}><Pencil /></Button>
          <Button variant="ghost" size="icon" title="Excluir subpágina" disabled={busy || !canEditContent} onClick={() => {
            if (!window.confirm(`Excluir a subpágina “${page.title}”?`)) return;
            void perform(async () => { const { error } = await supabase.from("site_pages").delete().eq("id", page.id); if (error) throw error; });
          }}><Trash2 className="text-destructive" /></Button>
        </div>
      </div>)}
    </div>
  </div>;
}