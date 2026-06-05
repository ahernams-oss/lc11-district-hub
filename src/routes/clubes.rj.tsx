import { createFileRoute } from "@tanstack/react-router";
import { ClubesPorEstado } from "@/components/ClubesPorEstado";

export const Route = createFileRoute("/clubes/rj")({
  head: () => ({
    meta: [
      { title: "Clubes do RJ — Distrito LC-11" },
      { name: "description", content: "Clubes Lions do Rio de Janeiro no Distrito LC-11." },
      { property: "og:title", content: "Clubes do Rio de Janeiro — Distrito LC-11" },
      { property: "og:description", content: "Conheça os clubes Lions do Rio de Janeiro." },
      { property: "og:url", content: "/clubes/rj" },
    ],
    links: [{ rel: "canonical", href: "/clubes/rj" }],
  }),
  component: () => (
    <ClubesPorEstado
      estado="RJ"
      titulo="Clubes do Rio de Janeiro."
      descricao="Conheça os clubes Lions ativos no estado do Rio de Janeiro."
    />
  ),
});
