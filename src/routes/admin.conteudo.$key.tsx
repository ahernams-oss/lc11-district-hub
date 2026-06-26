import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CONTENT_LABELS, type ContentKey, fetchSiteContent, saveSiteContent } from "@/lib/content";
import { uploadContentImage } from "@/lib/leaders";
import { ArrowLeft, Upload } from "lucide-react";

export const Route = createFileRoute("/admin/conteudo/$key")({
  component: ContentEditor,
});

// Field definitions per content key
type Field = { name: string; label: string; type: "text" | "textarea" | "image" | "images" | "images_with_links" | "number"; max?: number; linksField?: string; min?: number; help?: string };

const FIELDS: Record<ContentKey, Field[]> = {
  home: [
    { name: "hero_eyebrow", label: "Sobre-título (eyebrow)", type: "text" },
    { name: "hero_title", label: "Título principal", type: "textarea" },
    { name: "hero_description", label: "Descrição", type: "textarea" },
    { name: "hero_images", label: "Imagens do hero (até 10 - rotação automática)", type: "images_with_links", max: 10, linksField: "hero_image_links" },
    { name: "hero_rotation_seconds", label: "Tempo de rotação do banner (segundos)", type: "number", min: 1, help: "Quanto tempo cada imagem fica visível antes de passar para a próxima." },
  ],
  "lions-internacional": [
    { name: "eyebrow", label: "Sobre-título", type: "text" },
    { name: "title", label: "Título", type: "textarea" },
    { name: "description", label: "Descrição (hero)", type: "textarea" },
    { name: "body", label: "Texto da página", type: "textarea" },
  ],
  sobre: [
    { name: "eyebrow", label: "Sobre-título", type: "text" },
    { name: "title", label: "Título", type: "textarea" },
    { name: "description", label: "Descrição (hero)", type: "textarea" },
    { name: "body", label: "Texto da página", type: "textarea" },
  ],
  historia: [
    { name: "eyebrow", label: "Sobre-título", type: "text" },
    { name: "title", label: "Título", type: "textarea" },
    { name: "description", label: "Descrição (hero)", type: "textarea" },
    { name: "body", label: "Texto da página", type: "textarea" },
  ],
  gat: [
    { name: "eyebrow", label: "Sobre-título", type: "text" },
    { name: "title", label: "Título", type: "textarea" },
    { name: "description", label: "Descrição (hero)", type: "textarea" },
    { name: "body", label: "Texto da página", type: "textarea" },
  ],
  assessoria: [
    { name: "eyebrow", label: "Sobre-título", type: "text" },
    { name: "title", label: "Título", type: "textarea" },
    { name: "description", label: "Descrição (hero)", type: "textarea" },
    { name: "body", label: "Texto da página", type: "textarea" },
  ],
  "ex-governadores": [
    { name: "eyebrow", label: "Sobre-título", type: "text" },
    { name: "title", label: "Título", type: "textarea" },
    { name: "description", label: "Descrição (hero)", type: "textarea" },
  ],
  governador: [
    { name: "eyebrow", label: "Sobre-título", type: "text" },
    { name: "title", label: "Título da página", type: "textarea" },
    { name: "description", label: "Descrição (hero)", type: "textarea" },
  ],
  "vice-governador-1": [
    { name: "eyebrow", label: "Sobre-título", type: "text" },
    { name: "title", label: "Título da página", type: "textarea" },
    { name: "description", label: "Descrição (hero)", type: "textarea" },
  ],
  "vice-governador-2": [
    { name: "eyebrow", label: "Sobre-título", type: "text" },
    { name: "title", label: "Título da página", type: "textarea" },
    { name: "description", label: "Descrição (hero)", type: "textarea" },
  ],
  lcif: [
    { name: "eyebrow", label: "Sobre-título", type: "text" },
    { name: "title", label: "Título", type: "textarea" },
    { name: "description", label: "Descrição (hero)", type: "textarea" },
    { name: "intro", label: "Texto de introdução", type: "textarea" },
    { name: "campaigns_title", label: "Título do bloco de campanhas", type: "text" },
    { name: "campaigns", label: "Campanhas (uma por linha)", type: "textarea" },
    { name: "footer_text", label: "Texto final / contato", type: "textarea" },
    { name: "image_url", label: "Imagem ilustrativa (opcional)", type: "image" },
  ],
};

