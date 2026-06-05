import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Youtube, Mail } from "lucide-react";
import lionsLogo from "@/assets/lions-logo.png.asset.json";


export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-primary-deep text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <img src={lionsLogo.url} alt="Lions Clubs International" className="h-11 w-11 object-contain bg-white rounded-md p-1" />
            <div>
              <div className="font-display text-lg font-bold">Distrito LC-11</div>
              <div className="text-xs uppercase tracking-wider opacity-75">Lions Clubs International</div>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm opacity-80">
            Servindo comunidades com compaixão, integridade e união desde 1917.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider">Navegação</h4>
          <ul className="mt-4 space-y-2 text-sm opacity-90">
            <li><Link to="/sobre" className="hover:text-gold">Sobre o Distrito</Link></li>
            <li><Link to="/governador" className="hover:text-gold">Governador</Link></li>
            <li><Link to="/projetos" className="hover:text-gold">Projetos</Link></li>
            <li><Link to="/clubes" className="hover:text-gold">Nossos Clubes</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider">Participe</h4>
          <ul className="mt-4 space-y-2 text-sm opacity-90">
            <li><Link to="/eventos" className="hover:text-gold">Próximos eventos</Link></li>
            <li><Link to="/noticias" className="hover:text-gold">Notícias</Link></li>
            <li><Link to="/doar" className="hover:text-gold">Doar</Link></li>
            <li><Link to="/contato" className="hover:text-gold">Seja um Leão</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider">Contato</h4>
          <ul className="mt-4 space-y-2 text-sm opacity-90">
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /><span>contato@distritolc11.org</span></li>
            <li>Sede do Distrito LC-11</li>
            <li>Brasil</li>
          </ul>
          <div className="mt-4 flex gap-3">
            <a href="#" aria-label="Facebook" className="rounded-md border border-white/20 p-2 hover:bg-white/10"><Facebook className="h-4 w-4" /></a>
            <a href="#" aria-label="Instagram" className="rounded-md border border-white/20 p-2 hover:bg-white/10"><Instagram className="h-4 w-4" /></a>
            <a href="#" aria-label="YouTube" className="rounded-md border border-white/20 p-2 hover:bg-white/10"><Youtube className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-4 py-5 text-xs opacity-75 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Distrito LC-11 — Lions Clubs International. Todos os direitos reservados.</p>
          <p>"Nós Servimos" — We Serve</p>
        </div>
      </div>
    </footer>
  );
}
