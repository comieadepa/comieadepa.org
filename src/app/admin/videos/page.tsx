import { videoSamples } from "@/lib/cms";
import { selectSupabaseRows } from "@/lib/supabase-admin";
import { DownloadCloud, Link2, Plus, Youtube } from "lucide-react";
import { MediaPickerAsset, MediaUrlField } from "../media-url-field";
import { StatusMessage } from "../status-message";
import { AdminFilterPills, AdminPageHeader, AdminStatusBadge } from "../admin-ui";

type CmsVideo = {
  id: string;
  titulo: string;
  tipo: string;
  youtube_url: string;
  youtube_id: string | null;
  thumbnail_url: string | null;
  departamento_id: string | null;
  destaque_home: boolean;
  ativo: boolean;
  ordem: number;
  created_at: string;
};

type CmsDepartmentOption = {
  id: string;
  nome: string;
};

export default async function AdminVideosPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string; message?: string; edit?: string; ativo?: string }>;
}) {
  const params = await searchParams;
  const activeFilter = params?.ativo ?? "todos";
  const activeQuery = activeFilter !== "todos" ? `&ativo=eq.${activeFilter === "ativos"}` : "";
  const [videos, mediaAssets, departments] = await Promise.all([
    selectSupabaseRows<CmsVideo>(
      "cms_videos",
      `select=id,titulo,tipo,youtube_url,youtube_id,thumbnail_url,departamento_id,destaque_home,ativo,ordem,created_at${activeQuery}&order=created_at.desc&limit=12`,
    ),
    selectSupabaseRows<MediaPickerAsset>("cms_media_assets", "select=id,titulo,arquivo_url,tipo,pasta&order=created_at.desc&limit=30"),
    selectSupabaseRows<CmsDepartmentOption>("cms_departamentos", "select=id,nome&ativo=eq.true&order=ordem.asc,nome.asc"),
  ]);
  const editingVideo = videos.find((video) => video.id === params?.edit);

  return (
    <div className="mx-auto max-w-7xl">
      <StatusMessage success={params?.success} error={params?.message ?? params?.error} />

      <AdminPageHeader
        icon={Youtube}
        eyebrow="Canal YouTube & Multimídia"
        title="Curadoria de vídeos para o portal"
        description="Cadastre transmissões, lives, shorts e pregações. Escolha os conteúdos que aparecem na página inicial e nas áreas temáticas da convenção."
        action={
          <form action="/api/admin/youtube/import" method="post">
            <button
              type="submit"
              className="inline-flex items-center gap-3 bg-[#ed1d24] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white shadow-sm transition hover:bg-[#c9181e]"
            >
              <DownloadCloud size={18} />
              Importar do YouTube
            </button>
          </form>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[450px_1fr]">
        <form
          action="/api/admin/videos"
          method="post"
          className="h-fit border border-[#d8c38b] bg-white/76 p-6 shadow-[0_18px_50px_rgba(23,16,6,.08)]"
        >
          <input type="hidden" name="id" value={editingVideo?.id ?? ""} />
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8b2f2b]">
              {editingVideo ? "Editar vídeo" : "Novo vídeo"}
            </p>
            {editingVideo ? (
              <a href="/admin/videos" className="text-sm font-semibold text-[#8b2f2b] underline underline-offset-4">
                Cancelar edição
              </a>
            ) : null}
          </div>

          <div className="mt-6 grid gap-5">
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Título</span>
              <input
                name="titulo"
                required
                defaultValue={editingVideo?.titulo}
                className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]"
                placeholder="Ex.: Palavra da presidência"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">URL do YouTube</span>
              <span className="flex items-center gap-2 border border-[#d8c38b] bg-[#fffaf0] px-4 py-3">
                <Link2 size={18} className="text-[#8b2f2b]" />
                <input
                  name="youtube_url"
                  required
                  defaultValue={editingVideo?.youtube_url}
                  className="w-full bg-transparent outline-none"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </span>
            </label>
            <div className="grid gap-5 md:grid-cols-3">
              <label className="grid gap-2">
                <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Tipo</span>
                <select
                  name="tipo"
                  defaultValue={editingVideo?.tipo ?? "video"}
                  className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]"
                >
                  <option value="video">Vídeo</option>
                  <option value="shorts">Shorts</option>
                  <option value="live">Live</option>
                </select>
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Departamento</span>
                <select
                  name="departamento_id"
                  defaultValue={editingVideo?.departamento_id ?? ""}
                  className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]"
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
                <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Ordem</span>
                <input
                  name="ordem"
                  type="number"
                  defaultValue={editingVideo?.ordem ?? 1}
                  className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]"
                  placeholder="1"
                />
              </label>
            </div>
            <MediaUrlField
              name="thumbnail_url"
              label="Thumbnail opcional"
              defaultValue={editingVideo?.thumbnail_url}
              assets={mediaAssets}
              helper="Use quando quiser substituir a miniatura automática do YouTube."
            />
            <label className="flex items-center gap-3 border border-[#d8c38b] bg-[#f7efd6] p-4 font-semibold text-[#342411]">
              <input
                name="destaque_home"
                type="checkbox"
                defaultChecked={editingVideo?.destaque_home}
                className="h-5 w-5 accent-[#8b2f2b]"
              />
              Exibir na página inicial
            </label>
            <button
              type="submit"
              className="inline-flex w-fit items-center gap-3 bg-[#171006] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white"
            >
              <Plus size={18} />
              {editingVideo ? "Atualizar vídeo" : "Adicionar vídeo"}
            </button>
          </div>
        </form>

        <section className="border border-[#d8c38b] bg-[#171006] p-6 text-white shadow-[0_18px_50px_rgba(23,16,6,.14)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#f4cf6a]">Acervo de Vídeos</p>
              <h2 className="mt-1 font-serif text-3xl font-black">Vídeos cadastrados</h2>
            </div>
            <AdminFilterPills
              current={activeFilter}
              baseUrl="/admin/videos"
              paramName="ativo"
              options={[
                { value: "todos", label: "Todos" },
                { value: "ativos", label: "Ativos" },
                { value: "inativos", label: "Inativos" },
              ]}
            />
          </div>

          <div className="mt-6 grid gap-4">
            {(videos.length > 0 ? videos : videoSamples).map((video) => (
              <article
                key={"id" in video ? video.id : video.title}
                className="flex flex-col gap-4 border border-white/10 bg-white/[0.055] p-5 sm:flex-row sm:items-center"
              >
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#ed1d24] text-white">
                  <Youtube size={26} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#f4cf6a]">
                      {"tipo" in video ? video.tipo : video.type}
                    </span>
                    <AdminStatusBadge status={"ativo" in video ? (video.ativo ? "ativo" : "inativo") : "ativo"} />
                    {"destaque_home" in video && video.destaque_home ? (
                      <span className="bg-[#f4cf6a] px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-[#171006]">
                        Home
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-2 font-serif text-xl font-black text-white">
                    {"titulo" in video ? video.titulo : video.title}
                  </h3>
                  <p className="mt-1 text-xs text-white/50">
                    {"youtube_id" in video && video.youtube_id ? `ID: ${video.youtube_id}` : ""}
                  </p>
                </div>
                {"id" in video ? (
                  <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-3 sm:border-0 sm:pt-0">
                    <a
                      href={`/admin/videos?edit=${video.id}`}
                      className="inline-flex text-xs font-black uppercase tracking-[0.14em] text-[#f4cf6a]"
                    >
                      Editar
                    </a>
                    <a
                      href={`/admin/preview/videos/${video.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex text-xs font-black uppercase tracking-[0.14em] text-white/70 transition hover:text-white"
                    >
                      Prévia
                    </a>
                    <form action="/api/admin/videos" method="post">
                      <input type="hidden" name="id" value={video.id} />
                      <input type="hidden" name="action" value={video.ativo ? "deactivate" : "activate"} />
                      <button
                        type="submit"
                        className="text-xs font-black uppercase tracking-[0.14em] text-white/50 transition hover:text-[#f4cf6a]"
                      >
                        {video.ativo ? "Desativar" : "Ativar"}
                      </button>
                    </form>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
