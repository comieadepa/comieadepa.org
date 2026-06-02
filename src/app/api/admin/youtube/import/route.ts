import {
  createAuditLog,
  hasSupabaseAdminConfig,
  insertSupabaseRow,
  missingSupabaseAdminResponse,
  redirectWithStatus,
  selectSupabaseRows,
} from "@/lib/supabase-admin";
import { canPerformAdminAction, resolveAdminRoleFromHeaders } from "@/lib/admin-permissions";

const youtubeApiKey = process.env.YOUTUBE_API_KEY;
const youtubePlaylistId = process.env.YOUTUBE_PLAYLIST_ID;

type YoutubePlaylistItem = {
  snippet?: {
    title?: string;
    resourceId?: {
      videoId?: string;
    };
    thumbnails?: {
      maxres?: { url?: string };
      high?: { url?: string };
      medium?: { url?: string };
      default?: { url?: string };
    };
    publishedAt?: string;
  };
};

type YoutubePlaylistResponse = {
  items?: YoutubePlaylistItem[];
};

type ExistingVideo = {
  youtube_id: string | null;
};

export async function POST(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const role = resolveAdminRoleFromHeaders(request.headers);
  if (!canPerformAdminAction(role, "videos", "create")) {
    return redirectWithStatus(request.url, "/admin/videos", "error", "Sem permissao para importar videos.");
  }

  if (!youtubeApiKey || !youtubePlaylistId) {
    return redirectWithStatus(request.url, "/admin/videos", "error", "A importação automática ainda não foi configurada.");
  }

  try {
    const items = await fetchYoutubePlaylistItems();
    const importedCandidates = items
      .map(mapYoutubeItemToVideo)
      .filter((video): video is NonNullable<ReturnType<typeof mapYoutubeItemToVideo>> => Boolean(video));

    if (importedCandidates.length === 0) {
      return redirectWithStatus(request.url, "/admin/videos", "success", "Nenhum vídeo encontrado na playlist.");
    }

    const existingVideos = await selectSupabaseRows<ExistingVideo>(
      "cms_videos",
      `select=youtube_id&youtube_id=in.(${importedCandidates.map((video) => video.youtube_id).join(",")})`,
    );
    const existingIds = new Set(existingVideos.map((video) => video.youtube_id).filter(Boolean));
    const newVideos = importedCandidates.filter((video) => !existingIds.has(video.youtube_id));

    for (const video of newVideos) {
      await insertSupabaseRow("cms_videos", video);
    }

    await createAuditLog({
      request,
      action: "import",
      entity: "video",
      entityTitle: "YouTube playlist",
      metadata: {
        playlist: youtubePlaylistId,
        encontrados: importedCandidates.length,
        importados: newVideos.length,
      },
    });

    return redirectWithStatus(request.url, "/admin/videos", "success", `Importação concluída: ${newVideos.length} novo(s) vídeo(s).`);
  } catch (error) {
    return redirectWithStatus(request.url, "/admin/videos", "error", error instanceof Error ? error.message : "Erro ao importar vídeos do YouTube.");
  }
}

async function fetchYoutubePlaylistItems() {
  const params = new URLSearchParams({
    key: youtubeApiKey ?? "",
    playlistId: youtubePlaylistId ?? "",
    part: "snippet",
    maxResults: "12",
  });
  const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${params.toString()}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `YouTube retornou ${response.status}.`);
  }

  const data = (await response.json()) as YoutubePlaylistResponse;
  return data.items ?? [];
}

function mapYoutubeItemToVideo(item: YoutubePlaylistItem) {
  const videoId = item.snippet?.resourceId?.videoId;
  const title = item.snippet?.title?.trim();

  if (!videoId || !title || title.toLowerCase() === "private video" || title.toLowerCase() === "deleted video") {
    return null;
  }

  return {
    titulo: title,
    youtube_url: `https://www.youtube.com/watch?v=${videoId}`,
    youtube_id: videoId,
    tipo: "video",
    thumbnail_url: item.snippet?.thumbnails?.maxres?.url ?? item.snippet?.thumbnails?.high?.url ?? item.snippet?.thumbnails?.medium?.url ?? item.snippet?.thumbnails?.default?.url ?? null,
    departamento_id: null,
    destaque_home: false,
    ativo: true,
    ordem: 0,
    publicado_em: item.snippet?.publishedAt ?? null,
    updated_at: new Date().toISOString(),
  };
}
