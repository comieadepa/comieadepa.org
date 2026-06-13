import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { findFallbackDepartment } from "@/lib/department-content";
import { buildSeoMetadata } from "@/lib/seo";
import { selectPublicRows } from "@/lib/supabase-public";
import type { DepartmentLink, DepartmentRelatedVideo } from "../department-page-view";
import { DepartmentPageView } from "../department-page-view";
import { PublicLayout } from "@/components/site/PublicLayout";

type CmsDepartment = {
  id: string;
  slug: string;
  nome: string;
  titulo: string | null;
  resumo: string | null;
  conteudo: string | null;
  logo_url: string | null;
  banner_url: string | null;
  contato_nome: string | null;
  contato_whatsapp: string | null;
  redes_sociais: unknown;
  documentos: unknown;
};

type CmsPost = {
  id: string;
  titulo: string;
  slug: string;
  resumo: string | null;
  publicado_em: string | null;
  created_at: string;
};

type CmsVideo = {
  id: string;
  titulo: string | null;
  youtube_id: string | null;
  youtube_url: string | null;
  tipo: string | null;
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const rows = await selectPublicRows<CmsDepartment>(
    "cms_departamentos",
    `select=id,slug,nome,titulo,resumo,conteudo,logo_url,banner_url,contato_nome,contato_whatsapp,redes_sociais,documentos&ativo=eq.true&slug=eq.${encodeURIComponent(slug)}&limit=1`,
  );
  const fallback = findFallbackDepartment(slug);
  const department = rows[0];

  if (!department && !fallback) {
    return buildSeoMetadata({
      title: "Departamento não encontrado | COMIEADEPA",
      description: "A página solicitada não está disponível no portal institucional da COMIEADEPA.",
      path: `/departamentos/${slug}`,
    });
  }

  return buildSeoMetadata({
    title: `${department?.nome ?? fallback?.nome} | COMIEADEPA`,
    description: department?.resumo ?? fallback?.resumo ?? "Página institucional dos departamentos da COMIEADEPA.",
    path: `/departamentos/${department?.slug ?? fallback?.slug ?? slug}`,
    image: department?.banner_url ?? department?.logo_url,
  });
}

export default async function DepartmentPage({ params }: PageProps) {
  const { slug } = await params;
  const rows = await selectPublicRows<CmsDepartment>(
    "cms_departamentos",
    `select=id,slug,nome,titulo,resumo,conteudo,logo_url,banner_url,contato_nome,contato_whatsapp,redes_sociais,documentos&ativo=eq.true&slug=eq.${encodeURIComponent(slug)}&limit=1`,
  );
  const fallback = findFallbackDepartment(slug);
  const cmsDepartment = rows[0];
  const relatedContent = cmsDepartment ? await loadRelatedDepartmentContent(cmsDepartment.id) : { relatedPosts: [], relatedVideos: [] };
  const department = cmsDepartment
    ? {
        nome: cmsDepartment.nome,
        titulo: cmsDepartment.titulo ?? cmsDepartment.nome,
        resumo: cmsDepartment.resumo ?? fallback?.resumo ?? "",
        conteudo: cmsDepartment.conteudo ?? fallback?.conteudo ?? "",
        bannerUrl: cmsDepartment.banner_url,
        contactName: cmsDepartment.contato_nome,
        contactWhatsapp: cmsDepartment.contato_whatsapp,
        socialLinks: normalizeDepartmentLinks(cmsDepartment.redes_sociais),
        documentLinks: normalizeDepartmentLinks(cmsDepartment.documentos),
        ...relatedContent,
      }
    : fallback
      ? {
          nome: fallback.nome,
          titulo: fallback.titulo,
          resumo: fallback.resumo,
          conteudo: fallback.conteudo,
          bannerUrl: null,
          contactName: null,
          contactWhatsapp: null,
          socialLinks: [],
          documentLinks: [],
        }
      : null;

  if (!department) {
    notFound();
  }

  return (
    <PublicLayout>
      <DepartmentPageView department={department} />
    </PublicLayout>
  );
}

async function loadRelatedDepartmentContent(departmentId: string) {
  const [posts, videos] = await Promise.all([
    selectPublicRows<CmsPost>(
      "cms_posts",
      `select=id,titulo,slug,resumo,publicado_em,created_at&status=eq.publicado&departamento_id=eq.${encodeURIComponent(departmentId)}${getPublishedPostsPublicFilter()}&order=publicado_em.desc.nullslast,created_at.desc&limit=3`,
    ),
    selectPublicRows<CmsVideo>(
      "cms_videos",
      `select=id,titulo,youtube_id,youtube_url,tipo&ativo=eq.true&departamento_id=eq.${encodeURIComponent(departmentId)}&order=ordem.asc.nullslast,created_at.desc&limit=4`,
    ),
  ]);

  return {
    relatedPosts: posts.map((post) => ({
      id: post.id,
      titulo: post.titulo,
      slug: post.slug,
      resumo: post.resumo,
      publicadoEm: post.publicado_em ?? post.created_at,
    })),
    relatedVideos: videos
      .map((video) => {
        const youtubeId = video.youtube_id || getYoutubeVideoId(video.youtube_url ?? "");

        if (!youtubeId) {
          return null;
        }

        return {
          id: video.id,
          titulo: video.titulo?.trim() || "Vídeo oficial",
          youtubeId,
          tipo: formatVideoType(video.tipo),
        };
      })
      .filter((video): video is DepartmentRelatedVideo => Boolean(video)),
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

function getPublishedPostsPublicFilter() {
  return `&or=(publicado_em.is.null,publicado_em.lte.${encodeURIComponent(new Date().toISOString())})`;
}

function normalizeDepartmentLinks(value: unknown): DepartmentLink[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const record = item as Record<string, unknown>;
      const label = typeof record.label === "string" ? record.label.trim() : "";
      const url = typeof record.url === "string" ? record.url.trim() : "";

      if (!label || !url) {
        return null;
      }

      return { label, url };
    })
    .filter((item): item is DepartmentLink => Boolean(item));
}