function ContentEditor() {
  const { key } = useParams({ from: "/admin/conteudo/$key" });
  const ckey = key as ContentKey;
  const fields = FIELDS[ckey] ?? [];
  const [values, setValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchSiteContent(ckey).then((d) => {
      setValues(d as Record<string, any>);
      setLoading(false);
    });
  }, [ckey]);

  async function handleSave() {
    setSaving(true);
    setMsg(null);
    try {
      await saveSiteContent(ckey, values);
      setMsg("Salvo com sucesso!");
    } catch (e: any) {
      setMsg("Erro: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleImage(field: string, file: File) {
    setSaving(true);
    try {
      const url = await uploadContentImage(file);
      setValues((v) => ({ ...v, [field]: url }));
      setMsg("Imagem enviada. Clique em Salvar para confirmar.");
    } catch (e: any) {
      setMsg("Erro no upload: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleAddImageToList(field: string, file: File, max: number) {
    setSaving(true);
    try {
      const url = await uploadContentImage(file);
      setValues((v) => {
        const list = Array.isArray(v[field]) ? [...v[field]] : [];
        if (list.length >= max) return v;
        list.push(url);
        return { ...v, [field]: list };
      });
      setMsg("Imagem adicionada. Clique em Salvar para confirmar.");
    } catch (e: any) {
      setMsg("Erro no upload: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  function removeImageFromList(field: string, index: number) {
    setValues((v) => {
      const list = Array.isArray(v[field]) ? [...v[field]] : [];
      list.splice(index, 1);
      return { ...v, [field]: list };
    });
  }

  if (!CONTENT_LABELS[ckey]) {
    return <p>Página desconhecida.</p>;
  }

  return (
    <div className="max-w-3xl">
      <Link to="/admin/conteudo" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="mt-2 font-display text-2xl font-bold">{CONTENT_LABELS[ckey]}</h1>

      {loading ? (
        <p className="mt-6 text-muted-foreground">Carregando...</p>
      ) : (
        <div className="mt-6 space-y-5">
          {fields.map((f) => (
            <div key={f.name}>
              <label className="text-sm font-medium text-foreground">{f.label}</label>
              {f.type === "text" && (
                <input
                  type="text"
                  value={values[f.name] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                />
              )}
              {f.type === "textarea" && (
                <textarea
                  rows={f.name === "body" ? 12 : 3}
                  value={values[f.name] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-sans"
                />
              )}
              {f.type === "image" && (
                <div className="mt-1 space-y-2">
                  {values[f.name] && (
                    <img src={values[f.name]} alt="" className="h-32 rounded-md object-cover" />
                  )}
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-surface">
                    <Upload className="h-4 w-4" /> Enviar imagem
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleImage(f.name, e.target.files[0])}
                    />
                  </label>
                  {values[f.name] && (
                    <button
                      onClick={() => setValues((v) => ({ ...v, [f.name]: "" }))}
                      className="ml-2 text-xs text-destructive hover:underline"
                    >
                      Remover
                    </button>
                  )}
                </div>
              )}
              {f.type === "images" && (() => {
                const list: string[] = Array.isArray(values[f.name]) ? values[f.name] : [];
                const max = f.max ?? 5;
                return (
                  <div className="mt-1 space-y-3">
                    {list.length > 0 && (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {list.map((url, idx) => (
                          <div key={url + idx} className="relative">
                            <img src={url} alt="" className="h-28 w-full rounded-md object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImageFromList(f.name, idx)}
                              className="absolute right-1 top-1 rounded bg-destructive px-2 py-0.5 text-xs font-semibold text-destructive-foreground"
                            >
                              Remover
                            </button>
                            <div className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">
                              {idx + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">{list.length} / {max} imagens</p>
                    {list.length < max && (
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-surface">
                        <Upload className="h-4 w-4" /> Adicionar imagem
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleAddImageToList(f.name, e.target.files[0], max)}
                        />
                      </label>
                    )}
                  </div>
                );
              })()}
              {f.type === "images_with_links" && (() => {
                const list: string[] = Array.isArray(values[f.name]) ? values[f.name] : [];
                const linksKey = f.linksField ?? `${f.name}_links`;
                const links: string[] = Array.isArray(values[linksKey]) ? values[linksKey] : [];
                const max = f.max ?? 10;
                const updateLink = (idx: number, val: string) => {
                  setValues((v) => {
                    const arr = Array.isArray(v[linksKey]) ? [...v[linksKey]] : [];
                    while (arr.length < list.length) arr.push("");
                    arr[idx] = val;
                    return { ...v, [linksKey]: arr };
                  });
                };
                const removeAt = (idx: number) => {
                  setValues((v) => {
                    const imgs = Array.isArray(v[f.name]) ? [...v[f.name]] : [];
                    const lnks = Array.isArray(v[linksKey]) ? [...v[linksKey]] : [];
                    imgs.splice(idx, 1);
                    lnks.splice(idx, 1);
                    return { ...v, [f.name]: imgs, [linksKey]: lnks };
                  });
                };
                return (
                  <div className="mt-1 space-y-3">
                    {list.length > 0 && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {list.map((url, idx) => (
                          <div key={url + idx} className="rounded-md border border-border p-3">
                            <div className="relative">
                              <img src={url} alt="" className="h-32 w-full rounded-md object-cover" />
                              <button
                                type="button"
                                onClick={() => removeAt(idx)}
                                className="absolute right-1 top-1 rounded bg-destructive px-2 py-0.5 text-xs font-semibold text-destructive-foreground"
                              >
                                Remover
                              </button>
                              <div className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">
                                {idx + 1}
                              </div>
                            </div>
                            <label className="mt-2 block text-xs font-medium text-muted-foreground">Link ao clicar (opcional)</label>
                            <input
                              type="text"
                              placeholder="https://... ou /pagina-interna"
                              value={links[idx] ?? ""}
                              onChange={(e) => updateLink(idx, e.target.value)}
                              className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1 text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">{list.length} / {max} imagens</p>
                    {list.length < max && (
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-surface">
                        <Upload className="h-4 w-4" /> Adicionar imagem
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleAddImageToList(f.name, e.target.files[0], max)}
                        />
                      </label>
                    )}
                  </div>
                );
              })()}
              {f.type === "number" && (
                <div>
                  <input
                    type="number"
                    min={f.min ?? 0}
                    value={values[f.name] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value === "" ? "" : Number(e.target.value) }))}
                    className="mt-1 w-40 rounded-md border border-border bg-background px-3 py-2"
                  />
                  {f.help && <p className="mt-1 text-xs text-muted-foreground">{f.help}</p>}
                </div>
              )}
            </div>
          ))}

          <div className="flex items-center gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-primary px-5 py-2 font-semibold text-primary-foreground disabled:opacity-60"
            >
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
            {msg && <span className="text-sm text-muted-foreground">{msg}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
