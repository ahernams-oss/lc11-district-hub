import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRegions } from "@/lib/regions";
import { Search, ArrowLeftRight, Pencil, Save, X } from "lucide-react";

export const Route = createFileRoute("/admin/clubes")({
  component: ClubsManager,
});

interface DivisionRow {
  id: string;
  code: string;
  name: string;
  region_id: string;
}

interface ClubRow {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  email: string | null;
  division_id: string;
}

function useAllDivisions() {
  return useQuery({
    queryKey: ["all-divisions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("divisions")
        .select("id, code, name, region_id")
        .order("code");
      if (error) throw error;
      return (data ?? []) as DivisionRow[];
    },
  });
}

function useAdminClubs() {
  return useQuery({
    queryKey: ["admin-clubs-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clubs")
        .select("id, name, city, state, email, division_id")
        .order("name");
      if (error) throw error;
      return (data ?? []) as ClubRow[];
    },
  });
}

function ClubsManager() {
  const qc = useQueryClient();
  const { data: regions = [] } = useRegions();
  const { data: divisions = [] } = useAllDivisions();
  const { data: clubs = [], isLoading } = useAdminClubs();

  const [q, setQ] = useState("");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [divFilter, setDivFilter] = useState<string>("all");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDiv, setBulkDiv] = useState<string>("");
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string | null>(null);

  const divisionById = useMemo(
    () => Object.fromEntries(divisions.map((d) => [d.id, d])),
    [divisions],
  );
  const regionById = useMemo(
    () => Object.fromEntries(regions.map((r) => [r.id, r])),
    [regions],
  );

  const filteredDivisions = useMemo(
    () => (regionFilter === "all" ? divisions : divisions.filter((d) => d.region_id === regionFilter)),
    [divisions, regionFilter],
  );

  const filtered = useMemo(() => {
    return clubs.filter((c) => {
      const div = divisionById[c.division_id];
      if (regionFilter !== "all" && div?.region_id !== regionFilter) return false;
      if (divFilter !== "all" && c.division_id !== divFilter) return false;
      if (stateFilter !== "all" && (c.state ?? "") !== stateFilter) return false;
      if (q.trim()) {
        const s = q.toLowerCase();
        if (
          !c.name.toLowerCase().includes(s) &&
          !(c.city ?? "").toLowerCase().includes(s) &&
          !(c.email ?? "").toLowerCase().includes(s)
        )
          return false;
      }
      return true;
    });
  }, [clubs, q, regionFilter, divFilter, stateFilter, divisionById]);

  const allChecked = filtered.length > 0 && filtered.every((c) => selected.has(c.id));

  function toggle(id: string) {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  }

  async function moveOne(clubId: string, newDivId: string) {
    const { error } = await supabase.from("clubs").update({ division_id: newDivId }).eq("id", clubId);
    if (error) return alert("Erro: " + error.message);
    setEditing((e) => {
      const n = { ...e };
      delete n[clubId];
      return n;
    });
    qc.invalidateQueries({ queryKey: ["admin-clubs-all"] });
    qc.invalidateQueries({ queryKey: ["clubs"] });
    setMsg("Clube movido.");
  }

  async function moveBulk() {
    if (!bulkDiv || selected.size === 0) return;
    if (!confirm(`Mover ${selected.size} clube(s) para a divisão selecionada?`)) return;
    const { error } = await supabase
      .from("clubs")
      .update({ division_id: bulkDiv })
      .in("id", Array.from(selected));
    if (error) return alert("Erro: " + error.message);
    setSelected(new Set());
    setBulkDiv("");
    qc.invalidateQueries({ queryKey: ["admin-clubs-all"] });
    qc.invalidateQueries({ queryKey: ["clubs"] });
    setMsg("Clubes movidos.");
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Gerenciar Clubes</h1>
          <p className="text-sm text-muted-foreground">
            Busque, filtre e mova clubes entre divisões. Edite divisões em{" "}
            <Link to="/admin/regioes" className="text-primary hover:underline">
              Regiões
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="mt-6 grid gap-3 rounded-md border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar nome, cidade ou e-mail..."
            className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-3 text-sm"
          />
        </div>
        <select
          value={regionFilter}
          onChange={(e) => {
            setRegionFilter(e.target.value);
            setDivFilter("all");
          }}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="all">Todas as regiões</option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>
              Região {r.letter} — {r.name}
            </option>
          ))}
        </select>
        <select
          value={divFilter}
          onChange={(e) => setDivFilter(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="all">Todas as divisões</option>
          {filteredDivisions.map((d) => (
            <option key={d.id} value={d.id}>
              Divisão {d.code} — {d.name}
            </option>
          ))}
        </select>
        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="all">Todos os estados</option>
          <option value="ES">ES</option>
          <option value="RJ">RJ</option>
        </select>
      </div>

      {/* Ações em lote */}
      {selected.size > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-md border border-primary/30 bg-primary/5 p-3">
          <span className="text-sm font-medium">{selected.size} selecionado(s)</span>
          <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
          <select
            value={bulkDiv}
            onChange={(e) => setBulkDiv(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          >
            <option value="">Mover para divisão...</option>
            {divisions.map((d) => {
              const r = regionById[d.region_id];
              return (
                <option key={d.id} value={d.id}>
                  {r ? `${r.letter} · ` : ""}Divisão {d.code} — {d.name}
                </option>
              );
            })}
          </select>
          <button
            onClick={moveBulk}
            disabled={!bulkDiv}
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            Mover
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-sm text-muted-foreground hover:text-foreground"
          >
            Limpar seleção
          </button>
        </div>
      )}

      {msg && <p className="mt-3 text-sm text-muted-foreground">{msg}</p>}

      {/* Tabela */}
      <div className="mt-4 overflow-x-auto rounded-md border bg-card">
        {isLoading ? (
          <p className="p-6 text-muted-foreground">Carregando...</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-muted-foreground">Nenhum clube encontrado.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b bg-surface text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-3 w-8">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={(e) => {
                      setSelected(
                        e.target.checked ? new Set(filtered.map((c) => c.id)) : new Set(),
                      );
                    }}
                  />
                </th>
                <th className="p-3">Clube</th>
                <th className="p-3">Cidade/UF</th>
                <th className="p-3">Região</th>
                <th className="p-3">Divisão</th>
                <th className="p-3 w-32"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const div = divisionById[c.division_id];
                const region = div ? regionById[div.region_id] : null;
                const isEditing = c.id in editing;
                return (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-surface/50">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selected.has(c.id)}
                        onChange={() => toggle(c.id)}
                      />
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{c.name}</div>
                      {c.email && <div className="text-xs text-muted-foreground">{c.email}</div>}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {c.city ?? "—"}
                      {c.state ? ` / ${c.state}` : ""}
                    </td>
                    <td className="p-3">
                      {region ? (
                        <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-semibold text-primary">
                          {region.letter}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-3">
                      {isEditing ? (
                        <select
                          value={editing[c.id]}
                          onChange={(e) => setEditing({ ...editing, [c.id]: e.target.value })}
                          className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                        >
                          {divisions.map((d) => {
                            const r = regionById[d.region_id];
                            return (
                              <option key={d.id} value={d.id}>
                                {r ? `${r.letter} · ` : ""}
                                {d.code} — {d.name}
                              </option>
                            );
                          })}
                        </select>
                      ) : div ? (
                        <Link
                          to="/admin/regioes/$id/divisoes/$divId"
                          params={{ id: div.region_id, divId: div.id }}
                          className="font-semibold text-primary hover:underline"
                        >
                          {div.code}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {isEditing ? (
                        <div className="inline-flex gap-1">
                          <button
                            onClick={() => moveOne(c.id, editing[c.id])}
                            className="rounded-md bg-primary p-1.5 text-primary-foreground"
                            title="Salvar"
                          >
                            <Save className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              const n = { ...editing };
                              delete n[c.id];
                              setEditing(n);
                            }}
                            className="rounded-md border p-1.5"
                            title="Cancelar"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditing({ ...editing, [c.id]: c.division_id })}
                          className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-surface"
                          title="Mover de divisão"
                        >
                          <Pencil className="h-3 w-3" /> Mover
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Mostrando {filtered.length} de {clubs.length} clubes.
      </p>
    </div>
  );
}
