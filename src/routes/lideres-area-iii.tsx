import { createFileRoute } from '@tanstack/react-router';
import { LeadershipGroupPage } from '@/components/LeadershipGroupPage';

export const Route = createFileRoute('/lideres-area-iii')({
  head: () => ({ meta: [
    { title: 'Líderes Área III — Distrito LC-11' },
    { name: 'description', content: 'Liderança da Área III do Lions Internacional.' },
    { property: 'og:title', content: 'Líderes Área III — Distrito LC-11' },
    { property: 'og:description', content: 'Liderança da Área III do Lions Internacional.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: () => <LeadershipGroupPage contentKey="lideres-area-iii" title="Líderes Área III" />,
});
