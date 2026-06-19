"use client";

import { Plus, Trash2, X, Eye, EyeOff } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { CmsInstitucionalDocumento } from "@/app/api/admin/institucional/documentos/route";

type DocumentOption = {
  id: string;
  titulo: string;
  categoria: string | null;
  status: string;
};

type SecaoDocumentosManagerProps = {
  secaoId: string;
  secaoTitulo: string;
  isOpen: boolean;
  onClose: () => void;
};

export function SecaoDocumentosManager({
  secaoId,
  secaoTitulo,
  isOpen,
  onClose,
}: SecaoDocumentosManagerProps) {
  const [links, setLinks] = useState<CmsInstitucionalDocumento[]>([]);
  const [availableDocs, setAvailableDocs] = useState<DocumentOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Selector state
  const [selectedDocId, setSelectedDocId] = useState("");
  const [formOrdem, setFormOrdem] = useState(0);

  // Edit inline states
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editOrdem, setEditOrdem] = useState(0);

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/institucional/documentos?secao_id=${encodeURIComponent(secaoId)}`);
      if (res.ok) {
        const data = await res.json();
        setLinks(data);
      }
    } catch (e) {
      console.error("Erro ao carregar vínculos de documentos", e);
    } finally {
      setLoading(false);
    }
  }, [secaoId]);

  const fetchAvailableDocs = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/documentos?status=publicado");
      if (res.ok) {
        const data = await res.json();
        setAvailableDocs(data);
      }
    } catch (e) {
      console.error("Erro ao carregar documentos do CMS", e);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchLinks();
      fetchAvailableDocs();
      setSelectedDocId("");
      setFormOrdem(0);
    }
  }, [isOpen, fetchLinks, fetchAvailableDocs]);

  async function handleLink(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDocId) {
      alert("Selecione um documento.");
      return;
    }

    try {
      const response = await fetch("/api/admin/institucional/documentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secao_id: secaoId,
          documento_id: selectedDocId,
          ordem: Number(formOrdem),
          ativo: true,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        alert(err.error || "Erro ao vincular documento.");
        return;
      }

      setSelectedDocId("");
      setFormOrdem(0);
      fetchLinks();
    } catch (e) {
      console.error(e);
      alert("Erro ao conectar à API.");
    }
  }

  async function handleUpdateInline(link: CmsInstitucionalDocumento, newOrdem: number) {
    try {
      const response = await fetch("/api/admin/institucional/documentos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: link.id,
          ordem: newOrdem,
          ativo: link.ativo,
        }),
      });

      if (!response.ok) {
        alert("Erro ao atualizar ordem.");
        return;
      }
      setEditingLinkId(null);
      fetchLinks();
    } catch (e) {
      console.error(e);
      alert("Erro ao conectar à API.");
    }
  }

  async function handleToggleAtivo(link: CmsInstitucionalDocumento) {
    try {
      const response = await fetch("/api/admin/institucional/documentos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: link.id,
          ordem: link.ordem,
          ativo: !link.ativo,
        }),
      });

      if (!response.ok) {
        alert("Erro ao atualizar status.");
        return;
      }
      fetchLinks();
    } catch (e) {
      console.error(e);
      alert("Erro ao conectar à API.");
    }
  }

  async function handleUnlink(id: string) {
    if (!window.confirm("Remover o vínculo deste documento?")) return;

    try {
      const response = await fetch(`/api/admin/institucional/documentos?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        alert("Erro ao desvincular documento.");
        return;
      }
      fetchLinks();
    } catch (e) {
      console.error(e);
      alert("Erro ao conectar à API.");
    }
  }

  // Filtrar documentos que já estão vinculados para não duplicar na lista de seleção
  const linkedDocIds = new Set(links.map((link) => link.documento_id));
  const filterOptions = availableDocs.filter((doc) => !linkedDocIds.has(doc.id));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-4xl border border-[#d8c38b] bg-white shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ead9a6] bg-[#fffaf0] px-6 py-4 shrink-0">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#8b2f2b]">Documentos de Seção</span>
            <h3 className="font-serif text-lg font-bold text-[#171006]">
              {secaoTitulo}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-black transition">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {/* Vincular Novo Form */}
          <form onSubmit={handleLink} className="border border-[#ead9a6] bg-[#fffaf0]/30 p-4 rounded-xl">
            <h4 className="text-xs font-black uppercase tracking-[0.12em] text-[#8b2f2b] mb-3">
              Vincular Documento Existente
            </h4>
            <div className="grid gap-4 md:grid-cols-[1fr_120px_120px] items-end">
              <label className="grid gap-1">
                <span className="text-[11px] font-semibold text-slate-500">Selecione o Documento</span>
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="border border-[#d8c38b] bg-white px-4 py-2.5 outline-none focus:border-[#8b2f2b] text-sm text-[#171006]"
                >
                  <option value="">-- Escolha um documento --</option>
                  {filterOptions.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.titulo} {doc.categoria ? `(${doc.categoria})` : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1">
                <span className="text-[11px] font-semibold text-slate-500">Ordem</span>
                <input
                  type="number"
                  value={formOrdem}
                  onChange={(e) => setFormOrdem(Number(e.target.value))}
                  className="border border-[#d8c38b] bg-white px-4 py-2 outline-none focus:border-[#8b2f2b] text-sm"
                  min={0}
                />
              </label>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 bg-[#f4cf6a] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#171006] hover:bg-[#ebd59b] transition h-10 border border-[#d8c38b]"
              >
                <Plus size={16} />
                Vincular
              </button>
            </div>
          </form>

          {/* List of Linked Docs */}
          <div>
            <h4 className="font-serif text-sm font-bold text-[#8b2f2b] uppercase tracking-wider mb-3">
              Documentos Vinculados
            </h4>

            {loading ? (
              <div className="py-8 text-center text-slate-400 text-sm">Carregando vínculos...</div>
            ) : links.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm border border-dashed border-[#ead9a6] bg-[#fffaf0]/30 rounded-xl">
                Nenhum documento vinculado a esta seção.
              </div>
            ) : (
              <div className="border border-[#ead9a6] overflow-x-auto rounded-xl">
                <table className="min-w-full divide-y divide-[#ead9a6] text-left text-sm">
                  <thead className="bg-[#fffaf0] text-[11px] font-black uppercase tracking-[0.15em] text-[#8b2f2b]">
                    <tr>
                      <th className="px-6 py-3">Documento</th>
                      <th className="px-6 py-3">Categoria</th>
                      <th className="px-6 py-3 text-center">Ordem</th>
                      <th className="px-6 py-3 text-center">Ativo</th>
                      <th className="px-6 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ead9a6] text-[#5a472c] bg-white">
                    {links.map((link) => (
                      <tr key={link.id} className="hover:bg-[#fffaf0]/40 transition">
                        <td className="px-6 py-3 font-bold text-[#171006]">
                          {link.cms_documentos?.titulo || <span className="text-red-500 font-normal italic">(Documento não encontrado)</span>}
                        </td>
                        <td className="px-6 py-3 text-slate-500">
                          {link.cms_documentos?.categoria || <span className="italic text-slate-400">Nenhuma</span>}
                        </td>
                        <td className="px-6 py-3 text-center">
                          {editingLinkId === link.id ? (
                            <div className="flex justify-center items-center gap-2">
                              <input
                                type="number"
                                value={editOrdem}
                                onChange={(e) => setEditOrdem(Number(e.target.value))}
                                className="w-16 border border-[#d8c38b] bg-white px-2 py-1 outline-none text-center text-xs"
                                min={0}
                              />
                              <button
                                onClick={() => handleUpdateInline(link, editOrdem)}
                                className="text-[#00b67a] hover:underline text-xs font-bold"
                              >
                                Salvar
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingLinkId(link.id);
                                setEditOrdem(link.ordem);
                              }}
                              className="font-bold underline hover:text-[#8b2f2b]"
                              title="Clique para editar ordem"
                            >
                              {link.ordem}
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-3 text-center">
                          <button
                            onClick={() => handleToggleAtivo(link)}
                            className={`inline-flex p-1.5 transition ${link.ativo ? "text-[#00b67a]" : "text-slate-400"}`}
                            title={link.ativo ? "Ativo (clique para desativar)" : "Inativo (clique para ativar)"}
                          >
                            {link.ativo ? <Eye size={18} /> : <EyeOff size={18} />}
                          </button>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={() => handleUnlink(link.id)}
                            className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.12em] text-red-700 hover:underline"
                          >
                            <Trash2 size={12} />
                            Desvincular
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
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
      </div>
    </div>
  );
}
