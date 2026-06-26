import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/documentos")({
  head: () => ({
    meta: [
      { title: "Documentos — Distrito LC-11" },
      { name: "description", content: "Acesse documentos e materiais oficiais do Distrito LC-11 do Lions Clubs International." },
      { property: "og:title", content: "Documentos — Distrito LC-11" },
      { property: "og:description", content: "Documentos e materiais oficiais do Distrito LC-11." },
      { property: "og:url", content: "/documentos" },
    ],
    links: [{ rel: "canonical", href: "/documentos" }],
  }),
  component: () => <Outlet />,
});
