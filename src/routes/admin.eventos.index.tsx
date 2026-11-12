import { createFileRoute } from "@tanstack/react-router";
import { AdminEventYearPage } from "@/components/AdminEventYearPage";
import { DEFAULT_EVENT_YEAR, eventYearHead } from "@/lib/event-years";

export const Route = createFileRoute("/admin/eventos/")({
  head: () => eventYearHead(DEFAULT_EVENT_YEAR, true),
  component: EventsList,
});
function EventsList() { return <AdminEventYearPage year={DEFAULT_EVENT_YEAR} />; }
