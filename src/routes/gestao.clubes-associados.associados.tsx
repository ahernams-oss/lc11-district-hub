import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Users2,
  Plus,
  Search,
  Building2,
  Mail,
  Phone,
  MessageCircle,
  Award,
  Edit2,
  Trash2,
  X,
  Filter,
  CheckCircle,
  Shield,
} from "lucide-react";
import { GestaoHeader } from "@/components/gestao/GestaoHeader";
import { listAssociados, upsertAssociado, deleteAssociado, listClubes } from "@/lib/clubes-associados.functions";

export const Route = createFileRoute("/gestao/clubes-associados/associados")({
  component: GestaoAssociadosPage,
});

function GestaoAssociadosPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [clubeFilter, setClubeFilter] = useState<string>("todos");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingAssociado, setEditingAssociado] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    id: "",
    clube_id: "",
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
    whatsapp: "",
    data_nascimento: "",
    data_admissao: "",
    cargo_clube: "Membro",
    cargo_distrital: "",
    categoria: "ativo" as "ativo" | "honorario" | "privilegiado" | "vitalicio" | "ausente",
    status: "ativo" as "ativo" | "desligado" | "licenciado",
    nome_conjuge: "",
  });

  const { data: associados, isLoading } = useQuery({
    queryKey: ["dist-associados"],
    queryFn: () => listAssociados(),
  });

  const { data: clubes } = useQuery({
    queryKey: ["dist-clubes"],
    queryFn: () => listClubes(),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => upsertAssociado({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dist-associados"] });
      queryClient.invalidateQueries({ queryKey: ["clubes-metrics"] });
      setDrawerOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (data: any) => deleteAssociado({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dist-associados"] });
      queryClient.invalidateQueries({ queryKey: ["clubes-metrics"] });
    },
  });

  const resetForm = () => {
    setFormData({
      id: "",
      clube_id: clubes?.[0]?.id || "",
      nome: "",
      cpf: "",
      email: "",
      telefone: "",
      whatsapp: "",
      data_nascimento: "",
      data_admissao: "",
      cargo_clube: "Membro",
      cargo_distrital: "",
      categoria: "ativo",
      status: "ativo",
      nome_conjuge: "",
    });
    setEditingAssociado(null);
  };

  const handleEdit = (assoc: any) => {
    setEditingAssociado(assoc);
    setFormData({
      id: assoc.id,
      clube_id: assoc.clube_id,
      nome: assoc.nome,
      cpf: assoc.cpf || "",
      email: assoc.email || "",
      telefone: assoc.telefone || "",
      whatsapp: assoc.whatsapp || "",
      data_nascimento: assoc.data_nascimento || "",
      data_admissao: assoc.data_admissao || "",
      cargo_clube: assoc.cargo_clube || "Membro",
      cargo_distrital: assoc.cargo_distrital || "",
      categoria: assoc.categoria || "ativo",
      status: assoc.status || "ativo",
      nome_conjuge: assoc.nome_conjuge || "",
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

  const filteredAssociados = associados?.filter((assoc) => {
    const matchesSearch =
      assoc.nome.toLowerCase().includes(search.toLowerCase()) ||
      (assoc.email && assoc.email.toLowerCase().includes(search.toLowerCase())) ||
      (assoc.cargo_clube && assoc.cargo_clube.toLowerCase().includes(search.toLowerCase()));
    const matchesClube = clubeFilter === "todos" || assoc.clube_id === clubeFilter;
    const matchesStatus = statusFilter === "todos" || assoc.status === statusFilter;
    return matchesSearch && matchesClube && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 pb-12">
      <GestaoHeader title="Cadastro de Associados" breadcrumbs={["Gestão", "Clubes & Associados", "Associados"]} />

      <div className="p-6 space-y-6">
        {/* Barra de Ações: Pesquisa, Filtros e Botão */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-1 flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar associado por nome, e-mail ou cargo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:border-primary focus:outline-none"
              />
            </div>

            <select
              value={clubeFilter}
              onChange={(e) => setClubeFilter(e.target.value)}
              className="rounded-lg border border-white/10 bg-[#0d1321] px-3 py-2 text-sm text-slate-100 focus:border-primary focus:outline-none [&>option]:bg-[#0d1321] [&>option]:text-white"
            >
              <option value="todos">Todos os Clubes</option>
              {clubes?.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#0d1321] text-white">
                  {c.nome}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-white/10 bg-[#0d1321] px-3 py-2 text-sm text-slate-100 focus:border-primary focus:outline-none [&>option]:bg-[#0d1321] [&>option]:text-white"
            >
              <option value="todos" className="bg-[#0d1321] text-white">Todos os Status</option>
              <option value="ativo" className="bg-[#0d1321] text-white">Ativo</option>
              <option value="licenciado" className="bg-[#0d1321] text-white">Licenciado</option>
              <option value="desligado" className="bg-[#0d1321] text-white">Desligado</option>
            </select>
          </div>

          <button
            onClick={() => {
              resetForm();
              setDrawerOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-deep transition-all shrink-0"
          >
            <Plus className="h-4 w-4" />
            Novo Associado
          </button>
        </div>

        {/* Tabela de Associados */}
        <div className="rounded-xl border border-white/8 bg-[#0d1321] overflow-hidden shadow-xl">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-slate-500">Carregando associados...</div>
          ) : filteredAssociados?.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Nenhum associado encontrado.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 bg-white/[0.02] text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5">Associado / Leão</th>
                    <th className="px-4 py-3.5">Lions Clube</th>
                    <th className="px-4 py-3.5">Cargo no Clube</th>
                    <th className="px-4 py-3.5">Cargo Distrital</th>
                    <th className="px-4 py-3.5">Contato</th>
                    <th className="px-4 py-3.5">Categoria</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {filteredAssociados?.map((assoc) => (
                    <tr key={assoc.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 font-medium text-white">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-blue-500 font-bold text-white text-xs">
                            {assoc.nome.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{assoc.nome}</div>
                            {assoc.cpf && <div className="text-[10px] text-slate-500">CPF: {assoc.cpf}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {assoc.dist_clubes?.nome || "Clube não vinculado"}
                      </td>
                      <td className="px-4 py-3 font-semibold text-primary">
                        {assoc.cargo_clube}
                      </td>
                      <td className="px-4 py-3">
                        {assoc.cargo_distrital ? (
                          <span className="inline-flex rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                            {assoc.cargo_distrital}
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          {assoc.email && <div className="text-[11px] text-slate-400">{assoc.email}</div>}
                          {assoc.whatsapp && (
                            <a
                              href={`https://wa.me/55${assoc.whatsapp.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:underline"
                            >
                              <MessageCircle className="h-3 w-3" /> {assoc.whatsapp}
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 capitalize text-slate-400">
                        {assoc.categoria}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                            assoc.status === "ativo"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {assoc.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(assoc)}
                            className="p-1 rounded text-slate-400 hover:bg-white/10 hover:text-white"
                            title="Editar"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Deseja remover o associado ${assoc.nome}?`)) {
                                deleteMutation.mutate({ id: assoc.id });
                              }
                            }}
                            className="p-1 rounded text-slate-400 hover:bg-white/10 hover:text-red-400"
                            title="Excluir"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Drawer de Cadastro / Edição de Associado */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0d1321] border-l border-white/10 p-6 shadow-2xl overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h3 className="font-display text-lg font-bold text-white">
                  {formData.id ? "Editar Associado / Leão" : "Cadastrar Novo Associado"}
                </h3>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form id="assocForm" onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Lions Clube de Origem *</label>
                  <select
                    required
                    value={formData.clube_id}
                    onChange={(e) => setFormData({ ...formData, clube_id: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-[#0d1321] px-3 py-2 text-sm text-white focus:border-primary focus:outline-none [&>option]:bg-[#0d1321] [&>option]:text-white"
                  >
                    <option value="" className="bg-[#0d1321] text-white">Selecione um clube...</option>
                    {clubes?.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#0d1321] text-white">
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Nome Completo (CL / CaL / Leo) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: CL Dr. Roberto Mendes"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">CPF</label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">E-mail</label>
                    <input
                      type="email"
                      placeholder="email@exemplo.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                    />
                  </div>
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Cargo no Clube</label>
                    <input
                      type="text"
                      placeholder="Ex: Presidente, Secretário, Tesoureiro, Membro"
                      value={formData.cargo_clube}
                      onChange={(e) => setFormData({ ...formData, cargo_clube: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Cargo Distrital</label>
                    <input
                      type="text"
                      placeholder="Ex: Assessor Distrital de Visão"
                      value={formData.cargo_distrital}
                      onChange={(e) => setFormData({ ...formData, cargo_distrital: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Categoria de Associado</label>
                    <select
                      value={formData.categoria}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value as any })}
                      className="w-full rounded-lg border border-white/10 bg-[#0d1321] px-3 py-2 text-sm text-white focus:border-primary focus:outline-none [&>option]:bg-[#0d1321] [&>option]:text-white"
                    >
                      <option value="ativo" className="bg-[#0d1321] text-white">Ativo</option>
                      <option value="honorario" className="bg-[#0d1321] text-white">Honorário</option>
                      <option value="privilegiado" className="bg-[#0d1321] text-white">Privilegiado</option>
                      <option value="vitalicio" className="bg-[#0d1321] text-white">Vitalício</option>
                      <option value="ausente" className="bg-[#0d1321] text-white">Ausente</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full rounded-lg border border-white/10 bg-[#0d1321] px-3 py-2 text-sm text-white focus:border-primary focus:outline-none [&>option]:bg-[#0d1321] [&>option]:text-white"
                    >
                      <option value="ativo" className="bg-[#0d1321] text-white">Ativo</option>
                      <option value="licenciado" className="bg-[#0d1321] text-white">Licenciado</option>
                      <option value="desligado" className="bg-[#0d1321] text-white">Desligado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Nome do Cônjuge / Companheiro(a)</label>
                  <input
                    type="text"
                    placeholder="Nome completo do cônjuge"
                    value={formData.nome_conjuge}
                    onChange={(e) => setFormData({ ...formData, nome_conjuge: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                  />
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
                form="assocForm"
                disabled={saveMutation.isPending}
                className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-deep disabled:opacity-50"
              >
                {saveMutation.isPending ? "Salvando..." : "Salvar Associado"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
