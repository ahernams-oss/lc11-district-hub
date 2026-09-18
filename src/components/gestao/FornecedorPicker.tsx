import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Building2, Check } from "lucide-react";
import { listFornecedores } from "@/lib/fornecedores.functions";

type Fornecedor = { id: string; nome: string; nome_fantasia?: string | null; documento?: string | null; cidade?: string | null };

type Props = {
  /** id do fornecedor selecionado */
  value?: string | null;
  /** nome livre digitado (compatibilidade com o campo texto antigo) */
  textValue?: string | null;
  onChange: (sel: { id: string | null; nome: string }) => void;
  placeholder?: string;
};

/**
 * Campo de busca otimizado de fornecedores: digita e filtra no servidor
 * (debounce 250ms), com fallback para texto livre.
 */
export function FornecedorPicker({ value, textValue, onChange, placeholder }: Props) {
  const list = useServerFn(listFornecedores);
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState(textValue ?? "");
  const [debounced, setDebounced] = useState(term);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => setTerm(textValue ?? ""), [textValue]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(term), 250);
    return () => clearTimeout(t);
  }, [term]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const { data, isFetching } = useQuery({
    queryKey: ["fornecedores-busca", debounced],
    queryFn: () => list({ data: { busca: debounced || undefined, apenasAtivos: true, limite: 20 } }),
    enabled: open,
    staleTime: 30_000,
  });

  const rows = useMemo(() => (data ?? []) as unknown as Fornecedor[], [data]);

  function select(f: Fornecedor) {
    onChange({ id: f.id, nome: f.nome });
    setTerm(f.nome);
    setOpen(false);
  }

  return (
    <div ref={boxRef} className="relative">
      <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 focus-within:border-primary">
        <Search className="h-4 w-4 shrink-0 text-slate-500" />
        <input
          value={term}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setTerm(e.target.value);
            setOpen(true);
            onChange({ id: null, nome: e.target.value });
          }}
          placeholder={placeholder ?? "Buscar fornecedor por nome, CNPJ ou cidade..."}
          className="w-full bg-transparent py-2 text-sm text-white outline-none placeholder:text-slate-500"
        />
        {value && (
          <span title="Fornecedor cadastrado vinculado" className="shrink-0">
            <Check className="h-4 w-4 text-emerald-400" />
          </span>
        )}
        {term && (
          <button
            type="button"
            onClick={() => {
              setTerm("");
              onChange({ id: null, nome: "" });
            }}
            className="shrink-0 text-slate-500 hover:text-white"
            title="Limpar"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-white/10 bg-[#0d1321] shadow-2xl">
          {isFetching && rows.length === 0 ? (
            <div className="px-3 py-3 text-xs text-slate-500">Buscando...</div>
          ) : rows.length === 0 ? (
            <div className="px-3 py-3 text-xs text-slate-500">
              Nenhum fornecedor cadastrado encontrado. O nome digitado será usado como texto livre.
            </div>
          ) : (
            rows.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => select(f)}
                className={`flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-white/5 ${value === f.id ? "bg-primary/10" : ""}`}
              >
                <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
                <span className="min-w-0">
                  <span className="block truncate text-sm text-white">{f.nome}</span>
                  <span className="block truncate text-[11px] text-slate-500">
                    {[f.nome_fantasia, f.documento, f.cidade].filter(Boolean).join(" • ") || "—"}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
