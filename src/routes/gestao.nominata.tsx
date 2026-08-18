import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Users,
  Building2,
  Plus,
  Edit2,
  Trash2,
  X,
  FileText,
  Printer,
  ShieldCheck,
  CheckCircle,
  Mail,
  Phone,
  MessageCircle,
} from "lucide-react";
import { GestaoHeader } from "@/components/gestao/GestaoHeader";
import { listClubes, listAssociados } from "@/lib/clubes-associados.functions";
import { getNominataByClube, upsertNominataCargo, deleteNominataCargo } from "@/lib/distrito-avancado.functions";

export const Route = createFileRoute("/gestao/nominata")({
  component: GestaoNominataPage,
});

function GestaoNominataPage() {
  const queryClient = useQueryClient();
  const [selectedClubeId, setSelectedClubeId] = useState<string>("");
  const [anoLeonico, setAnoLeonico] = useState("2025/2026");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [formData, setFormData] = useState({
    id: "",
    clube_id: "",
    ano_leonico: "2025/2026",
    cargo: "Presidente",
    nome_oficial: "",
    email: "",
    telefone: "",
    whatsapp: "",
  });

  const { data: clubes } = useQuery({
    queryKey: ["dist-clubes"],
    queryFn: () => listClubes(),
  });

  // Set default selected club when loaded
  const currentClubeId = selectedClubeId || clubes?.[0]?.id || "";

  const { data: nominata, isLoading } = useQuery({
    queryKey: ["nominata-clube", currentClubeId, anoLeonico],
    queryFn: () => getNominataByClube({ data: { clube_id: currentClubeId, ano_leonico: anoLeonico } }),
    enabled: !!currentClubeId,
  });

  const { data: associados } = useQuery({
    queryKey: ["dist-associados", currentClubeId],
    queryFn: () => listAssociados({ data: { clube_id: currentClubeId } }),
    enabled: !!currentClubeId,
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => upsertNominataCargo({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nominata-clube"] });
      setDrawerOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (data: any) => deleteNominataCargo({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nominata-clube"] });
    },
  });

  const resetForm = () => {
    setFormData({
      id: "",
      clube_id: currentClubeId,
      ano_leonico: anoLeonico,
      cargo: "Presidente",
      nome_oficial: "",
      email: "",
      telefone: "",
      whatsapp: "",
    });
  };

  const handleEdit = (item: any) => {
    setFormData({
      id: item.id,
      clube_id: item.clube_id,
      ano_leonico: item.ano_leonico,
      cargo: item.cargo,
      nome_oficial: item.nome_oficial,
      email: item.email || "",
      telefone: item.telefone || "",
      whatsapp: item.whatsapp || "",
    });
    setDrawerOpen(true);
  };

  const handleSelectAssociado = (assocId: string) => {
    const found = associados?.find((a) => a.id === assocId);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        nome_oficial: found.nome,
        email: found.email || "",
        telefone: found.telefone || "",
        whatsapp: found.whatsapp || "",
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      ...formData,
      clube_id: currentClubeId,
      id: formData.id || undefined,
    });
  };

  const currentClube = clubes?.find((c) => c.id === currentClubeId);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 pb-12">
      <GestaoHeader title="Nominata do Clube" breadcrumbs={["Gestão", "Clubes & Associados", "Nominata"]} />

      <div className="p-6 space-y-6">
        {/* Banner com Seleção de Clube e Ano Leônico */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5">
          <div className="flex flex-wrap items-center gap-4 flex-1">
            <div className="min-w-[260px]">
              <label className="block text-xs font-semibold text-slate-400 mb-1">Selecione o Lions Clube</label>
              <select
                value={currentClubeId}
                onChange={(e) => setSelectedClubeId(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#0d1321] px-3 py-2 text-sm text-white focus:border-primary focus:outline-none [&>option]:bg-[#0d1321] [&>option]:text-white font-semibold"
              >
                {clubes?.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#0d1321] text-white">
                    {c.nome} ({c.cidade})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Ano Leônico</label>
              <select
                value={anoLeonico}
                onChange={(e) => setAnoLeonico(e.target.value)}
                className="rounded-lg border border-white/10 bg-[#0d1321] px-3 py-2 text-sm text-white focus:border-primary focus:outline-none [&>option]:bg-[#0d1321] [&>option]:text-white font-semibold"
              >
                <option value="2025/2026" className="bg-[#0d1321] text-white">AL 2025/2026</option>
                <option value="2024/2025" className="bg-[#0d1321] text-white">AL 2024/2025</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                resetForm();
                setDrawerOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-deep transition-all"
            >
              <Plus className="h-4 w-4" />
              Adicionar Cargo na Nominata
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/10"
              title="Imprimir Nominata Oficial"
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </button>
          </div>
        </div>

        {/* Tabela de Nominata */}
        <div className="rounded-xl border border-white/8 bg-[#0d1321] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="font-display text-lg font-bold text-white">
                Nominata Oficial — {currentClube?.nome || "Lions Clube"}
              </h3>
              <p className="text-xs text-slate-400">
                Diretoria Executiva e Conselho de Administração para o Ano Leônico {anoLeonico}
              </p>
            </div>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full font-semibold border border-emerald-500/20">
              ● Nominata Registrada no Distrito
            </span>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-sm text-slate-500">Carregando nominata...</div>
          ) : nominata?.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              Nenhuma nominata informada para este Ano Leônico. Clique em "Adicionar Cargo" para registrar a diretoria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nominata?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between rounded-xl border border-white/8 bg-white/[0.02] p-4 hover:border-primary/40 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20 font-bold text-primary text-sm">
                      {item.nome_oficial.charAt(0)}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                        {item.cargo}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{item.nome_oficial}</h4>
                      <div className="mt-2 space-y-1 text-xs text-slate-400">
                        {item.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-slate-500" />
                            <span>{item.email}</span>
                          </div>
                        )}
                        {item.whatsapp && (
                          <div className="flex items-center gap-1.5">
                            <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
                            <a
                              href={`https://wa.me/55${item.whatsapp.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-400 hover:underline"
                            >
                              {item.whatsapp}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-1.5 rounded text-slate-400 hover:bg-white/10 hover:text-white"
                      title="Editar dirigente"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remover ${item.cargo} da nominata?`)) {
                          deleteMutation.mutate({ id: item.id });
                        }
                      }}
                      className="p-1.5 rounded text-slate-400 hover:bg-white/10 hover:text-red-400"
                      title="Excluir"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Drawer de Adicionar / Editar Dirigente na Nominata */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0d1321] border-l border-white/10 p-6 shadow-2xl overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h3 className="font-display text-lg font-bold text-white">
                  {formData.id ? "Editar Cargo na Nominata" : "Adicionar Cargo na Nominata"}
                </h3>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form id="nominataForm" onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Preencher a partir de Associado do Clube</label>
                  <select
                    onChange={(e) => handleSelectAssociado(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#0d1321] px-3 py-2 text-sm text-white focus:border-primary focus:outline-none [&>option]:bg-[#0d1321] [&>option]:text-white"
                  >
                    <option value="" className="bg-[#0d1321] text-white">Selecione um membro do clube para autopreencher...</option>
                    {associados?.map((a) => (
                      <option key={a.id} value={a.id} className="bg-[#0d1321] text-white">
                        {a.nome} ({a.cargo_clube})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Cargo no Clube *</label>
                  <select
                    required
                    value={formData.cargo}
                    onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-[#0d1321] px-3 py-2 text-sm text-white focus:border-primary focus:outline-none [&>option]:bg-[#0d1321] [&>option]:text-white"
                  >
                    <option value="Presidente" className="bg-[#0d1321] text-white">Presidente</option>
                    <option value="1º Vice-Presidente" className="bg-[#0d1321] text-white">1º Vice-Presidente</option>
                    <option value="2º Vice-Presidente" className="bg-[#0d1321] text-white">2º Vice-Presidente</option>
                    <option value="Secretária" className="bg-[#0d1321] text-white">Secretário(a)</option>
                    <option value="Tesoureiro" className="bg-[#0d1321] text-white">Tesoureiro(a)</option>
                    <option value="Diretor de Associados (GMT)" className="bg-[#0d1321] text-white">Diretor de Associados (GMT)</option>
                    <option value="Diretor de Serviço (GST)" className="bg-[#0d1321] text-white">Diretor de Serviço (GST)</option>
                    <option value="Coordenador LCIF" className="bg-[#0d1321] text-white">Coordenador LCIF</option>
                    <option value="Diretor de Animação / Social" className="bg-[#0d1321] text-white">Diretor de Animação / Social</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Nome Completo do Dirigente *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: CL Dr. Roberto Mendes"
                    value={formData.nome_oficial}
                    onChange={(e) => setFormData({ ...formData, nome_oficial: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">E-mail de Contato</label>
                  <input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Telefone</label>
                    <input
                      type="text"
                      placeholder="(27) 99999-0000"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">WhatsApp</label>
                    <input
                      type="text"
                      placeholder="(27) 99999-0000"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="pt-6 border-t border-white/10 flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="nominataForm"
                disabled={saveMutation.isPending}
                className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-deep disabled:opacity-50"
              >
                {saveMutation.isPending ? "Salvar..." : "Salvar Cargo na Nominata"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
