export type ClubeStatus = "ativo" | "inativo" | "em_processo" | "status_quo" | "suspenso";

export const CLUBE_STATUS: Record<ClubeStatus, { label: string; color: string }> = {
  ativo: { label: "Ativo", color: "text-emerald-400" },
  inativo: { label: "Inativo", color: "text-slate-400" },
  em_processo: { label: "Em Processo de Fundação", color: "text-amber-400" },
  status_quo: { label: "Status quo", color: "text-sky-400" },
  suspenso: { label: "Suspenso", color: "text-rose-400" },
};

export const CLUBE_STATUS_VALUES = Object.keys(CLUBE_STATUS) as ClubeStatus[];

export function clubeStatusInfo(status: string | null | undefined) {
  return CLUBE_STATUS[(status || "ativo") as ClubeStatus] ?? CLUBE_STATUS.ativo;
}
