import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { FileText } from "lucide-react";

export const Route = createFileRoute("/documentos/")({
  component: DocumentosIndex,
});

function DocumentosIndex() {
  return (
    <>
      <PageHero
        eyebrow="Transparência"
        title="Documentos"
        description="Acesse documentos e materiais oficiais do Distrito LC-11."
      />

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-6 text-center">
          <FileText className="h-16 w-16 text-muted-foreground/40" />
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Em breve</h2>
            <p className="mt-2 text-muted-foreground">
              Estamos organizando os documentos oficiais do distrito. Em breve,
              esta página conterá atas, regulamentos, formulários e demais
              materiais de consulta pública.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}