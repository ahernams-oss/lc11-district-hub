import { PageHero } from '@/components/PageHero';

export function LeadershipGroupPage({ title }: { title: string }) {
  return <>
    <PageHero eyebrow="Liderança Leonística" title={title} />
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-muted-foreground">Informações em breve.</p>
    </section>
  </>;
}
