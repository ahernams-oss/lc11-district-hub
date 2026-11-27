import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Upload } from "lucide-react";
import { BreakHint } from "@/components/BreakHint";
import { getProtocolTopic } from "@/lib/protocol-menu";
import { uploadContentImage } from "@/lib/leaders";
import {
  EMPTY_PROTOCOL_TOPIC,
  fetchProtocolTopic,
  isKnownProtocolSlug,
  saveProtocolTopic,
  type ProtocolTopicContent,
} from "@/lib/protocol-content";

export const Route = createFileRoute("/admin/protocolo/$slug")({
  beforeLoad: ({ params }) => {
    if (!isKnownProtocolSlug(params.slug)) throw notFound();
  },
  head: ({ params }) => {
    const topic = getProtocolTopic(params.slug);
    const title = `${topic?.label ?? "Tema indisponível"} — Protocolo Leonístico — Painel Admin LC-11`;
    return { meta: [
      { title },
      { name: "description", content: "Edição do conteúdo de um tema de Protocolo Leonístico." },
      { property: "og:title", content: title },
      { property: "og:description", content: "Edição do conteúdo de um tema de Protocolo Leonístico." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ] };
  },
  component: ProtocolTopicEditor,
});

const MAX_IMAGES = 10;

function ProtocolTopicEditor() {
  const { slug } = Route.useParams();
  const topic = getProtocolTopic(slug);
  const [values, setValues] = useState<ProtocolTopicContent>(EMPTY_PROTOCOL_TOPIC);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchProtocolTopic(slug).then((content) => {
      setValues(content);
      setLoading(false);
    });
  }, [slug]);

  function patch(next: Partial<ProtocolTopicContent>) {
    setValues((current) => ({ ...current, ...next }));
  }

  async function addImage(file: File) {
    setSaving(true);
    setMsg(null);
    try {
      const url = await uploadContentImage(file, "protocolo");
      setValues((current) => current.images.length >= MAX_IMAGES ? current : { ...current, images: [...current.images, url] });
      setMsg("Imagem adicionada. Clique em Salvar para confirmar.");
    } catch (error) {
      setMsg("Erro no upload: " + (error instanceof Error ? error.message : "falha desconhecida"));
    } finally {
      setSaving(false);
    }
  }

  function removeImage(index: number) {
    setValues((current) => ({ ...current, images: current.images.filter((_, i) => i !== index) }));
  }

  function moveImage(index: number, dir: -1 | 1) {
    setValues((current) => {
      const images = [...current.images];
      const target = index + dir;
      if (target < 0 || target >= images.length) return current;
      [images[index], images[target]] = [images[target], images[index]];
      return { ...current, images };
    });
  }

  async function handleSave() {
    setSaving(true);
    setMsg(null);
    try {
      await saveProtocolTopic(slug, values);
      setMsg("Salvo com sucesso!");
    } catch (error) {
      setMsg("Erro: " + (error instanceof Error ? error.message : "não foi possível salvar"));
    } finally {
      setSaving(false);
    }
  }

  if (!topic) return <p>Tema indisponível.</p>;

  return (
    <div className="max-w-3xl">
      <Link to="/admin/protocolo" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Temas de Protocolo
      </Link>
      <h1 className="mt-2 font-display text-2xl font-bold">{topic.label}</h1>
      <p className="mt-1 text-xs text-muted-foreground">/protocolo-leonistico/{slug}</p>

      {loading ? (
        <p className="mt-6 text-muted-foreground">Carregando...</p>
      ) : (
        <div className="mt-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-foreground">Sobre-título</label>
            <input
              type="text"
              value={values.eyebrow}
              onChange={(e) => patch({ eyebrow: e.target.value })}
              placeholder="Protocolo Leonístico"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Título</label>
            <textarea
              rows={2}
              value={values.title}
              onChange={(e) => patch({ title: e.target.value })}
              placeholder={topic.label}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-sans"
            />
            <BreakHint />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Descrição</label>
            <textarea
              rows={3}
              value={values.description}
              onChange={(e) => patch({ description: e.target.value })}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-sans"
            />
            <BreakHint />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Texto da página</label>
            <textarea
              rows={12}
              value={values.body}
              onChange={(e) => patch({ body: e.target.value })}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-sans"
            />
            <BreakHint />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Imagens (até {MAX_IMAGES})</label>
            {values.images.length > 0 && (
              <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {values.images.map((url, index) => (
                  <div key={url + index} className="relative">
                    <img src={url} alt="" className="h-28 w-full rounded-md object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute right-1 top-1 rounded bg-destructive px-2 py-0.5 text-xs font-semibold text-destructive-foreground"
                    >
                      Remover
                    </button>
                    <div className="absolute left-1 top-1 flex items-center gap-1">
                      <span className="rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => moveImage(index, -1)}
                        disabled={index === 0}
                        title="Mover para a esquerda"
                        className="rounded bg-black/60 p-0.5 text-white hover:bg-black/80 disabled:opacity-30"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(index, 1)}
                        disabled={index === values.images.length - 1}
                        title="Mover para a direita"
                        className="rounded bg-black/60 p-0.5 text-white hover:bg-black/80 disabled:opacity-30"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-2 text-xs text-muted-foreground">{values.images.length} / {MAX_IMAGES} imagens</p>
            {values.images.length < MAX_IMAGES && (
              <label className="mt-1 inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-surface">
                <Upload className="h-4 w-4" /> Adicionar imagem
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && addImage(e.target.files[0])}
                />
              </label>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={values.published}
              onChange={(e) => patch({ published: e.target.checked })}
              className="h-4 w-4"
            />
            Publicar neste tema (aparece no site)
          </label>

          <div className="flex flex-wrap items-center gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-primary px-5 py-2 font-semibold text-primary-foreground disabled:opacity-60"
            >
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
            <Link
              to="/protocolo-leonistico/$slug"
              params={{ slug }}
              className="rounded-md border px-4 py-2 text-sm hover:bg-surface"
            >
              Ver no site
            </Link>
            {msg && <span className="text-sm text-muted-foreground">{msg}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
