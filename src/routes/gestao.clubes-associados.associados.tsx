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
  History,
} from "lucide-react";
import { GestaoHeader } from "@/components/gestao/GestaoHeader";
import { FileUploadInput } from "@/components/gestao/FileUploadInput";
import {
  listAssociados,
  upsertAssociado,
  deleteAssociado,
  listClubes,
  listCargosHistorico,
  upsertCargoHistorico,
  deleteCargoHistorico,
} from "@/lib/clubes-associados.functions";

const labelCls = "block text-slate-300 font-semibold mb-1.5";
const inputCls =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-primary focus:outline-none";
const selectCls =
  "w-full rounded-lg border border-white/10 bg-[#0d1321] px-3 py-2 text-sm text-white focus:border-primary focus:outline-none [&>option]:bg-[#0d1321] [&>option]:text-white";

const CARGOS_CLUBE = [
  "Presidente",
  "1º Vice-Presidente",
  "2º Vice-Presidente",
  "3º Vice-Presidente",
  "Secretário(a)",
  "Tesoureiro(a)",
  "Diretor(a) Social",
  "Diretor(a) de Marketing",
  "Domador(a)",
  "Cão Guia",
  "Diretor(a) de Membros",
  "Conselheiro(a)",
  "Membro",
];

const CARGOS_DISTRITO = [
  "Governador(a)",
  "1º Vice-Governador(a)",
  "2º Vice-Governador(a)",
  "Secretário(a) Distrital",
  "Tesoureiro(a) Distrital",
  "Presidente de Região",
  "Presidente de Divisão",
  "Assessor(a) Distrital",
  "Coordenador(a) Distrital",
  "Past Governador(a)",
];

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
    cargo_clube: "",
    cargo_distrital: "",
    categoria: "ativo" as "ativo" | "honorario" | "privilegiado" | "vitalicio" | "ausente",
    status: "ativo" as "ativo" | "desligado" | "licenciado",
    nome_conjuge: "",
    foto_url: "",
    cidade: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade_endereco: "",
    estado_uf: "",
    bio: "",
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
      cargo_clube: "",
      cargo_distrital: "",
      categoria: "ativo",
      status: "ativo",
      nome_conjuge: "",
      foto_url: "",
      cidade: "",
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade_endereco: "",
      estado_uf: "",
      bio: "",
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
      cargo_clube: assoc.cargo_clube || "",
      cargo_distrital: assoc.cargo_distrital || "",
      categoria: assoc.categoria || "ativo",
      status: assoc.status || "ativo",
      nome_conjuge: assoc.nome_conjuge || "",
      foto_url: assoc.foto_url || "",
      cidade: assoc.cidade || "",
      cep: assoc.cep || "",
      logradouro: assoc.logradouro || "",
      numero: assoc.numero || "",
      complemento: assoc.complemento || "",
      bairro: assoc.bairro || "",
      cidade_endereco: assoc.cidade_endereco || "",
      estado_uf: assoc.estado_uf || "",
      bio: assoc.bio || "",
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

      {/* Drawer de Cadastro / Edição de Associado — padrão perfil */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#0d1321] border-l border-white/10 shadow-2xl overflow-y-auto">
            {/* Capa */}
            <div className="relative h-28 bg-gradient-to-r from-primary to-blue-900">
              <div className="absolute -bottom-8 left-6 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-4 border-[#0d1321] bg-primary text-lg font-bold text-white">
                {formData.foto_url ? (
                  <img src={formData.foto_url} alt="Foto do associado" className="h-full w-full object-cover" />
                ) : (
                  (formData.nome || "AS").slice(0, 2).toUpperCase()
                )}
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20"
              >
                <X className="h-3.5 w-3.5" /> Cancelar
              </button>
            </div>

            <form id="assocForm" onSubmit={handleSubmit} className="px-6 pb-8 pt-12 space-y-5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Foto de perfil</label>
                <FileUploadInput
                  value={formData.foto_url}
                  onChange={(url) => setFormData({ ...formData, foto_url: url })}
                  bucket="site-images"
                  folder="associados"
                  accept="image/*"
                />
              </div>

              <div>
                <label className={labelCls}>Nome *</label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Clube *</label>
                  <select
                    required
                    value={formData.clube_id}
                    onChange={(e) => setFormData({ ...formData, clube_id: e.target.value })}
                    className={selectCls}
                  >
                    <option value="">Selecione um clube...</option>
                    {clubes?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Cidade</label>
                  <input
                    type="text"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Telefone Celular</label>
                  <input
                    type="text"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value, whatsapp: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>E-mail</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Cargo no clube</label>
                <select
                  value={formData.cargo_clube}
                  onChange={(e) => setFormData({ ...formData, cargo_clube: e.target.value })}
                  className={selectCls}
                >
                  <option value="">Nenhum</option>
                  {CARGOS_CLUBE.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Cargo no Distrito</label>
                <select
                  value={formData.cargo_distrital}
                  onChange={(e) => setFormData({ ...formData, cargo_distrital: e.target.value })}
                  className={selectCls}
                >
                  <option value="">Nenhum</option>
                  {CARGOS_DISTRITO.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Data de Nascimento</label>
                  <input
                    type="date"
                    value={formData.data_nascimento}
                    onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Data de Admissão</label>
                  <input
                    type="date"
                    value={formData.data_admissao}
                    onChange={(e) => setFormData({ ...formData, data_admissao: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>CEP</label>
                  <input
                    type="text"
                    placeholder="00000-000"
                    value={formData.cep}
                    onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Logradouro</label>
                  <input
                    type="text"
                    value={formData.logradouro}
                    onChange={(e) => setFormData({ ...formData, logradouro: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Número</label>
                  <input
                    type="text"
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Complemento</label>
                  <input
                    type="text"
                    value={formData.complemento}
                    onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Bairro</label>
                  <input
                    type="text"
                    value={formData.bairro}
                    onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-3">
                  <label className={labelCls}>Cidade (endereço)</label>
                  <input
                    type="text"
                    value={formData.cidade_endereco}
                    onChange={(e) => setFormData({ ...formData, cidade_endereco: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Estado (UF)</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={formData.estado_uf}
                    onChange={(e) => setFormData({ ...formData, estado_uf: e.target.value.toUpperCase() })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>CPF</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Categoria</label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value as any })}
                    className={selectCls}
                  >
                    <option value="ativo">Ativo</option>
                    <option value="honorario">Honorário</option>
                    <option value="privilegiado">Privilegiado</option>
                    <option value="vitalicio">Vitalício</option>
                    <option value="ausente">Ausente</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className={selectCls}
                  >
                    <option value="ativo">Ativo</option>
                    <option value="licenciado">Licenciado</option>
                    <option value="desligado">Desligado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls}>Nome do Cônjuge / Companheiro(a)</label>
                <input
                  type="text"
                  value={formData.nome_conjuge}
                  onChange={(e) => setFormData({ ...formData, nome_conjuge: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Bio</label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-deep disabled:opacity-50"
                >
                  {saveMutation.isPending ? "Salvando..." : "Salvar"}
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10"
                >
                  Cancelar
                </button>
              </div>
            </form>

            {formData.id && (
              <div className="border-t border-white/10 px-6 py-6">
                <CargoHistorico associadoId={formData.id} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CargoHistorico({ associadoId }: { associadoId: string }) {
  const queryClient = useQueryClient();
  const [novo, setNovo] = useState({
    ambito: "clube" as "clube" | "distrito",
    cargo: "",
    ano_leonico: "",
    data_inicio: "",
    data_fim: "",
    atual: false,
    observacoes: "",
  });

  const { data: historico, isLoading } = useQuery({
    queryKey: ["assoc-cargos", associadoId],
    queryFn: () => listCargosHistorico({ data: { associado_id: associadoId } }),
  });

  const addMutation = useMutation({
    mutationFn: (data: any) => upsertCargoHistorico({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assoc-cargos", associadoId] });
      setNovo({ ambito: "clube", cargo: "", ano_leonico: "", data_inicio: "", data_fim: "", atual: false, observacoes: "" });
    },
  });

  const delMutation = useMutation({
    mutationFn: (id: string) => deleteCargoHistorico({ data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["assoc-cargos", associadoId] }),
  });

  const opcoes = novo.ambito === "clube" ? CARGOS_CLUBE : CARGOS_DISTRITO;

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center gap-2">
        <History className="h-4 w-4 text-primary" />
        <h3 className="font-display text-sm font-bold text-white">Histórico de cargos</h3>
      </div>

      {isLoading ? (
        <p className="text-slate-400">Carregando histórico...</p>
      ) : !historico || historico.length === 0 ? (
        <p className="text-slate-400">Nenhum cargo registrado ainda.</p>
      ) : (
        <ul className="space-y-2">
          {historico.map((h: any) => (
            <li
              key={h.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-white">{h.cargo}</span>
                  <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">
                    {h.ambito === "distrito" ? "Distrito" : "Clube"}
                  </span>
                  {h.atual && (
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-300">
                      Atual
                    </span>
                  )}
                </div>
                <p className="mt-1 text-slate-400">
                  {h.ano_leonico ? `${h.ano_leonico} · ` : ""}
                  {h.data_inicio ? new Date(h.data_inicio + "T00:00:00").toLocaleDateString("pt-BR") : "—"}
                  {" até "}
                  {h.data_fim ? new Date(h.data_fim + "T00:00:00").toLocaleDateString("pt-BR") : "atual"}
                </p>
                {h.observacoes && <p className="mt-1 text-slate-500">{h.observacoes}</p>}
              </div>
              <button
                type="button"
                onClick={() => delMutation.mutate(h.id)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
                title="Remover registro"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-white/10 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={novo.ambito}
            onChange={(e) => setNovo({ ...novo, ambito: e.target.value as any, cargo: "" })}
            className={`${selectCls} w-auto min-w-[120px]`}
          >
            <option value="clube">Clube</option>
            <option value="distrito">Distrito</option>
          </select>
          <select
            value={novo.cargo}
            onChange={(e) => setNovo({ ...novo, cargo: e.target.value })}
            className={`${selectCls} min-w-[220px] flex-1`}
          >
            <option value="">Selecione o cargo</option>
            {opcoes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={novo.data_inicio}
            onChange={(e) => setNovo({ ...novo, data_inicio: e.target.value })}
            className={`${inputCls} w-auto min-w-[150px]`}
          />
          <input
            type="date"
            value={novo.data_fim}
            onChange={(e) => setNovo({ ...novo, data_fim: e.target.value })}
            className={`${inputCls} w-auto min-w-[150px]`}
          />
          <button
            type="button"
            disabled={!novo.cargo || addMutation.isPending}
            onClick={() => addMutation.mutate({ ...novo, atual: !novo.data_fim, associado_id: associadoId })}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-deep disabled:opacity-50"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
