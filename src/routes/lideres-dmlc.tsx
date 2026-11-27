import { createFileRoute } from '@tanstack/react-router';
import { LeadershipGroupPage } from '@/components/LeadershipGroupPage';

export const Route = createFileRoute('/lideres-dmlc')({
  head: () => ({ meta: [
    { title: 'Líderes DMLC — Distrito LC-11' },
    { name: 'description', content: 'Liderança do Distrito Múltiplo LC.' },
    { property: 'og:title', content: 'Líderes DMLC — Distrito LC-11' },
    { property: 'og:description', content: 'Liderança do Distrito Múltiplo LC.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: () => <LeadershipGroupPage contentKey="lideres-dmlc" title="Líderes DMLC" />,
});
