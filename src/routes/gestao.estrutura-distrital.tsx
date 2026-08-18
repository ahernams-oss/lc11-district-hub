import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Award,
  Users,
  Building2,
  Plus,
  Edit2,
  Trash2,
  X,
  Mail,
  Phone,
  MessageCircle,
  ShieldCheck,
  CheckCircle,
  MapPin,
} from "lucide-react";
import { GestaoHeader } from "@/components/gestao/GestaoHeader";
import { listEstruturaDistrital, upsertCargoDistrital, deleteCargoDistrital } from "@/lib/distrito-avancado.functions";
import { listAssociados } from "@/lib/clubes-associados.functions";

export const Route = createFileRoute("/gestao/estrutura-distrital")({
  component: GestaoEstruturaPage,
});

function GestaoEstruturaPage() {
  const queryClient = useQueryClient();
  const [anoLeonico, setAnoLeonico] = useState("2025/2026");
  const [activeTab, setActiveTab] = useState<string>("todas");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [formData, setFormData] = useState({
    id: "",
    ano_leonico: "2025/2026",
    categoria_estrutura: "Mesa Diretora" as any,
    cargo_nome: "",
    nome_titular: "",
    clube_origem: "",
    email: "",
    telefone: "",
    ordem: 0,
  });

  const { data: estrutura, isLoading } = useQuery({
    queryKey: ["dist-estrutura", anoLeonico],
    queryFn: () => listEstruturaDistrital({ data: { ano_leonico: anoLeonico } }),
  });

  const { data: associados } = useQuery({
    queryKey: ["dist-associados"],
    queryFn: () => listAssociados(),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => upsertCargoDistrital({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dist-estrutura"] });
      setDrawerOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (data: any) => deleteCargoDistrital({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dist-estrutura"] });
    },
  });

  const resetForm = () => {
    setFormData({
      id: "",
      ano_leonico: anoLeonico,
      categoria_estrutura: "Mesa Diretora",
      cargo_nome: "",
      nome_titular: "",
      clube_origem: "",
      email: "",
      telefone: "",
      ordem: 0,
    });
  };

  const handleEdit = (item: any) => {
    setFormData({
      id: item.id,
      ano_leonico: item.ano_leonico,
      categoria_estrutura: item.categoria_estrutura,
      cargo_nome: item.cargo_nome,
      nome_titular: item.nome_titular,
      clube_origem: item.clube_origem || "",
      email: item.email || "",
      telefone: item.telefone || "",
      ordem: item.ordem || 0,
    });
    setDrawerOpen(true);
  };

  const handleSelectAssociado = (assocId: string) => {
    const found = associados?.find((a) => a.id === assocId);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        nome_titular: found.nome,
        clube_origem: found.dist_clubes?.nome || "",
        email: found.email || "",
        telefone: found.telefone || found.whatsapp || "",
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      ...formData,
      id: formData.id || undefined,
    });
  };

  const CATEGORIAS = [
    { id: "todas", label: "Todas as Áreas" },
    { id: "Mesa Diretora", label: "Mesa Diretora" },
    { id: "Regiões e Divisões", label: "Regiões & Divisões" },
    { id: "Equipe Global (GAT/GMT/GST/GET)", label: "Equipe Global (GAT/GMT/GST)" },
    { id: "Assessoria Distrital Specialized", label: "Assessoria Especializada" },
  ];

  const filteredEstrutura = estrutura?.filter((item) => {
    if (activeTab === "todas") return true;
    return item.categoria_estrutura === activeTab;
  });

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 pb-12">
      <GestaoHeader title="Estrutura Distrital & Organograma" breadcrumbs={["Gestão", "Distrito LC-11", "Estrutura"]} />

      <div className="p-6 space-y-6">
        {/* Topo com Ano Leônico e Ação */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
          <div>
            <h2 className="font-display text-xl font-bold text-white">
              Estrutura Organizacional do Distrito LC-11
            </h2>
            <p className="mt-1 text-sm text-slate-400 max-w-2xl">
              Organograma oficial de liderança contendo a Mesa Diretora, Regiões, Divisões, Coordenadores Globais (GAT) e Assessores Distritais.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={anoLeonico}
              onChange={(e) => setAnoLeonico(e.target.value)}
              className="rounded-lg border border-white/10 bg-[#0d1321] px-3 py-2 text-sm text-white focus:border-primary focus:outline-none [&>option]:bg-[#0d1321] [&>option]:text-white font-semibold"
            >
              <option value="2025/2026" className="bg-[#0d1321] text-white">Ano Leônico 2025/2026</option>
              <option value="2024/2025" className="bg-[#0d1321] text-white">Ano Leônico 2024/2025</option>
            </select>

            <button
              onClick={() => {
                resetForm();
                setDrawerOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-deep transition-all shrink-0"
            >
              <Plus className="h-4 w-4" />
              Nomear Dirigente
            </button>
          </div>
        </div>

        {/* Abas por Categoria de Estrutura */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
          {CATEGORIAS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`rounded-lg px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === cat.id
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Quadro da Estrutura Distrital */}
        {isLoading ? (
          <div className="py-12 text-center text-sm text-slate-500">Carregando estrutura distrital...</div>
        ) : filteredEstrutura?.length === 0 ? (
          <div className="py-12 text-center text-slate-500">Nenhum dirigente ou assessor nesta categoria.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEstrutura?.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-xl border border-white/8 bg-[#0d1321] p-5 hover:border-primary/40 transition-all shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                      {item.categoria_estrutura}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">AL {item.ano_leonico}</span>
                  </div>

                  <div className="mt-3 flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-blue-600 font-bold text-white text-base shadow-md">
                      {item.nome_titular.charAt(0)}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider block">
                        {item.cargo_nome}
                      </span>
                      <h3 className="text-base font-bold text-white leading-snug">{item.nome_titular}</h3>
                      {item.clube_origem && (
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-slate-500" /> {item.clube_origem}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5 text-xs text-slate-400">
                    {item.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-slate-500" />
                        <span className="truncate">{item.email}</span>
                      </div>
                    )}
                    {item.telefone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-slate-500" />
                        <span>{item.telefone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/8 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-1.5 rounded text-slate-400 hover:bg-white/10 hover:text-white"
                    title="Editar cargo"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Remover ${item.cargo_nome}?`)) {
                        deleteMutation.mutate({ id: item.id });
                      }
                    }}
                    className="p-1.5 rounded text-slate-400 hover:bg-white/10 hover:text-red-400"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drawer de Nomeação / Edição de Dirigente Distrital */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0d1321] border-l border-white/10 p-6 shadow-2xl overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h3 className="font-display text-lg font-bold text-white">
                  {formData.id ? "Editar Dirigente Distrital" : "Nomear Novo Dirigente Distrital"}
                </h3>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form id="estForm" onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Preencher a partir de Associado</label>
                  <select
                    onChange={(e) => handleSelectAssociado(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#0d1321] px-3 py-2 text-sm text-white focus:border-primary focus:outline-none [&>option]:bg-[#0d1321] [&>option]:text-white"
                  >
                    <option value="" className="bg-[#0d1321] text-white">Selecione um associado para autopreencher...</option>
                    {associados?.map((a) => (
                      <option key={a.id} value={a.id} className="bg-[#0d1321] text-white">
                        {a.nome} — {a.dist_clubes?.nome || "Clube"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Área da Estrutura *</label>
                  <select
                    value={formData.categoria_estrutura}
                    onChange={(e) => setFormData({ ...formData, categoria_estrutura: e.target.value as any })}
                    className="w-full rounded-lg border border-white/10 bg-[#0d1321] px-3 py-2 text-sm text-white focus:border-primary focus:outline-none [&>option]:bg-[#0d1321] [&>option]:text-white"
                  >
                    <option value="Mesa Diretora" className="bg-[#0d1321] text-white">Mesa Diretora</option>
                    <option value="Regiões e Divisões" className="bg-[#0d1321] text-white">Regiões e Divisões</option>
                    <option value="Equipe Global (GAT/GMT/GST/GET)" className="bg-[#0d1321] text-white">Equipe Global (GAT/GMT/GST)</option>
                    <option value="Assessoria Distrital Specialized" className="bg-[#0d1321] text-white">Assessoria Distrital Especializada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Nome do Cargo Distrital *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Assessor Distrital de Visão e SightFirst"
                    value={formData.cargo_nome}
                    onChange={(e) => setFormData({ ...formData, cargo_nome: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Nome Completo do Dirigente *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: CaL Ana Paula Oliveira"
                    value={formData.nome_titular}
                    onChange={(e) => setFormData({ ...formData, nome_titular: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Clube de Origem</label>
                  <input
                    type="text"
                    placeholder="Ex: Lions Clube Colatina Centro"
                    value={formData.clube_origem}
                    onChange={(e) => setFormData({ ...formData, clube_origem: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">E-mail Distrital</label>
                    <input
                      type="email"
                      placeholder="cargo@distritolc11.org.br"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Telefone / WhatsApp</label>
                    <input
                      type="text"
                      placeholder="(27) 99999-0000"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
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
                form="estForm"
                disabled={saveMutation.isPending}
                className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-deep disabled:opacity-50"
              >
                {saveMutation.isPending ? "Salvar..." : "Salvar Nomeação"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
