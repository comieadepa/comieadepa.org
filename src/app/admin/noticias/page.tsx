import { postSamples, postStatuses } from "@/lib/cms";
import { selectSupabaseRows } from "@/lib/supabase-admin";
import { canPerformAdminAction, normalizeAdminRole } from "@/lib/admin-permissions";
import { CalendarDays, Save } from "lucide-react";
import { MediaPickerAsset, MediaUrlField } from "../media-url-field";
import { RichTextField } from "../rich-text-field";
import { StatusMessage } from "../status-message";
import { headers } from "next/headers";

type CmsPost = {
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

type CmsCategory = {
  id: string;
  nome: string;
};

type CmsDepartmentOption = {
  id: string;
  nome: string;
};

export default async function AdminNewsPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string; message?: string; edit?: string; status?: string }>;
}) {
  const params = await searchParams;
  const headerList = await headers();
  const role = normalizeAdminRole(headerList.get("x-admin-role"));
  const canCreate = canPerformAdminAction(role, "noticias", "create");
  const canUpdate = canPerformAdminAction(role, "noticias", "update");
  const canPublish = canPerformAdminAction(role, "noticias", "publish");
  const canArchive = canPerformAdminAction(role, "noticias", "archive");
  const statusFilter = params?.status ?? "todos";
  const statusQuery = statusFilter !== "todos" ? `&status=eq.${encodeURIComponent(statusFilter)}` : "";
  const [posts, mediaAssets, categories, departments] = await Promise.all([
    selectSupabaseRows<CmsPost>(
      "cms_posts",
      `select=id,titulo,slug,status,categoria_id,departamento_id,resumo,conteudo,capa_url,destaque_home,publicado_em,created_at${statusQuery}&order=created_at.desc&limit=8`,
    ),
    selectSupabaseRows<MediaPickerAsset>("cms_media_assets", "select=id,titulo,arquivo_url,tipo,pasta&order=created_at.desc&limit=30"),
    selectSupabaseRows<CmsCategory>("cms_categorias", "select=id,nome&order=nome.asc"),
    selectSupabaseRows<CmsDepartmentOption>("cms_departamentos", "select=id,nome&ativo=eq.true&order=ordem.asc,nome.asc"),
  ]);
  const editingPost = posts.find((post) => post.id === params?.edit);
  const canWrite = editingPost ? canUpdate : canCreate;

  return (
    <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[1fr_380px]">
      <section className="border border-[#d8c38b] bg-white/76 p-6 shadow-[0_18px_50px_rgba(23,16,6,.08)]">
        <StatusMessage success={params?.success} error={params?.message ?? params?.error} />
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8b2f2b]">Notícias e Blog</p>
        <h2 className="mt-3 font-serif text-4xl font-black">{editingPost ? "Editar publicação institucional" : "Nova publicação institucional"}</h2>
        <p className="mt-3 max-w-3xl leading-7 text-[#5a472c]">
          Estrutura preparada para comunicados oficiais, coberturas, artigos e notícias vinculadas aos departamentos da convenção.
        </p>
        {editingPost ? (
          <div className="mt-5 flex flex-wrap items-center gap-3 border border-[#d8c38b] bg-[#f7efd6] p-4 text-sm font-semibold text-[#5a472c]">
            Editando: <span className="font-black text-[#171006]">{editingPost.titulo}</span>
            <a href="/admin/noticias" className="ml-auto text-[#8b2f2b] underline underline-offset-4">
              Cancelar edição
            </a>
          </div>
        ) : null}

        <form action="/api/admin/posts" method="post" className="mt-8 grid gap-5">
          <input type="hidden" name="id" value={editingPost?.id ?? ""} />
          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Título</span>
            <input
              name="titulo"
              required
              disabled={!canWrite}
              defaultValue={editingPost?.titulo}
              className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Ex.: COMIEADEPA realiza encontro regional..."
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Slug</span>
            <input
              name="slug"
              disabled={!canWrite}
              defaultValue={editingPost?.slug}
              className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="gerado pelo título se ficar vazio"
            />
          </label>

          <div className="grid gap-5 md:grid-cols-3">
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Departamento</span>
              <select
                name="departamento_id"
                disabled={!canWrite}
                defaultValue={editingPost?.departamento_id ?? ""}
                className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">COMIEADEPA</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.nome}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Categoria</span>
              <select
                name="categoria_id"
                disabled={!canWrite}
                defaultValue={editingPost?.categoria_id ?? ""}
                className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">Sem categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.nome}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Status</span>
              <select
                name="status"
                disabled={!canWrite}
                defaultValue={formatPostStatusLabel(editingPost?.status)}
                className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {postStatuses.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Resumo</span>
            <textarea
              name="resumo"
              disabled={!canWrite}
              defaultValue={editingPost?.resumo ?? ""}
              className="min-h-28 border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Resumo para cards, SEO e chamadas da home."
            />
          </label>

          <RichTextField
            name="conteudo"
            label="Conteúdo"
            defaultValue={editingPost?.conteudo}
            placeholder="Texto completo da notícia, comunicado ou cobertura institucional."
            disabled={!canWrite}
          />

          <div className="grid gap-5 md:grid-cols-2">
            <MediaUrlField
              name="capa_url"
              label="URL da capa"
              defaultValue={editingPost?.capa_url}
              assets={mediaAssets}
              helper="Use uma imagem horizontal para melhor resultado nos cards e compartilhamentos."
              disabled={!canWrite}
            />
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Publicar em</span>
              <span className="flex items-center gap-2 border border-[#d8c38b] bg-[#fffaf0] px-4 py-3">
                <CalendarDays size={18} className="text-[#8b2f2b]" />
                <input
                  name="publicado_em"
                  type="datetime-local"
                  disabled={!canWrite}
                  defaultValue={formatDateTimeLocal(editingPost?.publicado_em)}
                  className="w-full bg-transparent outline-none disabled:cursor-not-allowed disabled:opacity-60"
                />
              </span>
            </label>
          </div>

          <label className="flex items-center gap-3 border border-[#d8c38b] bg-[#f7efd6] p-4 font-semibold text-[#342411]">
            <input
              name="destaque_home"
              type="checkbox"
              disabled={!canWrite}
              defaultChecked={editingPost?.destaque_home}
              className="h-5 w-5 accent-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
            />
            Destacar na página inicial
          </label>

          <button
            type="submit"
            disabled={!canWrite}
            className="inline-flex w-fit items-center gap-3 bg-[#171006] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={18} />
            {editingPost ? "Atualizar publicação" : "Salvar rascunho"}
          </button>
        </form>
      </section>

      <aside className="border border-[#d8c38b] bg-[#171006] p-6 text-white shadow-[0_18px_50px_rgba(23,16,6,.14)]">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#f4cf6a]">Fila editorial</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {[
            ["todos", "Todos"],
            ["rascunho", "Rascunhos"],
            ["revisao", "Revisão"],
            ["publicado", "Publicados"],
            ["arquivado", "Arquivados"],
          ].map(([value, label]) => (
            <a
              key={value}
              href={value === "todos" ? "/admin/noticias" : `/admin/noticias?status=${value}`}
              className={`px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] transition ${
                statusFilter === value ? "bg-[#f4cf6a] text-[#171006]" : "border border-white/10 text-white/54 hover:border-[#f4cf6a] hover:text-[#f4cf6a]"
              }`}
            >
              {label}
            </a>
          ))}
        </div>
        <div className="mt-6 grid gap-4">
          {(posts.length > 0 ? posts : postSamples).map((post) => (
            <article key={"id" in post ? post.id : post.title} className="border border-white/10 bg-white/[0.055] p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#f4cf6a]">{"slug" in post ? post.status : post.department}</p>
              {"slug" in post && post.destaque_home ? (
                <span className="mt-3 inline-flex bg-[#f4cf6a] px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#171006]">
                  Destaque na home
                </span>
              ) : null}
              <h3 className="mt-2 font-serif text-2xl font-black">{"titulo" in post ? post.titulo : post.title}</h3>
              <div className="mt-4 flex items-center justify-between text-sm text-white/58">
                <span>{"slug" in post ? post.slug : post.status}</span>
                <span>{"created_at" in post ? formatDate(post.created_at) : post.date}</span>
              </div>
              {"slug" in post ? (
                <div className="mt-4 flex flex-wrap gap-3">
                  <a href={`/admin/noticias?edit=${post.id}`} className="inline-flex text-xs font-black uppercase tracking-[0.14em] text-[#f4cf6a]">
                    Editar
                  </a>
                  <a href={`/admin/preview/noticias/${post.id}`} target="_blank" rel="noreferrer" className="inline-flex text-xs font-black uppercase tracking-[0.14em] text-white/72 transition hover:text-[#f4cf6a]">
                    Prévia
                  </a>
                  {post.status !== "publicado" && canPublish ? (
                    <form action="/api/admin/posts" method="post">
                      <input type="hidden" name="id" value={post.id} />
                      <input type="hidden" name="action" value="publish" />
                      <button type="submit" className="text-xs font-black uppercase tracking-[0.14em] text-white/72 transition hover:text-[#f4cf6a]">
                        Publicar
                      </button>
                    </form>
                  ) : null}
                  {post.status !== "arquivado" && canArchive ? (
                    <form action="/api/admin/posts" method="post">
                      <input type="hidden" name="id" value={post.id} />
                      <input type="hidden" name="action" value="archive" />
                      <button type="submit" className="text-xs font-black uppercase tracking-[0.14em] text-white/50 transition hover:text-[#f4cf6a]">
                        Arquivar
                      </button>
                    </form>
                  ) : null}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </aside>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(new Date(value));
}

function formatPostStatusLabel(value: string | undefined) {
  if (value === "publicado") {
    return "Publicado";
  }

  if (value === "revisao") {
    return "Em revisão";
  }

  if (value === "agendado") {
    return "Agendado";
  }

  if (value === "arquivado") {
    return "Arquivado";
  }

  return "Rascunho";
}

function formatDateTimeLocal(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 16);
}
