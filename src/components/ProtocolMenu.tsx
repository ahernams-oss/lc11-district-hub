import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PROTOCOL_MENU_ITEMS } from "@/lib/protocol-menu";

export function ProtocolMenu({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const open = expanded || (!mobile && hovered);
  return (
    <div className="relative" onMouseEnter={() => setHovered(true)} onMouseLeave={() => { setHovered(false); if (!mobile) setExpanded(false); }}
      onKeyDown={(event) => { if (event.key === "Escape") { setExpanded(false); setHovered(false); } }}>
      <div className="flex items-center">
        <Link to="/protocolo-leonistico" onClick={onNavigate}
          className="min-w-0 flex-1 rounded-md px-4 py-2 text-sm text-foreground/80 hover:bg-surface hover:text-primary"
          activeProps={{ className: "text-primary bg-surface" }}>
          Protocolo Leonístico
        </Link>
        <Button variant="ghost" size="icon" aria-label="Submenus de Protocolo Leonístico" aria-expanded={open}
          aria-controls={mobile ? "protocol-mobile-menu" : "protocol-desktop-menu"} onClick={() => setExpanded((value) => !value)}>
          <ChevronDown className={!mobile && !open ? "-rotate-90" : undefined} />
        </Button>
      </div>
      {open && (
        <div id={mobile ? "protocol-mobile-menu" : "protocol-desktop-menu"} aria-label="Temas de Protocolo Leonístico"
          className={mobile
            ? "ml-3 flex flex-col border-l border-border pl-3"
            : "absolute left-full top-0 z-50 max-h-[calc(100dvh-14rem)] w-80 overflow-y-auto rounded-md border border-border bg-background py-2 shadow-card"}>
          {PROTOCOL_MENU_ITEMS.map((item) => (
            <Link key={item.slug} to="/protocolo-leonistico/$slug" params={{ slug: item.slug }}
              onClick={() => { setExpanded(false); setHovered(false); onNavigate?.(); }}
              className="block whitespace-normal break-words px-4 py-2 text-sm text-foreground/80 hover:bg-surface hover:text-primary"
              activeProps={{ className: "text-primary bg-surface" }}>
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}