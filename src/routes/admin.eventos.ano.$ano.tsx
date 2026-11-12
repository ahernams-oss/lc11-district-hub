import { createFileRoute, notFound } from "@tanstack/react-router";
import { AdminEventYearPage } from "@/components/AdminEventYearPage";
import { eventYearFromSlug, eventYearHead } from "@/lib/event-years";

export const Route = createFileRoute("/admin/eventos/ano/$ano")({
  loader: ({ params }) => {
    const year = eventYearFromSlug(params.ano);
    if (!year) throw notFound();
    return { year };
  },
  head: ({ loaderData }) => eventYearHead(loaderData?.year ?? "Indisponível", true),
  component: YearPage,
});
function YearPage() {
  const { year } = Route.useLoaderData();
  return <AdminEventYearPage year={year} />;
}
