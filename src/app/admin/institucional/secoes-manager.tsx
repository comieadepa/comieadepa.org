"use client";

import { Edit, Plus, Trash2, X, Save, Eye, EyeOff } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { CmsInstitucionalSecao } from "@/app/api/admin/institucional/secoes/route";
import { MediaPickerAsset, MediaUrlField } from "../media-url-field";
import { RichTextField } from "../rich-text-field";
import { CardsManager } from "./cards-manager";
import { SecaoDocumentosManager } from "./secao-documentos-manager";

type SecoesManagerProps = {
  institucionalId: string;
  institucionalTitulo: string;
  mediaAssets: MediaPickerAsset[];
  isOpen: boolean;
  onClose: () => void;
};

export function SecoesManager({
  institucionalId,
  institucionalTitulo,
  mediaAssets,
  isOpen,
  onClose,
}: SecoesManagerProps) {
  const [secoes, setSecoes] = useState<CmsInstitucionalSecao[]>([]);
  const [loading, setLoading] = useState(true);

  // Form sub-modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSecao, setEditingSecao] = useState<CmsInstitucionalSecao | null>(null);

  // Sub-modal form states
  const [formTipo, setFormTipo] = useState<"texto" | "imagem_texto" | "cta" | "cards" | "documentos">("texto");
  const [formTitulo, setFormTitulo] = useState("");
  const [formSubtitulo, setFormSubtitulo] = useState("");
  const [formOrdem, setFormOrdem] = useState(0);
  const [formAtivo, setFormAtivo] = useState(true);

  // Cards sub-modal states
  const [isCardsOpen, setIsCardsOpen] = useState(false);
  const [activeSecaoForCards, setActiveSecaoForCards] = useState<CmsInstitucionalSecao | null>(null);

  // Documents sub-modal states
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [activeSecaoForDocs, setActiveSecaoForDocs] = useState<CmsInstitucionalSecao | null>(null);

  const fetchSecoes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/institucional/secoes?institucional_id=${encodeURIComponent(institucionalId)}`);
      if (res.ok) {
        const data = await res.json();
        setSecoes(data);
      }
    } catch (e) {
      console.error("Erro ao carregar seções", e);
    } finally {
      setLoading(false);
    }
  }, [institucionalId]);

  useEffect(() => {
    if (isOpen) {
      fetchSecoes();
    }
  }, [isOpen, fetchSecoes]);

  function handleOpenCreate() {
    setEditingSecao(null);
    setFormTipo("texto");
    setFormTitulo("");
    setFormSubtitulo("");
    setFormOrdem(secoes.length * 10);
    setFormAtivo(true);
    setIsFormOpen(true);
  }

  function handleOpenEdit(secao: CmsInstitucionalSecao) {
    setEditingSecao(secao);
    setFormTipo(secao.tipo);
    setFormTitulo(secao.titulo ?? "");
    setFormSubtitulo(secao.subtitulo ?? "");
    setFormOrdem(secao.ordem);
    setFormAtivo(secao.ativo);
    setIsFormOpen(true);
  }

  async function handleToggleAtivo(secao: CmsInstitucionalSecao) {
    try {
      const response = await fetch("/api/admin/institucional/secoes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...secao,
          ativo: !secao.ativo,
        }),
      });

      if (!response.ok) {
        alert("Erro ao atualizar status da seção.");
        return;
      }
      fetchSecoes();
    } catch (e) {
      console.error(e);
      alert("Erro ao conectar à API.");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Excluir definitivamente esta seção?")) return;

    try {
      const response = await fetch(`/api/admin/institucional/secoes?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        alert("Erro ao excluir seção.");
        return;
      }
      fetchSecoes();
    } catch (e) {
      console.error(e);
      alert("Erro ao conectar à API.");
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const payload = {
      id: editingSecao?.id,
      institucional_id: institucionalId,
      tipo: formTipo,
      titulo: formTitulo || null,
      subtitulo: formSubtitulo || null,
      conteudo: (formData.get("conteudo") as string) || null,
      imagem_url: (formData.get("imagem_url") as string) || null,
      ordem: Number(formOrdem),
      ativo: formAtivo,
    };

    try {
      const response = await fetch("/api/admin/institucional/secoes", {
        method: editingSecao ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        alert(err.error || "Erro ao salvar seção.");
        return;
      }

      setIsFormOpen(false);
      fetchSecoes();
    } catch (e) {
      console.error(e);
      alert("Erro de comunicação com a API.");
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-4xl border border-[#d8c38b] bg-white shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ead9a6] bg-[#fffaf0] px-6 py-4 shrink-0">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#8b2f2b]">Seções de Página</span>
            <h3 className="font-serif text-lg font-bold text-[#171006]">
              {institucionalTitulo}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-black transition">
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-serif text-sm font-bold text-[#8b2f2b] uppercase tracking-wider">
              Lista de Seções
            </h4>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 bg-[#f4cf6a] px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-[#171006] hover:bg-[#ebd59b] transition"
            >
              <Plus size={14} />
              Nova Seção
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">Carregando seções...</div>
          ) : secoes.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm border border-dashed border-[#ead9a6] bg-[#fffaf0]/30">
              Nenhuma seção cadastrada para esta página.
            </div>
          ) : (
            <div className="border border-[#ead9a6] overflow-x-auto">
              <table className="min-w-full divide-y divide-[#ead9a6] text-left text-sm">
                <thead className="bg-[#fffaf0] text-[11px] font-black uppercase tracking-[0.15em] text-[#8b2f2b]">
                  <tr>
                    <th className="px-6 py-3">Tipo</th>
                    <th className="px-6 py-3">Título</th>
                    <th className="px-6 py-3 text-center">Ordem</th>
                    <th className="px-6 py-3 text-center">Ativo</th>
                    <th className="px-6 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ead9a6] text-[#5a472c]">
                  {secoes.map((secao) => (
                    <tr key={secao.id} className="hover:bg-[#fffaf0]/40 transition">
                      <td className="px-6 py-3 font-mono text-xs uppercase text-[#8b2f2b]">{secao.tipo}</td>
                      <td className="px-6 py-3 font-bold text-[#171006]">{secao.titulo || <span className="text-slate-400 font-normal italic">(sem título)</span>}</td>
                      <td className="px-6 py-3 text-center font-bold">{secao.ordem}</td>
                      <td className="px-6 py-3 text-center">
                        <button
                          onClick={() => handleToggleAtivo(secao)}
                          className={`inline-flex p-1.5 transition ${secao.ativo ? "text-[#00b67a]" : "text-slate-400"}`}
                          title={secao.ativo ? "Ativa (clique para desativar)" : "Inativa (clique para ativar)"}
                        >
                          {secao.ativo ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex justify-end gap-3">
                          {secao.tipo === "cards" && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveSecaoForCards(secao);
                                setIsCardsOpen(true);
                              }}
                              className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.12em] text-[#B8872D] hover:underline"
                            >
                              <Plus size={12} />
                              Gerenciar Cards
                            </button>
                          )}
                          {secao.tipo === "documentos" && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveSecaoForDocs(secao);
                                setIsDocsOpen(true);
                              }}
                              className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.12em] text-[#B8872D] hover:underline"
                            >
                              <Plus size={12} />
                              Gerenciar Documentos
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEdit(secao)}
                            className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.12em] text-[#0F3B63] hover:underline"
                          >
                            <Edit size={12} />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(secao.id)}
                            className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.12em] text-red-700 hover:underline"
                          >
                            <Trash2 size={12} />
                            Excluir
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

        {/* Footer */}
        <div className="flex justify-end border-t border-[#ead9a6] bg-[#fffaf0] px-6 py-4 shrink-0">
          <button
            onClick={onClose}
            className="bg-[#171006] px-5 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-white hover:bg-slate-800 transition"
          >
            Fechar
          </button>
        </div>

        {/* Form Overlay Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-2xl border border-[#d8c38b] bg-white shadow-2xl max-h-[85vh] flex flex-col">
              {/* Form Header */}
              <div className="flex items-center justify-between border-b border-[#ead9a6] bg-[#fffaf0] px-6 py-4 shrink-0">
                <h3 className="font-serif text-base font-bold text-[#171006]">
                  {editingSecao ? "Editar Seção" : "Nova Seção"}
                </h3>
                <button onClick={() => setIsFormOpen(false)} className="text-slate-500 hover:text-black transition">
                  <X size={18} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="overflow-y-auto p-6 flex-1 grid gap-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-1">
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Tipo de Seção</span>
                    <select
                      value={formTipo}
                      onChange={(e) => setFormTipo(e.target.value as "texto" | "imagem_texto" | "cta" | "cards" | "documentos")}
                      className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-2.5 outline-none focus:border-[#8b2f2b]"
                    >
                      <option value="texto">Apenas Texto</option>
                      <option value="imagem_texto">Imagem e Texto</option>
                      <option value="cta">Call To Action (CTA)</option>
                      <option value="cards">Grade de Cards</option>
                      <option value="documentos">Vincular Documentos</option>
                    </select>
                  </label>

                  <label className="grid gap-1">
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Ordem</span>
                    <input
                      type="number"
                      required
                      value={formOrdem}
                      onChange={(e) => setFormOrdem(Number(e.target.value))}
                      className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-2.5 outline-none focus:border-[#8b2f2b]"
                      min={0}
                    />
                  </label>
                </div>

                <label className="grid gap-1">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Título da Seção</span>
                  <input
                    type="text"
                    value={formTitulo}
                    onChange={(e) => setFormTitulo(e.target.value)}
                    className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-2.5 outline-none focus:border-[#8b2f2b]"
                    placeholder="Título da seção (opcional)"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Subtítulo</span>
                  <input
                    type="text"
                    value={formSubtitulo}
                    onChange={(e) => setFormSubtitulo(e.target.value)}
                    className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-2.5 outline-none focus:border-[#8b2f2b]"
                    placeholder="Subtítulo opcional de apoio"
                  />
                </label>

                <RichTextField
                  name="conteudo"
                  label="Conteúdo Principal"
                  defaultValue={editingSecao?.conteudo ?? ""}
                  placeholder="Texto completo em markdown."
                />

                {(formTipo === "imagem_texto" || formTipo === "cta") && (
                  <MediaUrlField
                    name="imagem_url"
                    label="Imagem da Seção"
                    defaultValue={editingSecao?.imagem_url ?? ""}
                    assets={mediaAssets}
                    helper="Escolha a imagem para a seção."
                  />
                )}

                <label className="flex items-center gap-2 cursor-pointer mt-2">
                  <input
                    type="checkbox"
                    checked={formAtivo}
                    onChange={(e) => setFormAtivo(e.target.checked)}
                    className="h-4.5 w-4.5 accent-[#8b2f2b]"
                  />
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Seção Ativa</span>
                </label>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 mt-6 border-t border-[#ead9a6] pt-4 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2.5 text-xs font-bold text-[#8b2f2b] hover:bg-[#fffaf0] transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-[#171006] px-5 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-white hover:bg-slate-800 transition"
                  >
                    <Save size={14} />
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {activeSecaoForCards && (
        <CardsManager
          secaoId={activeSecaoForCards.id}
          secaoTitulo={activeSecaoForCards.titulo || `Seção ${activeSecaoForCards.tipo}`}
          mediaAssets={mediaAssets}
          isOpen={isCardsOpen}
          onClose={() => {
            setIsCardsOpen(false);
            setActiveSecaoForCards(null);
          }}
        />
      )}

      {activeSecaoForDocs && (
        <SecaoDocumentosManager
          secaoId={activeSecaoForDocs.id}
          secaoTitulo={activeSecaoForDocs.titulo || `Seção ${activeSecaoForDocs.tipo}`}
          isOpen={isDocsOpen}
          onClose={() => {
            setIsDocsOpen(false);
            setActiveSecaoForDocs(null);
          }}
        />
      )}
    </div>
  );
}
