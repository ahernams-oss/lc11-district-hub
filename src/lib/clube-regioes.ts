export const CLUBE_REGIOES = ["Região A", "Região B", "Região C", "Região D", "Região E", "Região F"];

export function normalizarRegiao(regiao: string | null | undefined): string {
  const texto = (regiao ?? "").trim();
  const letra = texto.match(/^(?:regi[aã]o\s+)?([a-f])(?=$|\s|[—–-])/i)?.[1];
  return letra ? `Região ${letra.toUpperCase()}` : texto;
}

export function correspondeRegiao(regiao: string | null | undefined, filtro: string): boolean {
  return filtro === "todos" || normalizarRegiao(regiao) === normalizarRegiao(filtro);
}

export function opcoesRegioes(clubes: ReadonlyArray<{ regiao?: string | null }>): string[] {
  return Array.from(new Set([...CLUBE_REGIOES, ...clubes.map((clube) => normalizarRegiao(clube.regiao)).filter(Boolean)]))
    .sort((a, b) => a.localeCompare(b, "pt-BR"));
}