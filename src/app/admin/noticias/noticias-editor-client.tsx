"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Plus,
  Save,
  Search,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { MediaPickerAsset, MediaUrlField } from "../media-url-field";
import { RichTextField } from "../rich-text-field";
import { AdminFilterPills, AdminStatusBadge } from "../admin-ui";

export type CmsPost = {
  id: string;
  titulo: string;
  slug: string;
  status: string;
  categoria_id: string | null;
  departamento_id: string | null;
  resumo: string | null;
  conteudo: string | null;
  capa_url: string | null;
  destaque_home: boolean;
  publicado_em: string | null;
  created_at: string;
};

export type CmsCategory = {
  id: string;
  nome: string;
};

export type CmsDepartmentOption = {
  id: string;
  nome: string;
};

type Props = {
  posts: CmsPost[];
  categories: CmsCategory[];
  departments: CmsDepartmentOption[];
  mediaAssets: MediaPickerAsset[];
  editingPost: CmsPost | null;
  canCreate: boolean;
  canUpdate: boolean;
  canPublish: boolean;
  canArchive: boolean;
  currentStatus: string;
  searchQuery: string;
  page: number;
  totalPosts: number;
  pageSize: number;
};

export function NoticiasEditorClient({
  posts,
  categories,
  departments,
  mediaAssets,
  editingPost: initialEditingPost,
  canCreate,
  canUpdate,
  canPublish,
  canArchive,
  currentStatus,
  searchQuery: initialSearch,
  page,
  totalPosts,
  pageSize,
}: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [editingPost, setEditingPost] = useState<CmsPost | null>(initialEditingPost);
  const [title, setTitle] = useState(initialEditingPost?.titulo ?? "");
  const [slug, setSlug] = useState(initialEditingPost?.slug ?? "");
  const [status, setStatus] = useState(initialEditingPost?.status ?? "rascunho");
  const [departmentId, setDepartmentId] = useState(initialEditingPost?.departamento_id ?? "");
  const [categoryId, setCategoryId] = useState(initialEditingPost?.categoria_id ?? "");
  const [resumo, setResumo] = useState(initialEditingPost?.resumo ?? "");
  const [destaqueHome, setDestaqueHome] = useState(initialEditingPost?.destaque_home ?? false);
  const [publishDate, setPublishDate] = useState(formatDateTimeLocal(initialEditingPost?.publicado_em));

  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [search, setSearch] = useState(initialSearch);

  const canWrite = editingPost ? canUpdate : canCreate;
  const totalPages = Math.max(1, Math.ceil(totalPosts / pageSize));

  function generateSlug() {
    if (!title.trim()) return;
    const generated = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(generated);
  }

  function handleNewArticle() {
    setEditingPost(null);
    setTitle("");
    setSlug("");
    setStatus("rascunho");
    setDepartmentId("");
    setCategoryId("");
    setResumo("");
    setDestaqueHome(false);
    setPublishDate("");
    setFeedback(null);
    router.push("/admin/noticias");
  }

  async function handleSave(targetStatus?: string) {
    if (!title.trim()) {
      setFeedback({ type: "error", message: "Informe o título da notícia para continuar." });
      return;
    }

    const nextStatus = targetStatus || status;
    setIsSaving(true);
    setFeedback(null);

    const formElement = document.getElementById("news-form") as HTMLFormElement | null;
    const formData = new FormData(formElement || undefined);

    formData.set("id", editingPost?.id ?? "");
    formData.set("titulo", title);
    formData.set("slug", slug || title);
    formData.set("status", nextStatus);
    formData.set("departamento_id", departmentId);
    formData.set("categoria_id", categoryId);
    formData.set("resumo", resumo);
    formData.set("destaque_home", destaqueHome ? "on" : "off");
    if (publishDate) {
      formData.set("publicado_em", publishDate);
    }

    try {
      const response = await fetch("/api/admin/posts", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "x-requested-with": "fetch",
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Erro ao salvar notícia.");
      }

      setFeedback({
        type: "success",
        message: data.message || (nextStatus === "publicado" ? "Notícia publicada com sucesso!" : "Rascunho salvo com sucesso!"),
      });

      setStatus(nextStatus);

      startTransition(() => {
        router.refresh();
        if (!editingPost && data.id) {
          router.push("/admin/noticias?edit=" + data.id);
        }
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Ocorreu um erro ao processar o salvamento.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const queryParam = search.trim() ? "&q=" + encodeURIComponent(search.trim()) : "";
    const statusParam = currentStatus !== "todos" ? "&status=" + encodeURIComponent(currentStatus) : "";
    router.push("/admin/noticias?page=1" + statusParam + queryParam);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_390px]">
      {/* Editor Main Section */}
      <section className="border border-[#d8c38b] bg-white/76 p-6 shadow-[0_18px_50px_rgba(23,16,6,.08)]">
        {/* Editor Top Bar */}
        <div className="flex flex-col gap-4 border-b border-[#d8c38b]/40 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8b2f2b]">
                {editingPost ? "Edição Editorial" : "Nova Notícia"}
              </p>
              {editingPost ? <AdminStatusBadge status={status} /> : null}
            </div>
            <h2 className="mt-1 font-serif text-3xl font-black text-[#171006]">
              {editingPost ? "Editar Publicação" : "Criar Publicação Institucional"}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {editingPost ? (
              <>
                <a
                  href={"/admin/preview/noticias/" + editingPost.id}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 border border-[#d8c38b] bg-white px-3.5 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#8b2f2b] transition hover:bg-[#fffaf0]"
                >
                  <Eye size={14} />
                  Prévia Externa
                </a>
                <button
                  type="button"
                  onClick={handleNewArticle}
                  className="inline-flex items-center gap-2 bg-[#171006] px-3.5 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#f4cf6a] transition hover:bg-[#2c2212]"
                >
                  <Plus size={14} />
                  Novo Artigo
                </button>
              </>
            ) : null}
          </div>
        </div>

        {/* Real-time Feedback Banner */}
        {feedback ? (
          <div
            className={`my-4 flex items-center justify-between gap-3 border p-4 text-sm font-semibold ${
              feedback.type === "success"
                ? "border-[#00b67a]/40 bg-[#e8fff4] text-[#075f3f]"
                : "border-[#8b2f2b]/40 bg-[#fff1ed] text-[#8b2f2b]"
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === "success" ? <CheckCircle2 size={18} /> : <X size={18} />}
              <span>{feedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-xs underline opacity-70 hover:opacity-100"
            >
              Fechar
            </button>
          </div>
        ) : null}

        {/* Form Body */}
        <form id="news-form" onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="mt-6 grid gap-5">
          <input type="hidden" name="id" value={editingPost?.id ?? ""} />

          {/* Title with live counter */}
          <label className="grid gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Título da Notícia</span>
              <span className="text-xs text-[#5a472c]/60">{title.length} caracteres</span>
            </div>
            <input
              name="titulo"
              required
              disabled={!canWrite}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 text-base font-semibold outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Ex.: COMIEADEPA realiza encontro ministerial em Belém..."
            />
          </label>

          {/* Slug with Auto-generate helper */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Slug (URL amigável)</span>
              <button
                type="button"
                onClick={generateSlug}
                disabled={!canWrite || !title.trim()}
                className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.12em] text-[#8b2f2b] underline underline-offset-4 disabled:opacity-40"
              >
                <Sparkles size={13} />
                Gerar do título
              </button>
            </div>
            <input
              name="slug"
              disabled={!canWrite}
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 font-mono text-sm outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="exemplo-de-noticia-institucional"
            />
          </div>

          {/* Department, Category, Status Grid */}
          <div className="grid gap-5 md:grid-cols-3">
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Departamento</span>
              <select
                name="departamento_id"
                disabled={!canWrite}
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">COMIEADEPA (Geral)</option>
                {departments.map((dep) => (
                  <option key={dep.id} value={dep.id}>
                    {dep.nome}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Categoria</span>
              <select
                name="categoria_id"
                disabled={!canWrite}
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">Sem categoria</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Status Editorial</span>
              <select
                name="status"
                disabled={!canWrite}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 font-bold outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="rascunho">Rascunho</option>
                <option value="revisao">Em Revisão</option>
                {canPublish ? <option value="publicado">Publicado</option> : null}
                {canArchive ? <option value="arquivado">Arquivado</option> : null}
              </select>
            </label>
          </div>

          {/* Resumo */}
          <label className="grid gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Resumo / Linha Fina</span>
              <span className="text-xs text-[#5a472c]/60">{resumo.length} caracteres</span>
            </div>
            <textarea
              name="resumo"
              disabled={!canWrite}
              value={resumo}
              onChange={(e) => setResumo(e.target.value)}
              className="min-h-24 border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Breve síntese para apresentação em cards, feed de notícias, Google e redes sociais."
            />
          </label>

          {/* Rich Content Editor with live Preview tab */}
          <RichTextField
            name="conteudo"
            label="Conteúdo da Notícia"
            defaultValue={editingPost?.conteudo}
            placeholder="Escreva o texto completo da notícia, comunicado ou cobertura institucional..."
            disabled={!canWrite}
          />

          {/* Media and Publish Date */}
          <div className="grid gap-5 md:grid-cols-2">
            <MediaUrlField
              name="capa_url"
              label="Imagem de Capa (Destaque)"
              defaultValue={editingPost?.capa_url}
              assets={mediaAssets}
              helper="Recomendado: formato horizontal (16:9 ou 16:10) para cards e compartilhamentos."
              disabled={!canWrite}
            />

            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Data e Hora de Publicação</span>
              <span className="flex items-center gap-2 border border-[#d8c38b] bg-[#fffaf0] px-4 py-3">
                <CalendarDays size={18} className="text-[#8b2f2b]" />
                <input
                  name="publicado_em"
                  type="datetime-local"
                  disabled={!canWrite}
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  className="w-full bg-transparent outline-none disabled:cursor-not-allowed disabled:opacity-60"
                />
              </span>
              <span className="text-xs text-[#5a472c]/70">Deixe vazio para utilizar a data/hora atual ao publicar.</span>
            </label>
          </div>

          {/* Destaque na Home */}
          <label className="flex items-center gap-3 border border-[#d8c38b] bg-[#f7efd6] p-4 font-semibold text-[#342411]">
            <input
              name="destaque_home"
              type="checkbox"
              disabled={!canWrite}
              checked={destaqueHome}
              onChange={(e) => setDestaqueHome(e.target.checked)}
              className="h-5 w-5 accent-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
            />
            Destacar esta notícia na página inicial do portal
          </label>

          {/* Action Button Bar */}
          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#d8c38b]/40 pt-5">
            <button
              type="button"
              disabled={!canWrite || isSaving}
              onClick={() => handleSave(status === "publicado" ? "publicado" : "rascunho")}
              className="inline-flex items-center gap-2.5 bg-[#171006] px-6 py-3.5 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#2c2212] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin text-[#f4cf6a]" /> : <Save size={16} />}
              {editingPost ? "Salvar Alterações" : "Salvar Rascunho"}
            </button>

            {status !== "revisao" ? (
              <button
                type="button"
                disabled={!canWrite || isSaving}
                onClick={() => handleSave("revisao")}
                className="inline-flex items-center gap-2 border border-[#d8c38b] bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#5a472c] transition hover:bg-[#fffaf0] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send size={15} />
                Enviar p/ Revisão
              </button>
            ) : null}

            {canPublish && status !== "publicado" ? (
              <button
                type="button"
                disabled={!canWrite || isSaving}
                onClick={() => handleSave("publicado")}
                className="inline-flex items-center gap-2 bg-[#00a86b] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#00915c] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckCircle2 size={16} />
                Publicar Notícia
              </button>
            ) : null}

            {canArchive && status !== "arquivado" && editingPost ? (
              <button
                type="button"
                disabled={!canWrite || isSaving}
                onClick={() => handleSave("arquivado")}
                className="inline-flex items-center gap-2 border border-[#d8c38b]/60 bg-transparent px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-[#5a472c] transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Archive size={14} />
                Arquivar
              </button>
            ) : null}
          </div>
        </form>
      </section>

      {/* Editorial Queue Sidebar with Live Search & Pagination */}
      <aside className="h-fit border border-[#d8c38b] bg-[#171006] p-6 text-white shadow-[0_18px_50px_rgba(23,16,6,.14)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#f4cf6a]">Fila Editorial</p>
            <span className="text-xs text-white/50">{totalPosts} registro(s)</span>
          </div>

          <button
            type="button"
            onClick={handleNewArticle}
            className="inline-flex items-center gap-1.5 bg-[#f4cf6a] px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-[#171006] transition hover:bg-[#ffe599]"
          >
            <Plus size={13} />
            Novo
          </button>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="mt-4 flex items-center gap-2 border border-white/15 bg-white/10 px-3 py-2 text-sm">
          <Search size={16} className="text-[#f4cf6a]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs text-white placeholder:text-white/40 outline-none"
            placeholder="Buscar por título ou slug..."
          />
          {search ? (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                const statusParam = currentStatus !== "todos" ? "?status=" + encodeURIComponent(currentStatus) : "";
                router.push("/admin/noticias" + statusParam);
              }}
              className="text-white/50 hover:text-white"
            >
              <X size={14} />
            </button>
          ) : null}
        </form>

        {/* Filter Pills */}
        <div className="mt-4">
          <AdminFilterPills
            current={currentStatus}
            baseUrl="/admin/noticias"
            options={[
              { value: "todos", label: "Todos" },
              { value: "rascunho", label: "Rascunhos" },
              { value: "revisao", label: "Revisão" },
              { value: "publicado", label: "Publicados" },
              { value: "arquivado", label: "Arquivados" },
            ]}
          />
        </div>

        {/* Post List */}
        <div className="mt-6 grid gap-4">
          {posts.map((post) => {
            const isCurrent = editingPost?.id === post.id;
            return (
              <article
                key={post.id}
                className={`border p-4 transition ${
                  isCurrent
                    ? "border-[#f4cf6a] bg-white/15 shadow-md"
                    : "border-white/10 bg-white/[0.055] hover:border-white/25"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <AdminStatusBadge status={post.status} />
                  {post.destaque_home ? (
                    <span className="inline-flex bg-[#f4cf6a] px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-[#171006]">
                      Home
                    </span>
                  ) : null}
                </div>

                <h3 className="mt-3 font-serif text-lg font-black leading-snug text-white">
                  {post.titulo}
                </h3>

                <div className="mt-3 flex items-center justify-between text-xs text-white/50 font-mono">
                  <span className="truncate max-w-[160px]">{post.slug}</span>
                  <span>{formatDate(post.created_at)}</span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/10 pt-3">
                  <a
                    href={"/admin/noticias?edit=" + post.id}
                    className="inline-flex text-xs font-black uppercase tracking-[0.14em] text-[#f4cf6a] hover:underline"
                  >
                    Editar
                  </a>
                  <a
                    href={"/admin/preview/noticias/" + post.id}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex text-xs font-black uppercase tracking-[0.14em] text-white/70 transition hover:text-white"
                  >
                    Prévia
                  </a>
                  {post.status !== "publicado" && canPublish ? (
                    <form action="/api/admin/posts" method="post">
                      <input type="hidden" name="id" value={post.id} />
                      <input type="hidden" name="action" value="publish" />
                      <button
                        type="submit"
                        className="text-xs font-black uppercase tracking-[0.14em] text-[#00b67a] hover:underline"
                      >
                        Publicar
                      </button>
                    </form>
                  ) : null}
                  {post.status !== "arquivado" && canArchive ? (
                    <form action="/api/admin/posts" method="post">
                      <input type="hidden" name="id" value={post.id} />
                      <input type="hidden" name="action" value="archive" />
                      <button
                        type="submit"
                        className="text-xs font-black uppercase tracking-[0.14em] text-white/40 hover:text-white"
                      >
                        Arquivar
                      </button>
                    </form>
                  ) : null}
                </div>
              </article>
            );
          })}

          {posts.length === 0 ? (
            <div className="border border-white/10 bg-white/[0.055] p-6 text-center text-xs text-white/50">
              Nenhuma notícia encontrada com os filtros selecionados.
            </div>
          ) : null}
        </div>

        {/* Pagination controls */}
        {totalPages > 1 ? (
          <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs">
            <span className="text-white/50">
              Página {page} de {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <a
                href={page > 1 ? "/admin/noticias?page=" + (page - 1) + (currentStatus !== "todos" ? "&status=" + currentStatus : "") + (search ? "&q=" + encodeURIComponent(search) : "") : "#"}
                className={`grid h-8 w-8 place-items-center border border-white/20 ${
                  page > 1 ? "text-white hover:bg-white/10" : "pointer-events-none opacity-30 text-white/30"
                }`}
              >
                <ChevronLeft size={16} />
              </a>
              <a
                href={page < totalPages ? "/admin/noticias?page=" + (page + 1) + (currentStatus !== "todos" ? "&status=" + currentStatus : "") + (search ? "&q=" + encodeURIComponent(search) : "") : "#"}
                className={`grid h-8 w-8 place-items-center border border-white/20 ${
                  page < totalPages ? "text-white hover:bg-white/10" : "pointer-events-none opacity-30 text-white/30"
                }`}
              >
                <ChevronRight size={16} />
              </a>
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}

function formatDate(value: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(new Date(value));
}

function formatDateTimeLocal(value: string | null | undefined) {
  if (!value) return "";
  try {
    return new Date(value).toISOString().slice(0, 16);
  } catch {
    return "";
  }
}

