import { createFileRoute } from '@tanstack/react-router';
import { LeadershipGroupPage } from '@/components/LeadershipGroupPage';

export const Route = createFileRoute('/lideres-lions-internacional')({
  head: () => ({ meta: [
    { title: 'Líderes Lions Internacional — Distrito LC-11' },
    { name: 'description', content: 'Liderança do Lions Clubs International.' },
    { property: 'og:title', content: 'Líderes Lions Internacional — Distrito LC-11' },
    { property: 'og:description', content: 'Liderança do Lions Clubs International.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: () => <LeadershipGroupPage contentKey="lideres-lions-internacional" title="Líderes Lions Internacional" />,
});
