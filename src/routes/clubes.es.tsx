import { createFileRoute } from "@tanstack/react-router";
import { ClubesPorEstado } from "@/components/ClubesPorEstado";

export const Route = createFileRoute("/clubes/es")({
  head: () => ({
    meta: [
      { title: "Clubes do ES — Distrito LC-11" },
      { name: "description", content: "Clubes Lions do Espírito Santo no Distrito LC-11." },
      { property: "og:title", content: "Clubes do Espírito Santo — Distrito LC-11" },
      { property: "og:description", content: "Conheça os clubes Lions do Espírito Santo." },
      { property: "og:url", content: "/clubes/es" },
    ],
    links: [{ rel: "canonical", href: "/clubes/es" }],
  }),
  component: () => (
    <ClubesPorEstado
      estado="ES"
      titulo="Clubes do Espírito Santo."
      descricao="Conheça os clubes Lions ativos no estado do Espírito Santo."
    />
  ),
});
