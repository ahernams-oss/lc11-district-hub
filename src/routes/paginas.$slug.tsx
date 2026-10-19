import { createFileRoute, notFound } from "@tanstack/react-router";
import { getPublicPage } from "@/lib/site-pages.functions";
import { PAGE_MENUS } from "@/lib/site-pages";
import { BreakableText } from "@/components/BreakableText";

export const Route = createFileRoute("/paginas/$slug")({
  loader: async ({ params }) => {
    const page = await getPublicPage({ data: { slug: params.slug } });
    if (!page) throw notFound();
    return page;
  },
  head: ({ loaderData: page }) => {
    const title = page ? `${page.title.replace(/\*\*/g, "")} — Distrito LC-11` : "Página indisponível — Distrito LC-11";
    const description = page?.description.replace(/\*\*/g, "").replace(/\/\//g, " ") || "Conteúdo oficial do Distrito LC-11.";
    return { meta: [
      { title }, { name: "description", content: description },
      { property: "og:title", content: title }, { property: "og:description", content: description },
      { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary_large_image" },
      ...(!page ? [{ name: "robots", content: "noindex" }] : []),
      ...(page?.image_url.startsWith("https://") ? [{ property: "og:image", content: page.image_url }, { name: "twitter:image", content: page.image_url }] : []),
    ] };
  },
  component: PublicSubpage,
});

function PublicSubpage() {
  const page = Route.useLoaderData();
  return <article className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
    <p className="text-sm font-semibold text-primary">{PAGE_MENUS[page.menu_key]}</p>
    <h1 className="mt-3 break-words font-display text-3xl font-bold sm:text-4xl"><BreakableText text={page.title} /></h1>
    {page.description && <p className="mt-5 text-lg text-muted-foreground"><BreakableText text={page.description} /></p>}
    {page.image_url && <img src={page.image_url} alt={page.title.replace(/\*\*/g, "")} className="mt-8 max-h-[480px] w-full rounded-md object-contain" />}
    <div className="mt-8 break-words text-base leading-relaxed [&_.block+_.block]:mt-4"><BreakableText text={page.body} /></div>
  </article>;
}