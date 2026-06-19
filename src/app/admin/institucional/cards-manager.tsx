"use client";

import { Edit, Plus, Trash2, X, Save, Eye, EyeOff } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { CmsInstitucionalCard } from "@/app/api/admin/institucional/cards/route";
import { MediaPickerAsset, MediaUrlField } from "../media-url-field";

type CardsManagerProps = {
  secaoId: string;
  secaoTitulo: string;
  mediaAssets: MediaPickerAsset[];
  isOpen: boolean;
  onClose: () => void;
};

export function CardsManager({
  secaoId,
  secaoTitulo,
  mediaAssets,
  isOpen,
  onClose,
}: CardsManagerProps) {
  const [cards, setCards] = useState<CmsInstitucionalCard[]>([]);
  const [loading, setLoading] = useState(true);

  // Form overlay states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CmsInstitucionalCard | null>(null);

  // Form fields
  const [formTitulo, setFormTitulo] = useState("");
  const [formSubtitulo, setFormSubtitulo] = useState("");
  const [formDescricao, setFormDescricao] = useState("");
  const [formIcone, setFormIcone] = useState("");
  const [formLinkUrl, setFormLinkUrl] = useState("");
  const [formLinkTexto, setFormLinkTexto] = useState("");
  const [formOrdem, setFormOrdem] = useState(0);
  const [formAtivo, setFormAtivo] = useState(true);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/institucional/cards?secao_id=${encodeURIComponent(secaoId)}`);
      if (res.ok) {
        const data = await res.json();
        setCards(data);
      }
    } catch (e) {
      console.error("Erro ao carregar cards", e);
    } finally {
      setLoading(false);
    }
  }, [secaoId]);

  useEffect(() => {
    if (isOpen) {
      fetchCards();
    }
  }, [isOpen, fetchCards]);

  function handleOpenCreate() {
    setEditingCard(null);
    setFormTitulo("");
    setFormSubtitulo("");
    setFormDescricao("");
    setFormIcone("");
    setFormLinkUrl("");
    setFormLinkTexto("");
    setFormOrdem(cards.length * 10);
    setFormAtivo(true);
    setIsFormOpen(true);
  }

  function handleOpenEdit(card: CmsInstitucionalCard) {
    setEditingCard(card);
    setFormTitulo(card.titulo);
    setFormSubtitulo(card.subtitulo ?? "");
    setFormDescricao(card.descricao ?? "");
    setFormIcone(card.icone ?? "");
    setFormLinkUrl(card.link_url ?? "");
    setFormLinkTexto(card.link_texto ?? "");
    setFormOrdem(card.ordem);
    setFormAtivo(card.ativo);
    setIsFormOpen(true);
  }

  async function handleToggleAtivo(card: CmsInstitucionalCard) {
    try {
      const response = await fetch("/api/admin/institucional/cards", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...card,
          ativo: !card.ativo,
        }),
      });

      if (!response.ok) {
        alert("Erro ao atualizar status do card.");
        return;
      }
      fetchCards();
    } catch (e) {
      console.error(e);
      alert("Erro ao conectar à API.");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Excluir definitivamente este card?")) return;

    try {
      const response = await fetch(`/api/admin/institucional/cards?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        alert("Erro ao excluir card.");
        return;
      }
      fetchCards();
    } catch (e) {
      console.error(e);
      alert("Erro ao conectar à API.");
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const payload = {
      id: editingCard?.id,
      secao_id: secaoId,
      titulo: formTitulo,
      subtitulo: formSubtitulo || null,
      descricao: formDescricao || null,
      imagem_url: (formData.get("imagem_url") as string) || null,
      icone: formIcone || null,
      link_url: formLinkUrl || null,
      link_texto: formLinkTexto || null,
      ordem: Number(formOrdem),
      ativo: formAtivo,
    };

    try {
      const response = await fetch("/api/admin/institucional/cards", {
        method: editingCard ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        alert(err.error || "Erro ao salvar card.");
        return;
      }

      setIsFormOpen(false);
      fetchCards();
    } catch (e) {
      console.error(e);
      alert("Erro de comunicação com a API.");
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-4xl border border-[#d8c38b] bg-white shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ead9a6] bg-[#fffaf0] px-6 py-4 shrink-0">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#8b2f2b]">Cards de Seção</span>
            <h3 className="font-serif text-lg font-bold text-[#171006]">
              {secaoTitulo}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-black transition">
            <X size={20} />
          </button>
        </div>

        {/* List Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-serif text-sm font-bold text-[#8b2f2b] uppercase tracking-wider">
              Lista de Cards
            </h4>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 bg-[#f4cf6a] px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-[#171006] hover:bg-[#ebd59b] transition"
            >
              <Plus size={14} />
              Novo Card
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">Carregando cards...</div>
          ) : cards.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm border border-dashed border-[#ead9a6] bg-[#fffaf0]/30">
              Nenhum card cadastrado para esta seção.
            </div>
          ) : (
            <div className="border border-[#ead9a6] overflow-x-auto">
              <table className="min-w-full divide-y divide-[#ead9a6] text-left text-sm">
                <thead className="bg-[#fffaf0] text-[11px] font-black uppercase tracking-[0.15em] text-[#8b2f2b]">
                  <tr>
                    <th className="px-6 py-3">Título</th>
                    <th className="px-6 py-3">Subtítulo</th>
                    <th className="px-6 py-3 text-center">Ordem</th>
                    <th className="px-6 py-3 text-center">Ativo</th>
                    <th className="px-6 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ead9a6] text-[#5a472c]">
                  {cards.map((card) => (
                    <tr key={card.id} className="hover:bg-[#fffaf0]/40 transition">
                      <td className="px-6 py-3 font-bold text-[#171006]">{card.titulo}</td>
                      <td className="px-6 py-3 text-slate-500">{card.subtitulo || <span className="italic text-slate-400">Nenhum</span>}</td>
                      <td className="px-6 py-3 text-center font-bold">{card.ordem}</td>
                      <td className="px-6 py-3 text-center">
                        <button
                          onClick={() => handleToggleAtivo(card)}
                          className={`inline-flex p-1.5 transition ${card.ativo ? "text-[#00b67a]" : "text-slate-400"}`}
                          title={card.ativo ? "Ativo (clique para desativar)" : "Inativo (clique para ativar)"}
                        >
                          {card.ativo ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleOpenEdit(card)}
                            className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.12em] text-[#0F3B63] hover:underline"
                          >
                            <Edit size={12} />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(card.id)}
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

        {/* Card Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-2xl border border-[#d8c38b] bg-white shadow-2xl max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-[#ead9a6] bg-[#fffaf0] px-6 py-4 shrink-0">
                <h3 className="font-serif text-base font-bold text-[#171006]">
                  {editingCard ? "Editar Card" : "Novo Card"}
                </h3>
                <button onClick={() => setIsFormOpen(false)} className="text-slate-500 hover:text-black transition">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="overflow-y-auto p-6 flex-1 grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-1">
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Título do Card</span>
                    <input
                      type="text"
                      required
                      value={formTitulo}
                      onChange={(e) => setFormTitulo(e.target.value)}
                      className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-2.5 outline-none focus:border-[#8b2f2b]"
                      placeholder="Título principal"
                    />
                  </label>

                  <label className="grid gap-1">
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Subtítulo</span>
                    <input
                      type="text"
                      value={formSubtitulo}
                      onChange={(e) => setFormSubtitulo(e.target.value)}
                      className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-2.5 outline-none focus:border-[#8b2f2b]"
                      placeholder="Subtítulo de apoio"
                    />
                  </label>
                </div>

                <label className="grid gap-1">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Descrição</span>
                  <textarea
                    value={formDescricao}
                    onChange={(e) => setFormDescricao(e.target.value)}
                    rows={3}
                    className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-2.5 outline-none focus:border-[#8b2f2b]"
                    placeholder="Descrição curta para o card."
                  />
                </label>

                <MediaUrlField
                  name="imagem_url"
                  label="Imagem do Card"
                  defaultValue={editingCard?.imagem_url ?? ""}
                  assets={mediaAssets}
                  helper="Selecione ou envie a imagem para o card."
                />

                <div className="grid gap-4 md:grid-cols-3">
                  <label className="grid gap-1">
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Ícone (Lucide)</span>
                    <input
                      type="text"
                      value={formIcone}
                      onChange={(e) => setFormIcone(e.target.value)}
                      className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-2.5 outline-none focus:border-[#8b2f2b]"
                      placeholder="Ex: Users, Landmark"
                    />
                  </label>

                  <label className="grid gap-1">
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Texto do Link</span>
                    <input
                      type="text"
                      value={formLinkTexto}
                      onChange={(e) => setFormLinkTexto(e.target.value)}
                      className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-2.5 outline-none focus:border-[#8b2f2b]"
                      placeholder="Ex: Saiba mais"
                    />
                  </label>

                  <label className="grid gap-1">
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">URL do Link</span>
                    <input
                      type="text"
                      value={formLinkUrl}
                      onChange={(e) => setFormLinkUrl(e.target.value)}
                      className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-2.5 outline-none focus:border-[#8b2f2b]"
                      placeholder="Ex: /documentos"
                    />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2 items-center">
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

                  <label className="flex items-center gap-2 cursor-pointer mt-4">
                    <input
                      type="checkbox"
                      checked={formAtivo}
                      onChange={(e) => setFormAtivo(e.target.checked)}
                      className="h-4.5 w-4.5 accent-[#8b2f2b]"
                    />
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Card Ativo</span>
                  </label>
                </div>

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
    </div>
  );
}
