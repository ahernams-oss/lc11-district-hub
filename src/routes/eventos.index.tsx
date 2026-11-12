import { createFileRoute } from "@tanstack/react-router";
import { EventYearPage } from "@/components/EventYearPage";
import { DEFAULT_EVENT_YEAR, eventYearHead } from "@/lib/event-years";

export const Route = createFileRoute("/eventos/")({
  head: () => eventYearHead(DEFAULT_EVENT_YEAR),
  component: Eventos,
});
function Eventos() { return <EventYearPage year={DEFAULT_EVENT_YEAR} />; }
