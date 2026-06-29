import { createFileRoute } from "@tanstack/react-router";
import { LeaderProfile } from "@/components/LeaderProfile";
import govImg from "@/assets/governador.jpg";

export const Route = createFileRoute("/vice-governador-1")({
  head: () => ({ meta: [{ title: "1º Vice-Governador — Distrito LC-11" }] }),
  component: Page,
});

function Page() {
  return (
    <LeaderProfile
      category="vice1"
      defaults={{
        eyebrow: "Liderança ano Lionistico 2026–2027",
        title: "1º Vice-Governador do Distrito LC-11",
        description: "Apoiando o Governador e preparando o próximo ano leonístico.",
        name: "CL Nome do 1º Vice-Governador",
        role: "1º Vice-Governador do Distrito LC-11",
        email: "1vice@distritolc11.org",
        phone: "(00) 00000-0000",
        message: "",
        bio: "Companheiro Leão com ampla experiência no movimento leonístico.",
        photo: govImg,
      }}
    />
  );
}
