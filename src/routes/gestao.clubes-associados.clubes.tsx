import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  Filter,
} from "lucide-react";
import { GestaoHeader } from "@/components/gestao/GestaoHeader";
import { listClubes, upsertClube, deleteClube } from "@/lib/clubes-associados.functions";

export const Route = createFileRoute("/gestao/clubes-associados/clubes")({
  component: GestaoClubesPage,
});

function GestaoClubesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [regiaoFilter, setRegiaoFilter] = useState<string>("todos");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingClube, setEditingClube] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    id: "",
    nome: "",
    codigo_lions: "",
    charter_date: "",
    regiao: "Região A",
    divisao: "Divisão A-1",
    cidade: "Vitória",
    estado: "ES",
    email: "",
    telefone: "",
    dia_reuniao: "",
    horario_reuniao: "",
    local_reuniao: "",
    status: "ativo" as "ativo" | "inativo" | "em_processo",
    observacoes: "",
  });

  const { data: clubes, isLoading } = useQuery({
    queryKey: ["dist-clubes"],
    queryFn: () => listClubes(),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => upsertClube({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dist-clubes"] });
      queryClient.invalidateQueries({ queryKey: ["clubes-metrics"] });
      setDrawerOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (data: any) => deleteClube({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dist-clubes"] });
      queryClient.invalidateQueries({ queryKey: ["clubes-metrics"] });
    },
  });

  const resetForm = () => {
    setFormData({
      id: "",
      nome: "",
      codigo_lions: "",
      charter_date: "",
      regiao: "Região A",
      divisao: "Divisão A-1",
      cidade: "Vitória",
      estado: "ES",
      email: "",
      telefone: "",
      dia_reuniao: "",
      horario_reuniao: "",
      local_reuniao: "",
      status: "ativo",
      observacoes: "",
    });
    setEditingClube(null);
  };

  const handleEdit = (clube: any) => {
    setEditingClube(clube);
    setFormData({
      id: clube.id,
      nome: clube.nome,
      codigo_lions: clube.codigo_lions || "",
      charter_date: clube.charter_date || "",
      regiao: clube.regiao || "Região A",
      divisao: clube.divisao || "Divisão A-1",
      cidade: clube.cidade || "",
      estado: clube.estado || "ES",
      email: clube.email || "",
      telefone: clube.telefone || "",
      dia_reuniao: clube.dia_reuniao || "",
      horario_reuniao: clube.horario_reuniao || "",
      local_reuniao: clube.local_reuniao || "",
      status: clube.status || "ativo",
      observacoes: clube.observacoes || "",
    });
    setDrawerOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      ...formData,
      id: formData.id || undefined,
    });
  };

  const filteredClubes = clubes?.filter((clube) => {
    const matchesSearch =
      clube.nome.toLowerCase().includes(search.toLowerCase()) ||
      clube.cidade.toLowerCase().includes(search.toLowerCase()) ||
      (clube.codigo_lions && clube.codigo_lions.includes(search));
    const matchesRegiao = regiaoFilter === "todos" || clube.regiao === regiaoFilter;
    return matchesSearch && matchesRegiao;
  });

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 pb-12">
      <GestaoHeader title="Cadastro de Clubes" breadcrumbs={["Gestão", "Clubes & Associados", "Clubes"]} />

      <div className="p-6 space-y-6">
        {/* Barra Superior com Busca, Filtros e Botão Novo Clube */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar por nome, cidade ou código LCI..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:border-primary focus:outline-none"
              />
            </div>
            <select
              value={regiaoFilter}
              onChange={(e) => setRegiaoFilter(e.target.value)}
              className="rounded-lg border border-white/10 bg-[#0d1321] px-3 py-2 text-sm text-slate-100 focus:border-primary focus:outline-none [&>option]:bg-[#0d1321] [&>option]:text-white"
            >
              <option value="todos" className="bg-[#0d1321] text-white">Todas as Regiões</option>
              <option value="Região A" className="bg-[#0d1321] text-white">Região A</option>
              <option value="Região B" className="bg-[#0d1321] text-white">Região B</option>
              <option value="Região C" className="bg-[#0d1321] text-white">Região C</option>
            </select>
          </div>

          <button
            onClick={() => {
              resetForm();
              setDrawerOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-deep transition-all"
          >
            <Plus className="h-4 w-4" />
            Novo Clube
          </button>
        </div>

        {/* Lista de Clubes em Cards */}
        {isLoading ? (
          <div className="py-12 text-center text-sm text-slate-500">Carregando clubes do distrito...</div>
        ) : filteredClubes?.length === 0 ? (
          <div className="py-12 text-center text-slate-500 border border-dashed border-white/10 rounded-xl">
            Nenhum clube encontrado com os filtros aplicados.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClubes?.map((clube) => (
              <div
                key={clube.id}
                className="flex flex-col justify-between rounded-xl border border-white/8 bg-[#0d1321] p-5 hover:border-primary/40 transition-all shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                      {clube.regiao} • {clube.divisao}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      LCI: {clube.codigo_lions || "N/I"}
                    </span>
                  </div>

                  <h3 className="mt-3 font-display text-lg font-bold text-white leading-snug">
                    {clube.nome}
                  </h3>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-500" />
                      <span>{clube.cidade} - {clube.estado} {(clube as any).endereco && `(${(clube as any).endereco})`}</span>
                    </div>
                    {clube.dia_reuniao && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        <span>{clube.dia_reuniao} às {clube.horario_reuniao || "20:00"}</span>
                      </div>
                    )}
                    {clube.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-slate-500" />
                        <span className="truncate">{clube.email}</span>
                      </div>
                    )}
                    {clube.telefone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-slate-500" />
                        <span>{clube.telefone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-white/8 flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold ${
                      clube.status === "ativo" ? "text-emerald-400" : "text-amber-400"
                    }`}
                  >
                    ● <span className="capitalize">{clube.status}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(clube)}
                      className="p-1.5 rounded text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
                      title="Editar Clube"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Deseja realmente remover o clube ${clube.nome}?`)) {
                          deleteMutation.mutate({ id: clube.id });
                        }
                      }}
                      className="p-1.5 rounded text-slate-400 hover:bg-white/5 hover:text-red-400 transition-colors"
                      title="Excluir Clube"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drawer de Cadastro / Edição de Clube */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0d1321] border-l border-white/10 p-6 shadow-2xl overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h3 className="font-display text-lg font-bold text-white">
                  {formData.id ? "Editar Lions Clube" : "Cadastrar Novo Lions Clube"}
                </h3>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form id="clubeForm" onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Nome do Clube *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Lions Clube Vitória Centro"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Código LCI (Lions)</label>
                    <input
                      type="text"
                      placeholder="Ex: 034123"
                      value={formData.codigo_lions}
                      onChange={(e) => setFormData({ ...formData, codigo_lions: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Carta Constitutiva</label>
                    <input
                      type="date"
                      value={formData.charter_date}
                      onChange={(e) => setFormData({ ...formData, charter_date: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Região</label>
                    <select
                      value={formData.regiao}
                      onChange={(e) => setFormData({ ...formData, regiao: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-[#0d1321] px-3 py-2 text-sm text-white focus:border-primary focus:outline-none [&>option]:bg-[#0d1321] [&>option]:text-white"
                    >
                      <option value="Região A" className="bg-[#0d1321] text-white">Região A</option>
                      <option value="Região B" className="bg-[#0d1321] text-white">Região B</option>
                      <option value="Região C" className="bg-[#0d1321] text-white">Região C</option>
                      <option value="Região D" className="bg-[#0d1321] text-white">Região D</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Divisão</label>
                    <input
                      type="text"
                      placeholder="Ex: Divisão A-1"
                      value={formData.divisao}
                      onChange={(e) => setFormData({ ...formData, divisao: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-slate-300 font-medium mb-1">Cidade</label>
                    <input
                      type="text"
                      placeholder="Ex: Vitória"
                      value={formData.cidade}
                      onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Estado</label>
                    <input
                      type="text"
                      placeholder="ES"
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">E-mail do Clube</label>
                    <input
                      type="email"
                      placeholder="clube@distritolc11.org.br"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Telefone / WhatsApp</label>
                    <input
                      type="text"
                      placeholder="(27) 99999-8888"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Dia da Reunião</label>
                    <input
                      type="text"
                      placeholder="Ex: 2ª e 4ª Quinta-feira"
                      value={formData.dia_reuniao}
                      onChange={(e) => setFormData({ ...formData, dia_reuniao: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Horário da Reunião</label>
                    <input
                      type="text"
                      placeholder="Ex: 20:00"
                      value={formData.horario_reuniao}
                      onChange={(e) => setFormData({ ...formData, horario_reuniao: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Local da Reunião</label>
                  <input
                    type="text"
                    placeholder="Sede social ou endereço completo"
                    value={formData.local_reuniao}
                    onChange={(e) => setFormData({ ...formData, local_reuniao: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                    <option value="em_processo">Em Processo de Fundação</option>
                  </select>
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
                form="clubeForm"
                disabled={saveMutation.isPending}
                className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-deep disabled:opacity-50"
              >
                {saveMutation.isPending ? "Salvando..." : "Salvar Clube"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
