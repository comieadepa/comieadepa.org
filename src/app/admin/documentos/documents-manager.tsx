"use client";

import { Download, Save, Search, Star, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import {
  buildDocumentDownloadPath,
  CmsDocument,
  documentStatusOptions,
  formatDocumentSize,
  inferDocumentType,
  type DocumentStatus,
} from "@/lib/documentos";

type DocumentsManagerProps = {
  documents: CmsDocument[];
  categories: string[];
  canCreate: boolean;
  canUpdate: boolean;
  canPublish: boolean;
  canArchive: boolean;
  canDelete: boolean;
};

const statusLabels: Record<DocumentStatus, string> = {
  rascunho: "Rascunho",
  publicado: "Publicado",
  arquivado: "Arquivado",
};

export function DocumentsManager({
  documents,
  categories,
  canCreate,
  canUpdate,
  canPublish,
  canArchive,
  canDelete,
}: DocumentsManagerProps) {
  const [editingId, setEditingId] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | DocumentStatus>("todos");
  const [categoryFilter, setCategoryFilter] = useState("todas");
  const [search, setSearch] = useState("");
  const editingDocument = documents.find((document) => document.id === editingId);
  const canWrite = editingDocument ? canUpdate : canCreate;

  const filteredDocuments = useMemo(() => {
    const term = search.trim().toLowerCase();

    return documents.filter((document) => {
      if (statusFilter !== "todos" && document.status !== statusFilter) {
        return false;
      }

      if (categoryFilter !== "todas" && (document.categoria ?? "") !== categoryFilter) {
        return false;
      }

      if (!term) {
        return true;
      }

      return `${document.titulo} ${document.descricao ?? ""} ${document.categoria ?? ""} ${document.slug}`
        .toLowerCase()
        .includes(term);
    });
  }, [categoryFilter, documents, search, statusFilter]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canWrite) {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const isEditing = Boolean(formData.get("id"));

    try {
      const response = await fetch("/api/admin/documentos", {
        method: isEditing ? "PUT" : "POST",
        body: formData,
      });

      if (response.redirected) {
        window.location.href = response.url;
        return;
      }

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message = typeof payload?.error === "string" ? payload.error : "Erro ao salvar documento.";
        window.location.href = `/admin/documentos?error=1&message=${encodeURIComponent(message)}`;
        return;
      }

      window.location.href = "/admin/documentos?success=1";
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao salvar documento.";
      window.location.href = `/admin/documentos?error=1&message=${encodeURIComponent(message)}`;
    }
  }

  async function handleArchive(id: string) {
    if (!canArchive) {
      return;
    }

    await handleDeleteRequest(`/api/admin/documentos?id=${encodeURIComponent(id)}`, "Erro ao arquivar documento.");
  }

  async function handleDelete(id: string) {
    if (!canDelete) {
      return;
    }

    const confirmed = window.confirm("Excluir definitivamente este documento?");
    if (!confirmed) {
      return;
    }

    await handleDeleteRequest(`/api/admin/documentos?id=${encodeURIComponent(id)}&hard=1`, "Erro ao excluir documento.");
  }

  async function handleQuickStatus(document: CmsDocument, status: DocumentStatus) {
    if (!canUpdate) {
      return;
    }

    try {
      const formData = buildFormDataFromDocument(document, status);
      const response = await fetch("/api/admin/documentos", {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message = typeof payload?.error === "string" ? payload.error : "Erro ao atualizar status.";
        window.location.href = `/admin/documentos?error=1&message=${encodeURIComponent(message)}`;
        return;
      }

      window.location.href = "/admin/documentos?success=1";
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao atualizar status.";
      window.location.href = `/admin/documentos?error=1&message=${encodeURIComponent(message)}`;
    }
  }

  async function handleDeleteRequest(url: string, fallbackMessage: string) {
    try {
      const response = await fetch(url, { method: "DELETE" });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message = typeof payload?.error === "string" ? payload.error : fallbackMessage;
        window.location.href = `/admin/documentos?error=1&message=${encodeURIComponent(message)}`;
        return;
      }

      window.location.href = "/admin/documentos?success=1";
    } catch (error) {
      const message = error instanceof Error ? error.message : fallbackMessage;
      window.location.href = `/admin/documentos?error=1&message=${encodeURIComponent(message)}`;
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_430px]">
      <section className="border border-[#d8c38b] bg-white/76 p-6 shadow-[0_18px_50px_rgba(23,16,6,.08)]">
        <form onSubmit={handleSubmit} className="grid gap-5">
          <input type="hidden" name="id" value={editingDocument?.id ?? ""} />

          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Titulo</span>
            <input
              name="titulo"
              required
              disabled={!canWrite}
              defaultValue={editingDocument?.titulo}
              className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Ex.: Estatuto atualizado"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Slug</span>
            <input
              name="slug"
              pattern="^[a-z0-9-]+$"
              title="Use apenas letras minusculas, numeros e hifen."
              disabled={!canWrite}
              defaultValue={editingDocument?.slug}
              className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="estatuto-atualizado"
            />
            <span className="text-xs font-semibold text-[#8b2f2b]/80">Use apenas letras minusculas, numeros e hifen.</span>
          </label>

          <div className="grid gap-5 md:grid-cols-3">
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Categoria</span>
              <input
                name="categoria"
                disabled={!canWrite}
                defaultValue={editingDocument?.categoria ?? ""}
                className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="Atas, Estatutos, Formularios..."
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Status</span>
              <select
                name="status"
                disabled={!canWrite}
                defaultValue={editingDocument?.status ?? "rascunho"}
                className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="rascunho">Rascunho</option>
                {canPublish ? <option value="publicado">Publicado</option> : null}
                {canArchive ? <option value="arquivado">Arquivado</option> : null}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Ordem</span>
              <input
                name="ordem"
                type="number"
                disabled={!canWrite}
                defaultValue={editingDocument?.ordem ?? 0}
                className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="0"
              />
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Descricao</span>
            <textarea
              name="descricao"
              disabled={!canWrite}
              defaultValue={editingDocument?.descricao ?? ""}
              className="min-h-28 border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Resumo curto do documento para listagens e pagina interna."
            />
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Arquivo principal</span>
              <input
                name="arquivo"
                type="file"
                disabled={!canWrite}
                className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 text-sm outline-none file:mr-4 file:border-0 file:bg-[#171006] file:px-4 file:py-2 file:font-black file:uppercase file:tracking-[0.12em] file:text-[#f4cf6a] disabled:cursor-not-allowed disabled:opacity-60"
              />
              <span className="text-xs text-[#5a472c]">
                {editingDocument?.arquivo_url ? "Envie um novo arquivo apenas se quiser substituir o atual." : "Obrigatorio no cadastro."}
              </span>
              {editingDocument?.arquivo_url ? (
                <a
                  href={buildDocumentDownloadPath(editingDocument.slug)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-black uppercase tracking-[0.12em] text-[#8b2f2b] underline underline-offset-4"
                >
                  Baixar arquivo atual
                </a>
              ) : null}
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Capa opcional</span>
              <input
                name="thumbnail"
                type="file"
                accept="image/*"
                disabled={!canWrite}
                className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 text-sm outline-none file:mr-4 file:border-0 file:bg-[#171006] file:px-4 file:py-2 file:font-black file:uppercase file:tracking-[0.12em] file:text-[#f4cf6a] disabled:cursor-not-allowed disabled:opacity-60"
              />
              <span className="text-xs text-[#5a472c]">Use imagem vertical ou horizontal para enriquecer a listagem publica.</span>
            </label>
          </div>

          <label className="inline-flex items-center gap-3 border border-dashed border-[#d8c38b] bg-[#fffaf0] px-4 py-3 text-sm font-semibold text-[#5a472c]">
            <input
              name="destaque"
              type="checkbox"
              defaultChecked={editingDocument?.destaque ?? false}
              disabled={!canWrite}
              className="h-4 w-4 accent-[#8b2f2b]"
            />
            Destacar documento na listagem publica
          </label>

          {editingDocument ? (
            <div className="grid gap-2 border border-[#d8c38b] bg-[#fffaf0] p-4 text-sm text-[#5a472c] md:grid-cols-3">
              <p>
                <strong className="font-black text-[#171006]">Downloads:</strong> {editingDocument.downloads}
              </p>
              <p>
                <strong className="font-black text-[#171006]">Tipo:</strong>{" "}
                {editingDocument.tipo_arquivo ?? inferDocumentType(editingDocument.arquivo_url)}
              </p>
              <p>
                <strong className="font-black text-[#171006]">Tamanho:</strong> {formatDocumentSize(editingDocument.tamanho)}
              </p>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={!canWrite}
              className="inline-flex w-fit items-center gap-3 bg-[#171006] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={18} />
              {editingDocument ? "Atualizar documento" : "Salvar documento"}
            </button>
            {editingDocument ? (
              <button
                type="button"
                onClick={() => setEditingId("")}
                className="text-sm font-semibold text-[#8b2f2b] underline underline-offset-4"
              >
                Cancelar edicao
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <aside className="border border-[#d8c38b] bg-[#171006] p-6 text-white shadow-[0_18px_50px_rgba(23,16,6,.14)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#f4cf6a]">Documentos</p>
            <h2 className="mt-2 font-serif text-4xl font-black">Acervo oficial</h2>
          </div>
          <div className="grid gap-2">
            <label className="flex items-center gap-3 border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white/70">
              <Search size={16} className="text-[#f4cf6a]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full bg-transparent outline-none"
                placeholder="Pesquisar"
              />
            </label>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
            className="border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white outline-none"
          >
            <option value="todos">Todos os status</option>
            {documentStatusOptions.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white outline-none"
          >
            <option value="todas">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 grid gap-4">
          {filteredDocuments.map((document) => (
            <article key={document.id} className="border border-white/10 bg-white/[0.055] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#f4cf6a]">{statusLabels[document.status]}</p>
                  <h3 className="mt-2 font-serif text-2xl font-black">{document.titulo}</h3>
                </div>
                {document.destaque ? <Star size={16} className="shrink-0 text-[#f4cf6a]" /> : null}
              </div>

              <p className="mt-2 text-xs uppercase tracking-[0.14em] text-white/60">/{document.slug}</p>
              <div className="mt-4 grid gap-2 text-sm text-white/68">
                <p>{document.categoria || "Sem categoria"}</p>
                <p>
                  {document.tipo_arquivo ?? inferDocumentType(document.arquivo_url)} . {formatDocumentSize(document.tamanho)}
                </p>
                <p>{document.downloads} downloads</p>
              </div>
              {document.descricao ? <p className="mt-4 text-sm leading-6 text-white/58">{document.descricao}</p> : null}

              <div className="mt-5 flex flex-wrap gap-3">
                {canUpdate ? (
                  <button
                    type="button"
                    onClick={() => setEditingId(document.id)}
                    className="inline-flex text-xs font-black uppercase tracking-[0.14em] text-[#f4cf6a]"
                  >
                    Editar
                  </button>
                ) : null}

                <a
                  href={buildDocumentDownloadPath(document.slug)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-white/72 transition hover:text-[#f4cf6a]"
                >
                  <Download size={14} />
                  Baixar
                </a>

                {canPublish && document.status !== "publicado" ? (
                  <button
                    type="button"
                    onClick={() => handleQuickStatus(document, "publicado")}
                    className="inline-flex text-xs font-black uppercase tracking-[0.14em] text-white/60 transition hover:text-[#f4cf6a]"
                  >
                    Publicar
                  </button>
                ) : null}

                {canPublish && document.status === "publicado" ? (
                  <button
                    type="button"
                    onClick={() => handleQuickStatus(document, "rascunho")}
                    className="inline-flex text-xs font-black uppercase tracking-[0.14em] text-white/60 transition hover:text-[#f4cf6a]"
                  >
                    Despublicar
                  </button>
                ) : null}

                {canArchive && document.status !== "arquivado" ? (
                  <button
                    type="button"
                    onClick={() => handleArchive(document.id)}
                    className="inline-flex text-xs font-black uppercase tracking-[0.14em] text-white/50 transition hover:text-[#f4cf6a]"
                  >
                    Arquivar
                  </button>
                ) : null}

                {canDelete ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(document.id)}
                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-white/50 transition hover:text-[#f4cf6a]"
                  >
                    <Trash2 size={14} />
                    Excluir
                  </button>
                ) : null}
              </div>
            </article>
          ))}

          {filteredDocuments.length === 0 ? (
            <div className="border border-white/10 bg-white/[0.055] p-6 text-white/62">
              Nenhum documento encontrado com os filtros atuais.
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}

function buildFormDataFromDocument(document: CmsDocument, status: DocumentStatus) {
  const formData = new FormData();
  formData.set("id", document.id);
  formData.set("titulo", document.titulo);
  formData.set("slug", document.slug);
  formData.set("descricao", document.descricao ?? "");
  formData.set("categoria", document.categoria ?? "");
  formData.set("status", status);
  formData.set("ordem", String(document.ordem));
  if (document.destaque) {
    formData.set("destaque", "on");
  }
  return formData;
}
