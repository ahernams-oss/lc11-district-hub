import { Link } from '@tanstack/react-router';
import { User } from 'lucide-react';
import { useLeaders } from '@/lib/leaders';
import { PageHero } from '@/components/PageHero';
import { BreakableText } from '@/components/BreakableText';
import { useSiteContent, type ContentKey } from '@/lib/content';

export function LeadershipGroupPage({ title, contentKey }: { title: string; contentKey: ContentKey }) {
  const content = useSiteContent(contentKey, {
    eyebrow: 'Liderança Leonística', title, description: contentKey === 'idll' ? 'Instituto Distrital de Liderança Leonística' : '', body: '', image_url: '',
  });
  const category = contentKey === "idll" ? "idll" : contentKey === "lideres-lions-internacional" ? "lions_internacional" : contentKey === "lideres-area-iii" ? "area_iii" : "dmlc";
  const { data: leaders = [], isLoading, isError } = useLeaders(category);
  return <>
    <PageHero eyebrow={content.eyebrow} title={content.title || title} description={content.description} />
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      {content.image_url && <img src={content.image_url} alt={content.title || title} className="mb-8 max-h-96 max-w-full rounded-md object-contain" />}
      {content.body ? <div className="whitespace-pre-line break-words text-foreground"><BreakableText text={content.body} /></div>
        : null}
      {isLoading ? <p className="text-muted-foreground">Carregando...</p> : isError ? <p className="text-destructive">Não foi possível carregar os membros. Tente novamente.</p> : leaders.length === 0 ? <p className="text-muted-foreground">{category === 'idll' ? 'Nenhum membro cadastrado ainda.' : 'Nenhum líder cadastrado ainda.'}</p> : <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {leaders.map((leader) => <Link key={leader.id} to="/lideres/$id" params={{ id: leader.id }} className="flex flex-col items-center rounded-md border border-border bg-card p-6 text-center shadow-card hover:shadow-elegant">
          {leader.photo_url ? <img src={leader.photo_url} alt={leader.name} className="h-32 w-32 rounded-full object-cover" /> : <div className="flex h-32 w-32 items-center justify-center rounded-full bg-surface"><User className="h-16 w-16 text-muted-foreground" /></div>}
          <h2 className="mt-4 font-display text-xl font-bold"><BreakableText text={leader.name} /></h2>
          {leader.role && <p className="mt-2 text-sm text-primary"><BreakableText text={leader.role} /></p>}
          {leader.club_name && <p className="mt-1 text-sm text-muted-foreground"><BreakableText text={leader.club_name} /></p>}
          {leader.year_label && <p className="mt-2 font-semibold text-primary"><BreakableText text={leader.year_label} /></p>}
          {leader.motto && <p className="mt-2 text-sm italic text-muted-foreground"><BreakableText text={leader.motto} /></p>}
          <span className="mt-4 text-sm font-medium text-primary">{category === 'idll' ? 'Ver currículo →' : 'Ver biografia →'}</span>
        </Link>)}
      </div>}
    </section>
  </>;
}
