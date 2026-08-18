import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  FileText,
  UploadCloud,
  Download,
  Trash2,
  X,
  Search,
  Filter,
  ShieldCheck,
  Building2,
  Calendar,
  FileCheck,
} from "lucide-react";
import { GestaoHeader } from "@/components/gestao/GestaoHeader";
import { FileUploadInput } from "@/components/gestao/FileUploadInput";
import { listDocumentosInformativos, addDocumentoInformativo, deleteDocumentoInformativo } from "@/lib/distrito-avancado.functions";

export const Route = createFileRoute("/gestao/documentos")({
  component: GestaoDocumentosPage,
});

function GestaoDocumentosPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("todas");
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    categoria: "Circular da Governadoria" as any,
    arquivo_url: "",
    arquivo_nome: "",
    arquivo_tamanho: "",
    autor_cargo: "Governador(a) de Distrito",
  });

  const { data: documentos, isLoading } = useQuery({
    queryKey: ["dist-documentos", categoriaFilter],
    queryFn: () => listDocumentosInformativos({ data: { categoria: categoriaFilter } }),
  });

  const addMutation = useMutation({
    mutationFn: (data: any) => addDocumentoInformativo({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dist-documentos"] });
      setModalOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (data: any) => deleteDocumentoInformativo({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dist-documentos"] });
    },
  });

  const resetForm = () => {
    setFormData({
      titulo: "",
      descricao: "",
      categoria: "Circular da Governadoria",
      arquivo_url: "",
      arquivo_nome: "",
      arquivo_tamanho: "",
      autor_cargo: "Governador(a) de Distrito",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.arquivo_url) {
      alert("Por favor, faça o upload ou selecione um arquivo.");
      return;
    }
    addMutation.mutate(formData);
  };

  const filteredDocs = documentos?.filter((doc) => {
    const matchesSearch =
      doc.titulo.toLowerCase().includes(search.toLowerCase()) ||
      (doc.descricao && doc.descricao.toLowerCase().includes(search.toLowerCase())) ||
      doc.autor_cargo.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 pb-12">
      <GestaoHeader title="Painel Informativo & Central de Documentos" breadcrumbs={["Gestão", "Painel Informativo"]} />

      <div className="p-6 space-y-6">
        {/* Banner Informativo */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
          <div>
            <h2 className="font-display text-xl font-bold text-white">
              Central Oficial de Circulares, Balancetes e Documentos Distritais
            </h2>
            <p className="mt-1 text-sm text-slate-400 max-w-2xl">
              Arquivos anexados diretamente pela Governadoria e Tesouraria Distrital para acesso imediato por todos os usuários e lideranças dos clubes.
            </p>
          </div>

          <button
            onClick={() => {
              resetForm();
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-deep transition-all shrink-0"
          >
            <UploadCloud className="h-4 w-4" />
            Anexar Documento Distrital
          </button>
        </div>

        {/* Barra de Filtros e Busca */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-1 flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 min-w-[260px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar documento por título ou descrição..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:border-primary focus:outline-none"
              />
            </div>

            <select
              value={categoriaFilter}
              onChange={(e) => setCategoriaFilter(e.target.value)}
              className="rounded-lg border border-white/10 bg-[#0d1321] px-3 py-2 text-sm text-slate-100 focus:border-primary focus:outline-none [&>option]:bg-[#0d1321] [&>option]:text-white font-medium"
            >
              <option value="todas" className="bg-[#0d1321] text-white">Todas as Categorias</option>
              <option value="Circular da Governadoria" className="bg-[#0d1321] text-white">Circulares da Governadoria</option>
              <option value="Balancete Distrital" className="bg-[#0d1321] text-white">Balancetes Distritais</option>
              <option value="Relatório Financeiro" className="bg-[#0d1321] text-white">Relatórios Financeiros</option>
              <option value="Formulários & Modelos" className="bg-[#0d1321] text-white">Formulários & Modelos</option>
              <option value="Regulamentos" className="bg-[#0d1321] text-white">Regulamentos</option>
            </select>
          </div>
        </div>

        {/* Lista de Documentos Informativos */}
        <div className="rounded-xl border border-white/8 bg-[#0d1321] overflow-hidden shadow-xl">
          {isLoading ? (
            <div className="p-12 text-center text-sm text-slate-500">Carregando documentos informativos...</div>
          ) : filteredDocs?.length === 0 ? (
            <div className="p-12 text-center text-slate-500">Nenhum documento encontrado.</div>
          ) : (
            <div className="divide-y divide-white/5">
              {filteredDocs?.map((doc) => (
                <div
                  key={doc.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                          {doc.categoria}
                        </span>
                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                          <ShieldCheck className="h-3.5 w-3.5 text-amber-400" /> Pubicador: {doc.autor_cargo}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-1 leading-snug">{doc.titulo}</h3>
                      {doc.descricao && <p className="text-xs text-slate-400 mt-1 max-w-3xl">{doc.descricao}</p>}
                      <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-3">
                        <span>Arquivo: {doc.arquivo_nome} ({doc.arquivo_tamanho || "PDF/DOC"})</span>
                        <span>Data: {new Date(doc.created_at).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <a
                      href={doc.arquivo_url}
                      target="_blank"
                      download={doc.arquivo_nome}
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-all"
                    >
                      <Download className="h-4 w-4" />
                      Baixar Arquivo
                    </a>
                    <button
                      onClick={() => {
                        if (confirm(`Remover o documento ${doc.titulo}?`)) {
                          deleteMutation.mutate({ id: doc.id });
                        }
                      }}
                      className="p-2 rounded-lg text-slate-400 hover:bg-white/10 hover:text-red-400 transition-colors"
                      title="Excluir documento"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Publicação de Documento (Governador e Tesoureiro) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-[#0d1321] border border-white/10 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display text-lg font-bold text-white">Anexar Documento Distrital</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form id="docForm" onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Título do Documento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Circular da Governadoria nº 02/2025"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Categoria *</label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value as any })}
                  className="w-full rounded-lg border border-white/10 bg-[#0d1321] px-3 py-2 text-sm text-white focus:border-primary focus:outline-none [&>option]:bg-[#0d1321] [&>option]:text-white"
                >
                  <option value="Circular da Governadoria" className="bg-[#0d1321] text-white">Circular da Governadoria</option>
                  <option value="Balancete Distrital" className="bg-[#0d1321] text-white">Balancete Distrital</option>
                  <option value="Relatório Financeiro" className="bg-[#0d1321] text-white">Relatório Financeiro</option>
                  <option value="Formulários & Modelos" className="bg-[#0d1321] text-white">Formulários & Modelos</option>
                  <option value="Regulamentos" className="bg-[#0d1321] text-white">Regulamentos</option>
                  <option value="Outros" className="bg-[#0d1321] text-white">Outros</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Publicador / Cargo de Autoria</label>
                <select
                  value={formData.autor_cargo}
                  onChange={(e) => setFormData({ ...formData, autor_cargo: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-[#0d1321] px-3 py-2 text-sm text-white focus:border-primary focus:outline-none [&>option]:bg-[#0d1321] [&>option]:text-white"
                >
                  <option value="Governador(a) de Distrito" className="bg-[#0d1321] text-white">Governador(a) de Distrito</option>
                  <option value="Tesoureiro(a) Distrital" className="bg-[#0d1321] text-white">Tesoureiro(a) Distrital</option>
                  <option value="Secretário(a) Distrital" className="bg-[#0d1321] text-white">Secretário(a) Distrital</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Descrição / Observações</label>
                <textarea
                  rows={3}
                  placeholder="Resumo explicativo do arquivo..."
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Arquivo (PDF, DOC, XLS) *</label>
                <FileUploadInput
                  value={formData.arquivo_url}
                  onChange={(url, size) =>
                    setFormData({
                      ...formData,
                      arquivo_url: url,
                      arquivo_nome: url.split("/").pop() || "documento.pdf",
                      arquivo_tamanho: size ? `${(size / 1024).toFixed(0)} KB` : "1.0 MB",
                    })
                  }
                  folder="documentos-distritais"
                  accept="application/pdf,.doc,.docx,.xls,.xlsx"
                />
              </div>
            </form>

            <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="docForm"
                disabled={addMutation.isPending}
                className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-deep disabled:opacity-50"
              >
                {addMutation.isPending ? "Publicando..." : "Publicar Documento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
