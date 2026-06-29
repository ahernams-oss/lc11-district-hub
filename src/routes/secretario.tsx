import { createFileRoute } from "@tanstack/react-router";
import { LeaderProfile } from "@/components/LeaderProfile";
import govImg from "@/assets/governador.jpg";

export const Route = createFileRoute("/secretario")({
  head: () => ({
    meta: [
      { title: "Secretário Distrital — Distrito LC-11" },
      { name: "description", content: "Secretário Distrital do Distrito LC-11." },
    ],
    links: [{ rel: "canonical", href: "/secretario" }],
  }),
  component: Page,
});

function Page() {
  return (
    <LeaderProfile
      category="secretario"
      defaults={{
        eyebrow: "Liderança ano Lionistico 2026–2027",
        title: "Secretário Distrital",
        description: "Gestão administrativa e secretariado do Distrito LC-11.",
        name: "CL Nome do Secretário",
        role: "Secretário Distrital do Distrito LC-11",
        email: "secretario@distritolc11.org",
        phone: "(00) 00000-0000",
        message: "",
        bio: "O Secretário Distrital é responsável pela organização das reuniões, registro das atas, correspondência institucional e manutenção dos arquivos do Distrito LC-11, garantindo a transparência e a boa governança administrativa.",
        photo: govImg,
      }}
    />
  );
}
