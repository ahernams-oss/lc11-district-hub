import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { EVENT_YEARS } from "@/lib/event-years";

export function EventYearLinks({ year, admin = false }: { year: string; admin?: boolean }) {
  return <nav aria-label="Anos leonísticos dos eventos" className="my-6 flex flex-wrap gap-2">
    {EVENT_YEARS.map((item) => <Button key={item} asChild variant={item === year ? "default" : "outline"}>
      {admin ? <Link to="/admin/eventos/ano/$ano" params={{ ano: item.replace("/", "-") }} aria-current={item === year ? "page" : undefined}>AL {item}</Link>
        : <Link to="/eventos/ano/$ano" params={{ ano: item.replace("/", "-") }} aria-current={item === year ? "page" : undefined}>AL {item}</Link>}
    </Button>)}
  </nav>;
}