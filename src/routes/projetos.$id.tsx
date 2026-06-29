import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHero } from "@/components/PageHero";
import { useProject } from "@/lib/projects";
import { ArrowLeft, Pencil } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/projetos/$id")({
  component: ProjectDetail,
});

function ProjectBanner({ images, alt }: { images: string[]; alt: string }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % images.length), 4000);
    return () => clearInterval(t);
  }, [images.length]);
  if (images.length === 0) return null;
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-white shadow-card">
      {images.map((src, i) => (
        <img
          key={src + i}
          src={src}
          alt={alt}
          className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-700 ${
            i === idx ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`Foto ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === idx ? "w-8 bg-primary" : "w-2 bg-primary/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectDetail() {
  const { id } = Route.useParams();
  const { data: project, isLoading } = useProject(id);
  const { canEditContent } = useAuth();

  if (isLoading) {
    return <p className="mx-auto max-w-7xl px-4 py-16 text-muted-foreground">Carregando...</p>;
  }
  if (!project) throw notFound();

  const images = [project.cover_url, ...(project.gallery_urls ?? [])].filter(Boolean) as string[];

  return (
    <>
      <PageHero
        eyebrow={project.tag ?? "Projeto"}
        title={project.title}
        description={project.description ?? undefined}
      />
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/projetos"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para Projetos
          </Link>
          {canEditContent && (
            <Link
              to="/admin/projetos/$id"
              params={{ id: project.id }}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-semibold hover:border-primary"
            >
              <Pencil className="h-4 w-4" /> Editar
            </Link>
          )}
        </div>

        {images.length > 0 && (
          <div className="mt-6">
            <ProjectBanner images={images} alt={project.title} />
          </div>
        )}

        {project.content && (
          <article className="prose prose-neutral mt-10 max-w-none whitespace-pre-wrap text-foreground">
            {project.content}
          </article>
        )}
      </section>
    </>
  );
}
