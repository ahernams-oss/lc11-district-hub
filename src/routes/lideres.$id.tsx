import { createFileRoute } from '@tanstack/react-router';
import { InstitutionalLeaderBio } from '@/components/InstitutionalLeaderBio';
export const Route = createFileRoute('/lideres/$id')({
  head: () => ({ meta: [
    { title: 'Biografia do Líder — Distrito LC-11' },
    { name: 'description', content: 'Trajetória e galeria de fotos dos líderes leonísticos.' },
    { property: 'og:title', content: 'Biografia do Líder — Distrito LC-11' },
    { property: 'og:description', content: 'Trajetória e galeria de fotos dos líderes leonísticos.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: LeaderBio,
});
function LeaderBio() { const { id } = Route.useParams(); return <InstitutionalLeaderBio id={id} />; }
