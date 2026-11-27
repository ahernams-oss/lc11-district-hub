import { createFileRoute } from "@tanstack/react-router";
import { LeadershipGroupPage } from "@/components/LeadershipGroupPage";

export const Route = createFileRoute("/idll")({
  head: () => ({ meta: [
    { title: "IDLL — Instituto Distrital de Liderança Leonística | LC-11" },
    { name: "description", content: "Membros, fotos e currículos do Instituto Distrital de Liderança Leonística do Distrito LC-11." },
    { property: "og:title", content: "IDLL — Instituto Distrital de Liderança Leonística | LC-11" },
    { property: "og:description", content: "Conheça os membros e currículos do IDLL do Distrito LC-11." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: IdllPage,
});

function IdllPage() {
  return <LeadershipGroupPage title="IDLL" contentKey="idll" />;
}