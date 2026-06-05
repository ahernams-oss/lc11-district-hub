import { createFileRoute, Link } from "@tanstack/react-router";
import { useRegions } from "@/lib/regions";
import { Plus, ChevronRight, MapPin } from "lucide-react";

export const Route = createFileRoute("/admin/regioes/")({
  component: RegionsList,
});

function RegionsList() {
  const { data: regions = [], isLoading } = useRegions();
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Regiões</h1>
          <p className="text-sm text-muted-foreground">
            Cada região contém uma ou mais divisões, que por sua vez agrupam clubes.
          </p>
        </div>
        <Link
          to="/admin/regioes/$id"
          params={{ id: "novo" }}
          className="inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Nova região
        </Link>
      </div>

      {isLoading ? (
        <p className="mt-6 text-muted-foreground">Carregando...</p>
      ) : regions.length === 0 ? (
        <p className="mt-6 text-muted-foreground">Nenhuma região cadastrada.</p>
      ) : (
        <ul className="mt-6 divide-y rounded-md border bg-card">
          {regions.map((r) => (
            <li key={r.id}>
              <Link
                to="/admin/regioes/$id"
                params={{ id: r.id }}
                className="flex items-center gap-3 p-4 hover:bg-surface"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 font-display font-bold text-primary">
                  {r.letter}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground">{r.name}</div>
                  {r.description && (
                    <div className="truncate text-xs text-muted-foreground">{r.description}</div>
                  )}
                </div>
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
