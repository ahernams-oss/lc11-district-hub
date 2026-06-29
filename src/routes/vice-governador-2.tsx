import { createFileRoute } from "@tanstack/react-router";
import { LeaderProfile } from "@/components/LeaderProfile";
import govImg from "@/assets/governador.jpg";

export const Route = createFileRoute("/vice-governador-2")({
  head: () => ({ meta: [{ title: "2º Vice-Governador — Distrito LC-11" }] }),
  component: Page,
});

function Page() {
  return (
    <LeaderProfile
      category="vice2"
      defaults={{
        eyebrow: "Liderança ano Lionistico 2026–2027",
        title: "2º Vice-Governador do Distrito LC-11",
        description: "Contribuindo com a liderança distrital e a formação de novos Leões.",
        name: "CL Nome do 2º Vice-Governador",
        role: "2º Vice-Governador do Distrito LC-11",
        email: "2vice@distritolc11.org",
        phone: "(00) 00000-0000",
        message: "",
        bio: "Líder dedicado às causas globais do Lions.",
        photo: govImg,
      }}
    />
  );
}
