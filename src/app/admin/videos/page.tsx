import { videoSamples } from "@/lib/cms";
import { selectSupabaseRows } from "@/lib/supabase-admin";
import { DownloadCloud, Link2, Plus, Star, Youtube } from "lucide-react";
import { MediaPickerAsset, MediaUrlField } from "../media-url-field";
import { StatusMessage } from "../status-message";

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
      `select=id,titulo,tipo,youtube_url,youtube_id,thumbnail_url,departamento_id,destaque_home,ativo,ordem,created_at${activeQuery}&order=created_at.desc&limit=8`,
    ),
    selectSupabaseRows<MediaPickerAsset>("cms_media_assets", "select=id,titulo,arquivo_url,tipo,pasta&order=created_at.desc&limit=30"),
    selectSupabaseRows<CmsDepartmentOption>("cms_departamentos", "select=id,nome&ativo=eq.true&order=ordem.asc,nome.asc"),
  ]);
  const editingVideo = videos.find((video) => video.id === params?.edit);

  return (
    <div className="mx-auto max-w-7xl">
      <StatusMessage success={params?.success} error={params?.message ?? params?.error} />
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="border border-[#d8c38b] bg-[#171006] p-6 text-white">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#f4cf6a]">Canal YouTube</p>
          <h2 className="mt-4 font-serif text-4xl font-black leading-tight">Curadoria de vídeos para o portal.</h2>
          <p className="mt-5 leading-8 text-white/64">
            Cadastre shorts, lives, entrevistas e coberturas. A equipe escolhe o que aparece na home, no bloco de vídeos e nas páginas dos departamentos.
          </p>
          <div className="mt-8 grid gap-3">
            {["Cadastro manual de URL", "Destaque na home", "Vinculação a evento ou departamento", "Preparado para YouTube API"].map((item) => (
              <div key={item} className="flex items-center gap-3 border border-white/10 bg-white/[0.055] p-3">
                <Star size={17} className="text-[#f4cf6a]" />
                <span className="font-semibold">{item}</span>
              </div>
            ))}
          </div>
          <form action="/api/admin/youtube/import" method="post" className="mt-6">
            <button type="submit" className="inline-flex items-center gap-3 bg-[#ed1d24] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:-translate-y-0.5">
              <DownloadCloud size={18} />
              Importar do YouTube
            </button>
            <p className="mt-3 text-xs leading-5 text-white/48">Usa a playlist configurada em YOUTUBE_PLAYLIST_ID e ignora vídeos já cadastrados.</p>
          </form>
        </div>

        <form action="/api/admin/videos" method="post" className="border border-[#d8c38b] bg-white/76 p-6 shadow-[0_18px_50px_rgba(23,16,6,.08)]">
          <input type="hidden" name="id" value={editingVideo?.id ?? ""} />
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8b2f2b]">{editingVideo ? "Editar vídeo" : "Novo vídeo"}</p>
            {editingVideo ? (
              <a href="/admin/videos" className="text-sm font-semibold text-[#8b2f2b] underline underline-offset-4">
                Cancelar edição
              </a>
            ) : null}
          </div>
          <div className="mt-6 grid gap-5">
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Título</span>
              <input name="titulo" required defaultValue={editingVideo?.titulo} className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]" placeholder="Ex.: Palavra da presidência" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">URL do YouTube</span>
              <span className="flex items-center gap-2 border border-[#d8c38b] bg-[#fffaf0] px-4 py-3">
                <Link2 size={18} className="text-[#8b2f2b]" />
                <input name="youtube_url" required defaultValue={editingVideo?.youtube_url} className="w-full bg-transparent outline-none" placeholder="https://www.youtube.com/watch?v=..." />
              </span>
            </label>
            <div className="grid gap-5 md:grid-cols-3">
              <label className="grid gap-2">
                <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Tipo</span>
                <select name="tipo" defaultValue={editingVideo?.tipo ?? "video"} className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]">
                  <option value="video">Vídeo</option>
                  <option value="shorts">Shorts</option>
                  <option value="live">Live</option>
                </select>
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Departamento</span>
                <select name="departamento_id" defaultValue={editingVideo?.departamento_id ?? ""} className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]">
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
                <input name="ordem" type="number" defaultValue={editingVideo?.ordem} className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]" placeholder="1" />
              </label>
            </div>
            <MediaUrlField name="thumbnail_url" label="Thumbnail opcional" defaultValue={editingVideo?.thumbnail_url} assets={mediaAssets} helper="Use quando quiser substituir a miniatura automática do YouTube." />
            <label className="flex items-center gap-3 border border-[#d8c38b] bg-[#f7efd6] p-4 font-semibold text-[#342411]">
              <input name="destaque_home" type="checkbox" defaultChecked={editingVideo?.destaque_home} className="h-5 w-5 accent-[#8b2f2b]" />
              Exibir na página inicial
            </label>
            <button type="submit" className="inline-flex w-fit items-center gap-3 bg-[#171006] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white">
              <Plus size={18} />
              {editingVideo ? "Atualizar vídeo" : "Adicionar vídeo"}
            </button>
          </div>
        </form>
      </section>

      <section className="mt-6 grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2 flex flex-wrap gap-2">
          {[
            ["todos", "Todos"],
            ["ativos", "Ativos"],
            ["inativos", "Inativos"],
          ].map(([value, label]) => (
            <a
              key={value}
              href={value === "todos" ? "/admin/videos" : `/admin/videos?ativo=${value}`}
              className={`px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] transition ${
                activeFilter === value ? "bg-[#171006] text-[#f4cf6a]" : "border border-[#d8c38b] text-[#8b2f2b] hover:bg-white"
              }`}
            >
              {label}
            </a>
          ))}
        </div>
        {(videos.length > 0 ? videos : videoSamples).map((video) => (
          <article key={"id" in video ? video.id : video.title} className="flex items-center gap-5 border border-[#d8c38b] bg-white/70 p-5">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#ed1d24] text-white">
              <Youtube size={28} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#8b2f2b]">
                {"tipo" in video ? video.tipo : video.type} · {"youtube_id" in video ? video.youtube_id ?? "manual" : video.department}
              </p>
              <h3 className="mt-2 font-serif text-2xl font-black">{"titulo" in video ? video.titulo : video.title}</h3>
            </div>
            <span className="bg-[#f4cf6a] px-3 py-1 text-xs font-black uppercase tracking-[0.12em]">
              {"ativo" in video ? (video.ativo ? (video.destaque_home ? "Destaque" : "Ativo") : "Inativo") : "Destaque"}
            </span>
            {"youtube_id" in video ? (
              <div className="flex flex-col gap-2">
                <a href={`/admin/videos?edit=${video.id}`} className="text-xs font-black uppercase tracking-[0.14em] text-[#8b2f2b]">
                  Editar
                </a>
                <a href={`/admin/preview/videos/${video.id}`} target="_blank" rel="noreferrer" className="text-xs font-black uppercase tracking-[0.14em] text-[#8b2f2b]/70 transition hover:text-[#8b2f2b]">
                  Prévia
                </a>
                <form action="/api/admin/videos" method="post">
                  <input type="hidden" name="id" value={video.id} />
                  <input type="hidden" name="action" value={video.ativo ? "deactivate" : "activate"} />
                  <button type="submit" className="text-xs font-black uppercase tracking-[0.14em] text-[#8b2f2b]/70 transition hover:text-[#8b2f2b]">
                    {video.ativo ? "Desativar" : "Ativar"}
                  </button>
                </form>
              </div>
            ) : null}
          </article>
        ))}
      </section>
    </div>
  );
}
