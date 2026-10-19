import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { BreakableText } from "./BreakableText";
import { pagesForMenu, usePublishedPages, type PageMenu } from "@/lib/site-pages";

export function SubpageMenuLinks({ menu, onClick }: { menu: PageMenu; onClick?: () => void }) {
  const { data = [] } = usePublishedPages();
  return pagesForMenu(data, menu).map((page) => (
    <Link key={page.id} to="/paginas/$slug" params={{ slug: page.slug }} onClick={onClick}
      className="block break-words px-4 py-2 text-sm text-foreground/80 hover:bg-surface hover:text-primary"
      activeProps={{ className: "text-primary bg-surface" }}>
      <BreakableText text={page.menu_label || page.title} />
    </Link>
  ));
}

export function SubpageDropdown({ menu, children }: { menu: PageMenu; children: ReactNode }) {
  const { data = [] } = usePublishedPages();
  if (pagesForMenu(data, menu).length === 0) return children;
  return <div className="group/subpage relative flex items-center">
    {children}<ChevronDown className="h-3 w-3 text-muted-foreground" />
    <div className="absolute right-0 top-full hidden max-h-96 w-64 overflow-y-auto rounded-md border border-border bg-background py-2 shadow-card group-hover/subpage:block group-focus-within/subpage:block">
      <SubpageMenuLinks menu={menu} />
    </div>
  </div>;
}