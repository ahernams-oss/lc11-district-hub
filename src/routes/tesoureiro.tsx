import { createFileRoute } from "@tanstack/react-router";
import { LeaderProfile } from "@/components/LeaderProfile";
import govImg from "@/assets/governador.jpg";

export const Route = createFileRoute("/tesoureiro")({
  head: () => ({
    meta: [
      { title: "Tesoureiro Distrital — Distrito LC-11" },
      { name: "description", content: "Tesoureiro Distrital do Distrito LC-11." },
    ],
    links: [{ rel: "canonical", href: "/tesoureiro" }],
  }),
  component: Page,
});

function Page() {
  return (
    <LeaderProfile
      category="tesoureiro"
      defaults={{
        eyebrow: "Liderança ano Lionistico 2026–2027",
        title: "Tesoureiro Distrital",
        description: "Gestão financeira e tesouraria do Distrito LC-11.",
        name: "CL Nome do Tesoureiro",
        role: "Tesoureiro Distrital do Distrito LC-11",
        email: "tesoureiro@distritolc11.org",
        phone: "(00) 00000-0000",
        message: "",
        bio: "O Tesoureiro Distrital administra os recursos financeiros do Distrito LC-11, zelando pela arrecadação, controle de despesas, prestação de contas e planejamento orçamentário em conformidade com as normas do Lions Clubs International.",
        photo: govImg,
      }}
    />
  );
}
