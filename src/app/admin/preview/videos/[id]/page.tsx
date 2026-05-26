import { ArrowLeft, ExternalLink, Play, Youtube } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { selectSupabaseRows } from "@/lib/supabase-admin";

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

type CmsDepartment = {
  id: string;
  nome: string;
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminVideoPreviewPage({ params }: PageProps) {
  const { id } = await params;
  const videos = await selectSupabaseRows<CmsVideo>(
    "cms_videos",
    `select=id,titulo,tipo,youtube_url,youtube_id,thumbnail_url,departamento_id,destaque_home,ativo,ordem,created_at&id=eq.${encodeURIComponent(id)}&limit=1`,
  );
  const video = videos[0];

  if (!video) {
    notFound();
  }

  const departments = video.departamento_id
    ? await selectSupabaseRows<CmsDepartment>("cms_departamentos", `select=id,nome&id=eq.${encodeURIComponent(video.departamento_id)}&limit=1`)
    : [];
  const youtubeId = video.youtube_id || getYoutubeVideoId(video.youtube_url);
  const thumbnailUrl = video.thumbnail_url || (youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : "/assets/sede-aerea-comieadepa.jpg");
  const departmentName = departments[0]?.nome ?? "COMIEADEPA";

  return (
    <main className="min-h-screen bg-[#120f0a] text-[#fff7e5]">
      <div className="bg-[#f4cf6a] px-5 py-3 text-center text-xs font-black uppercase tracking-[0.16em] text-[#171006]">
        Prévia administrativa
      </div>
      <section className="px-5 py-12 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <Link href="/admin/videos" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-[#f4cf6a] transition hover:text-white">
            <ArrowLeft size={18} />
            Voltar aos vídeos
          </Link>

          <div className="mt-10 grid overflow-hidden border border-[#d8b85f]/35 bg-white/[0.055] shadow-[0_26px_80px_rgba(0,0,0,.28)] lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative aspect-video bg-[#171006] lg:min-h-[420px]">
              {youtubeId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title={video.titulo}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <>
                  <div className="absolute inset-0 bg-cover bg-center opacity-70" style={{ backgroundImage: `url(${thumbnailUrl})` }} />
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="grid h-16 w-16 place-items-center rounded-full bg-[#ed1d24] text-white">
                      <Play size={24} fill="currentColor" />
                    </span>
                  </span>
                </>
              )}
            </div>
            <div className="flex flex-col justify-center p-7 sm:p-10">
              <p className="inline-flex w-fit items-center gap-2 bg-[#ed1d24]/20 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#ff676d]">
                <Youtube size={15} />
                {formatVideoType(video.tipo)}
              </p>
              <h1 className="mt-5 font-serif text-4xl font-black leading-tight text-white sm:text-5xl">{video.titulo}</h1>
              <div className="mt-6 grid gap-3 text-sm text-white/62">
                <p>
                  <strong className="text-white">Departamento:</strong> {departmentName}
                </p>
                <p>
                  <strong className="text-white">Status:</strong> {video.ativo ? "Ativo" : "Inativo"} {video.destaque_home ? "· Destaque na home" : ""}
                </p>
                <p>
                  <strong className="text-white">Ordem:</strong> {video.ordem}
                </p>
              </div>
              <a
                href={video.youtube_url}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex w-fit items-center gap-3 bg-[#f4cf6a] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#171006]"
              >
                Abrir no YouTube <ExternalLink size={18} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
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
