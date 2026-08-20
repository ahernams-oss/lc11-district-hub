// Ano leônico: 1º de julho a 30 de junho do ano seguinte.

export function anoLeonicoDe(date: Date | string = new Date()): string {
  const d = typeof date === "string" ? new Date(date + (date.length === 10 ? "T00:00:00" : "")) : date;
  const y = d.getFullYear();
  const inicio = d.getMonth() >= 6 ? y : y - 1; // julho = mês 6
  return `${inicio}-${inicio + 1}`;
}

export function inicioAnoLeonico(ano: string): string {
  const inicio = Number(ano.split(/[-/]/)[0]);
  return `${inicio}-07-01`;
}

export function fimAnoLeonico(ano: string): string {
  const inicio = Number(ano.split(/[-/]/)[0]);
  return `${inicio + 1}-06-30`;
}

/** Lista de anos leônicos para seleção (passados e futuros próximos). */
export function opcoesAnosLeonicos(range = 6): string[] {
  const atual = Number(anoLeonicoDe().split("-")[0]);
  const anos: string[] = [];
  for (let i = atual + 1; i >= atual - range; i--) anos.push(`${i}-${i + 1}`);
  return anos;
}
