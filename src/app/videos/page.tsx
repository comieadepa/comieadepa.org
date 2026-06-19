import { ArrowRight, Play, Youtube } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { buildSeoMetadata } from "@/lib/seo";
import { selectPublicRows } from "@/lib/supabase-public";
import { PublicLayout } from "@/components/site/PublicLayout";

type CmsVideo = {
  id: string;
  titulo: string | null;
  youtube_id: string | null;
  youtube_url: string | null;
  thumbnail_url: string | null;
  tipo: string | null;
  departamento_id: string | null;
  destaque_home: boolean;
  created_at: string;
};

type CmsLookup = {
  id: string;
  nome: string | null;
};

type PortalVideo = {
  id: string;
  titulo: string;
  youtubeId: string;
  thumbnailUrl: string;
  tipo: string;
  department: string;
  destaqueHome: boolean;
};

export const metadata: Metadata = buildSeoMetadata({
  title: "Vídeos | COMIEADEPA",
  description: "Registros oficiais, shorts, transmissões e coberturas da COMIEADEPA.",
  path: "/videos",
});

export default async function VideosPage() {
  const [videos, departments] = await Promise.all([
    selectPublicRows<CmsVideo>(
      "cms_videos",
      "select=id,titulo,youtube_id,youtube_url,thumbnail_url,tipo,departamento_id,destaque_home,created_at&ativo=eq.true&order=ordem.asc.nullslast,created_at.desc&limit=24",
    ),
    selectPublicRows<CmsLookup>("cms_departamentos", "select=id,nome&ativo=eq.true&order=ordem.asc,nome.asc"),
  ]);
  const departmentMap = buildLookupMap(departments);
  const portalVideos = videos.map((video) => mapCmsVideo(video, departmentMap)).filter(Boolean) as PortalVideo[];
  const featuredVideo = portalVideos[0];
  const otherVideos = portalVideos.slice(1);

  return (
    <PublicLayout>
      <main className="min-h-screen bg-white text-[#1F2937]">
        <section className="relative overflow-hidden bg-[#0F3B63] py-20 text-white md:py-24">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,59,99,0.98)_0%,rgba(29,90,140,0.88)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(212,162,76,0.15),transparent_50%)]" />
          <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(135deg,#fff_1px,transparent_1px)] [background-size:38px_38px]" />

          <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
            <Link href="/" className="text-sm font-black uppercase tracking-[0.18em] text-[#F8D77B] transition hover:text-white">
              COMIEADEPA
            </Link>

            <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-[#F8D77B]">
                  <Youtube size={16} />
                  Vídeos
                </p>
                <h1 className="mt-4 font-serif text-5xl font-black leading-[1.04] text-white sm:text-7xl">Vídeos</h1>
              </div>
              <p className="text-lg leading-8 text-white/80 border-l border-white/20 pl-6 lg:border-l-2">
                Registros oficiais, shorts, transmissões e coberturas publicados pela equipe de mídia da COMIEADEPA.
              </p>
            </div>
          </div>
        </section>

      <section className="px-5 py-12 sm:px-8">
        <div className="mx-auto max-w-6xl">
          {featuredVideo ? (
            <a
              href={`https://www.youtube.com/watch?v=${featuredVideo.youtubeId}`}
              target="_blank"
              rel="noreferrer"
              className="group grid overflow-hidden rounded-xl border border-[#0F3B63]/10 bg-[#F4F6F8] shadow-[0_26px_80px_rgba(15,59,99,.12)] transition hover:-translate-y-1 hover:border-[#D4A24C]/70 hover:bg-white lg:grid-cols-[1.1fr_0.9fr]"
            >
              <VideoThumbnail video={featuredVideo} featured />
              <div className="flex flex-col justify-center p-7 sm:p-10">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-[#B8872D]">{featuredVideo.department}</span>
                <h2 className="mt-4 font-serif text-3xl font-black leading-tight text-[#0F3B63] sm:text-5xl">{featuredVideo.titulo}</h2>
                <p className="mt-6 max-w-xl text-base leading-7 text-[#6B7280]">
                  Conteúdo em destaque no canal oficial. Acompanhe a cobertura completa e compartilhe com sua igreja.
                </p>
                <span className="mt-8 inline-flex w-fit items-center gap-3 rounded-lg bg-[#0F3B63] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white">
                  Assistir agora <ArrowRight size={18} />
                </span>
              </div>
            </a>
          ) : (
            <div className="rounded-xl border border-[#0F3B63]/10 bg-[#F4F6F8] p-8 text-[#6B7280]">
              Nenhum vídeo publicado no momento. Assim que a equipe cadastrar vídeos ativos no painel, esta página será atualizada automaticamente.
            </div>
          )}

          {otherVideos.length ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {otherVideos.map((video) => (
                <a
                  key={video.id}
                  href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="group overflow-hidden rounded-xl border border-[#0F3B63]/10 bg-[#F4F6F8] shadow-[0_18px_50px_rgba(15,59,99,.10)] transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_24px_60px_rgba(15,59,99,.16)]"
                >
                  <VideoThumbnail video={video} />
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#B8872D]">{video.tipo}</span>
                      {video.destaqueHome ? <span className="rounded bg-[#D4A24C] px-2 py-1 text-[0.62rem] font-black uppercase tracking-[0.12em] text-white">Home</span> : null}
                    </div>
                    <h3 className="mt-3 font-serif text-2xl font-black leading-tight text-[#0F3B63]">{video.titulo}</h3>
                    <p className="mt-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#6B7280]">{video.department}</p>
                  </div>
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </section>
      </main>
    </PublicLayout>
  );
}

function VideoThumbnail({ video, featured = false }: { video: PortalVideo; featured?: boolean }) {
  return (
    <div className={`relative bg-[#0F3B63] ${featured ? "aspect-video lg:min-h-[420px]" : "aspect-video"}`}>
      <div
        className="absolute inset-0 bg-cover bg-center opacity-72 transition duration-500 group-hover:scale-105 group-hover:opacity-90"
        style={{ backgroundImage: `url(${video.thumbnailUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0F3B63]/72 via-transparent to-transparent" />
      <span className="absolute inset-0 grid place-items-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-[#ed1d24] text-white shadow-[0_18px_42px_rgba(0,0,0,.38)]">
          <Play size={24} fill="currentColor" />
        </span>
      </span>
      <span className="absolute left-4 top-4 rounded-md bg-[#0F3B63]/85 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.14em] text-[#F8D77B] backdrop-blur">
        {video.tipo}
      </span>
    </div>
  );
}

function buildLookupMap(rows: CmsLookup[]) {
  return new Map(rows.map((row) => [row.id, row.nome?.trim() ?? ""]));
}

function mapCmsVideo(video: CmsVideo, departmentMap: Map<string, string>) {
  const youtubeId = video.youtube_id || getYoutubeVideoId(video.youtube_url ?? "");

  if (!youtubeId) {
    return null;
  }

  return {
    id: video.id,
    titulo: video.titulo?.trim() || "Vídeo oficial",
    youtubeId,
    thumbnailUrl: video.thumbnail_url?.trim() || `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
    tipo: formatVideoType(video.tipo),
    department: departmentMap.get(video.departamento_id ?? "") || "COMIEADEPA",
    destaqueHome: video.destaque_home,
  };
}

function getYoutubeVideoId(url: string) {
  const patterns = [/youtu\.be\/([^?&/]+)/, /youtube\.com\/watch\?v=([^?&/]+)/, /youtube\.com\/shorts\/([^?&/]+)/, /youtube\.com\/embed\/([^?&/]+)/];
  const match = patterns.map((pattern) => url.match(pattern)?.[1]).find(Boolean);
  return match ?? null;
}

function formatVideoType(value: string | null) {
  const normalized = value?.toLowerCase();

  if (normalized === "shorts") {
    return "Shorts";
  }

  if (normalized === "live") {
    return "Live";
  }

  return "Vídeo";
}
