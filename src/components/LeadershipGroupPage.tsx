import { PageHero } from '@/components/PageHero';
import { BreakableText } from '@/components/BreakableText';
import { useSiteContent, type ContentKey } from '@/lib/content';

export function LeadershipGroupPage({ title, contentKey }: { title: string; contentKey: ContentKey }) {
  const content = useSiteContent(contentKey, {
    eyebrow: 'Liderança Leonística', title, description: '', body: '', image_url: '',
  });
  return <>
    <PageHero eyebrow={content.eyebrow} title={content.title || title} description={content.description} />
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      {content.image_url && <img src={content.image_url} alt={content.title || title} className="mb-8 max-h-96 max-w-full rounded-md object-contain" />}
      {content.body ? <div className="whitespace-pre-line break-words text-foreground"><BreakableText text={content.body} /></div>
        : <p className="text-muted-foreground">Informações em breve.</p>}
    </section>
  </>;
}
