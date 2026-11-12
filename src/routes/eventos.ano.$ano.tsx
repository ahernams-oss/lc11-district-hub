import { createFileRoute, notFound } from "@tanstack/react-router";
import { EventYearPage } from "@/components/EventYearPage";
import { eventYearFromSlug, eventYearHead } from "@/lib/event-years";

export const Route = createFileRoute("/eventos/ano/$ano")({
  loader: ({ params }) => {
    const year = eventYearFromSlug(params.ano);
    if (!year) throw notFound();
    return { year };
  },
  head: ({ loaderData }) => eventYearHead(loaderData?.year ?? "Indisponível", false),
  component: YearPage,
});
function YearPage() {
  const { year } = Route.useLoaderData();
  return <EventYearPage year={year} />;
}
