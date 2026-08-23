import { headers } from "next/headers";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Camera,
  CheckCircle2,
  ExternalLink,
  FileText,
  Film,
  Image as ImageIcon,
  LayoutDashboard,
  MapPin,
  Plus,
} from "lucide-react";
import { countSupabaseRows, selectSupabaseRows } from "@/lib/supabase-admin";
import { canAccessAdminPath, canPerformAdminAction, normalizeAdminRole } from "@/lib/admin-permissions";
import { AdminEmptyState, AdminPageHeader, AdminStatusBadge } from "./admin-ui";

type RecentPost = {
  id: string;
  titulo: string;
  slug: string;
  status: string;
  publicado_em: string | null;
  updated_at: string;
};

type UpcomingEvent = {
  id: string;
  nome: string;
  slug: string;
  data_inicio: string;
  data_fim: string | null;
  local: string | null;
  cidade: string | null;
  status: string | null;
};

export default async function AdminDashboardPage() {
  const headerList = await headers();
  const role = normalizeAdminRole(headerList.get("x-admin-role"));

  const visiblePublishedPostsQuery = `select=id&status=eq.publicado&or=(publicado_em.is.null,publicado_em.lte.${encodeURIComponent(new Date().toISOString())})`;

  // Lightweight queries in parallel
  const [
    publishedPostsCount,
    draftPostsCount,
    reviewPostsCount,
    activeVideosCount,
    mediaAssetsCount,
    openEventsCount,
    pendingPosts,
    recentPosts,
    upcomingEvents,
  ] = await Promise.all([
    countSupabaseRows("cms_posts", visiblePublishedPostsQuery),
    countSupabaseRows("cms_posts", "select=id&status=eq.rascunho"),
    countSupabaseRows("cms_posts", "select=id&status=eq.revisao"),
    countSupabaseRows("cms_videos", "select=id&ativo=eq.true"),
    countSupabaseRows("cms_media_assets", "select=id"),
    countSupabaseRows("eventos", "select=id&status=eq.programado"),
    selectSupabaseRows<RecentPost>(
      "cms_posts",
      "select=id,titulo,slug,status,publicado_em,updated_at&status=in.(rascunho,revisao,agendado)&order=updated_at.desc&limit=5",
    ),
    selectSupabaseRows<RecentPost>(
      "cms_posts",
      "select=id,titulo,slug,status,publicado_em,updated_at&status=eq.publicado&order=updated_at.desc&limit=5",
    ),
    selectSupabaseRows<UpcomingEvent>(
      "eventos",
      "select=id,nome,slug,data_inicio,data_fim,local,cidade,status&status=eq.programado&order=data_inicio.asc&limit=4",
    ),
  ]);

  // Permissions for Quick Actions and Module Links
  const canAccessNews = canAccessAdminPath("/admin/noticias", role);
  const canAccessVideos = canAccessAdminPath("/admin/videos", role);
  const canAccessMedia = canAccessAdminPath("/admin/midia", role);

  const canCreateNews = canPerformAdminAction(role, "noticias", "create");
  const canCreateGalleries = canPerformAdminAction(role, "galerias", "create");
  const canCreateVideos = canPerformAdminAction(role, "videos", "create");

  const kpiStats = [
    {
      label: "Notícias",
      value: String(publishedPostsCount),
      detail: "Notícias ativas no portal",
      icon: FileText,
      href: "/admin/noticias",
      canAccess: canAccessNews,
    },
    {
      label: "Vídeos",
      value: String(activeVideosCount),
      detail: "Vídeos ativos no portal",
      icon: Film,
      href: "/admin/videos",
      canAccess: canAccessVideos,
    },
    {
      label: "Biblioteca de Mídia",
      value: String(mediaAssetsCount),
      detail: "Arquivos e fotos no acervo",
      icon: ImageIcon,
      href: "/admin/midia",
      canAccess: canAccessMedia,
    },
    {
      label: "Eventos",
      value: String(openEventsCount),
      detail: "Eventos na agenda oficial",
      icon: Calendar,
      href: "",
      canAccess: false,
      readOnlyLabel: "Lido do CRM oficial",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      {/* 1. Header com Ações Integradas */}
      <AdminPageHeader
        icon={LayoutDashboard}
        eyebrow="CENTRAL EDITORIAL"
        title="Painel de controle"
        description="Visão geral do conteúdo, fluxo de redação, pendências editoriais e atualizações do portal da COMIEADEPA."
        action={
          <div className="flex flex-wrap items-center gap-2">
            {canCreateNews ? (
              <Link
                href="/admin/noticias"
                className="inline-flex items-center gap-1.5 bg-[#171006] px-3.5 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#f4cf6a] transition hover:bg-[#2c2212]"
              >
                <Plus size={14} />
                Nova notícia
              </Link>
            ) : null}
            {canCreateGalleries ? (
              <Link
                href="/admin/galerias"
                className="inline-flex items-center gap-1.5 border border-[#8b2f2b]/40 bg-[#f7efd6] px-3.5 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#8b2f2b] transition hover:bg-[#8b2f2b] hover:text-white"
              >
                <Camera size={14} />
                Nova galeria
              </Link>
            ) : null}
            {canCreateVideos ? (
              <Link
                href="/admin/videos"
                className="inline-flex items-center gap-1.5 border border-[#8b2f2b]/40 bg-[#f7efd6] px-3.5 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#8b2f2b] transition hover:bg-[#8b2f2b] hover:text-white"
              >
                <Film size={14} />
                Novo vídeo
              </Link>
            ) : null}
          </div>
        }
      />

      {/* 2. KPIs de Volume */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiStats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col justify-between border border-[#d8c38b] bg-[#171006] p-5 md:p-4 lg:p-5 text-white shadow-[0_18px_50px_rgba(23,16,6,.12)]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-[#f4cf6a] truncate">{stat.label}</span>
              <stat.icon size={18} className="text-[#f4cf6a]/70 shrink-0" />
            </div>
            <div className="my-3.5">
              <p className="font-serif text-3xl sm:text-4xl font-black text-white">{stat.value}</p>
              <p className="mt-1 text-xs text-white/55 truncate">{stat.detail}</p>
            </div>
            {stat.canAccess ? (
              <Link
                href={stat.href}
                className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#f4cf6a] hover:underline"
              >
                Acessar módulo
                <ArrowRight size={12} />
              </Link>
            ) : (
              <span className="text-[10px] text-white/40">{stat.readOnlyLabel || "Acesso restrito"}</span>
            )}
          </div>
        ))}
      </section>

      {/* 3. Fluxo Editorial (Pipeline) */}
      <section className="mt-8 border border-[#d8c38b] bg-white/76 p-6 shadow-[0_18px_50px_rgba(23,16,6,.06)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8b2f2b]">Fluxo Editorial</p>
            <h2 className="mt-1 font-serif text-2xl font-black text-[#171006]">Pipeline de Publicação</h2>
          </div>
          <span className="text-xs text-[#5a472c] hidden sm:inline">Visão consolidada da esteira de conteúdos</span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="flex gap-3.5 border border-[#ead9a6] bg-[#f7efd6] p-4 md:p-3.5 lg:p-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#171006] text-xs font-black text-[#f4cf6a]">
              01
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg lg:text-xl font-black text-[#171006]">Rascunho</h3>
                <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                  {draftPostsCount}
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-[#5a472c]">
                Conteúdos em criação pela equipe de mídia e redação.
              </p>
            </div>
          </div>

          <div className="flex gap-3.5 border border-[#ead9a6] bg-[#f7efd6] p-4 md:p-3.5 lg:p-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#171006] text-xs font-black text-[#f4cf6a]">
              02
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg lg:text-xl font-black text-[#171006]">Revisão</h3>
                <span className="rounded-full bg-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-900">
                  {reviewPostsCount}
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-[#5a472c]">
                Validação de texto, imagens e alinhamento institucional.
              </p>
            </div>
          </div>

          <div className="flex gap-3.5 border border-[#ead9a6] bg-[#f7efd6] p-4 md:p-3.5 lg:p-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#171006] text-xs font-black text-[#f4cf6a]">
              03
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg lg:text-xl font-black text-[#171006]">Publicado</h3>
                <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-900">
                  {publishedPostsCount}
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-[#5a472c]">
                Conteúdo online e indexado no portal público.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Atenção Editorial (Pendências) */}
      <section className="mt-8 border border-[#d8c38b] bg-white/76 p-6 shadow-[0_18px_50px_rgba(23,16,6,.06)]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertCircle size={20} className="text-[#8b2f2b]" />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8b2f2b]">Atenção Editorial</p>
              <h2 className="font-serif text-2xl font-black text-[#171006]">Pendências e Conteúdos em Aberto</h2>
            </div>
          </div>
          {canAccessNews ? (
            <Link
              href="/admin/noticias?status=revisao"
              className="text-xs font-bold text-[#8b2f2b] underline underline-offset-4 hover:opacity-80"
            >
              Ver todas as pendências
            </Link>
          ) : null}
        </div>

        {pendingPosts.length > 0 ? (
          <div className="mt-5 divide-y divide-[#ead9a6] border border-[#ead9a6] bg-white">
            {pendingPosts.map((post) => (
              <div
                key={post.id}
                className="flex flex-col gap-2 p-4 transition hover:bg-[#fffaf0] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <AdminStatusBadge status={post.status} />
                    <span className="text-[11px] text-[#5a472c]/70">
                      Atualizado em {formatDate(post.updated_at)}
                    </span>
                  </div>
                  <h3 className="mt-1 font-serif text-base font-bold text-[#171006] line-clamp-1">{post.titulo}</h3>
                </div>
                {canAccessNews ? (
                  <Link
                    href={`/admin/noticias?edit=${post.id}`}
                    className="inline-flex shrink-0 items-center gap-1 text-xs font-black uppercase tracking-[0.12em] text-[#8b2f2b] hover:underline"
                  >
                    Editar
                    <ArrowRight size={12} />
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 flex items-center gap-3 border border-[#00b67a]/30 bg-[#e8fff4] p-5 text-sm font-semibold text-[#075f3f]">
            <CheckCircle2 size={20} className="text-[#00b67a]" />
            <span>Tudo em dia na redação! Não há conteúdos pendentes de revisão no momento.</span>
          </div>
        )}
      </section>

      {/* 5 & 6. Publicações Recentes & Próximos Eventos */}
      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* 5. Publicações Recentes */}
        <div className="border border-[#d8c38b] bg-white/76 p-6 shadow-[0_18px_50px_rgba(23,16,6,.06)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8b2f2b]">Últimas Notícias</p>
              <h2 className="mt-1 font-serif text-xl font-black text-[#171006]">Publicações Recentes</h2>
            </div>
            {canAccessNews ? (
              <Link
                href="/admin/noticias"
                className="text-xs font-bold text-[#8b2f2b] underline underline-offset-4 hover:opacity-80"
              >
                Ver todas
              </Link>
            ) : null}
          </div>

          <div className="mt-4 divide-y divide-[#ead9a6] border border-[#ead9a6] bg-white">
            {recentPosts.map((post) => (
              <div
                key={post.id}
                className="flex flex-col gap-2 p-3.5 transition hover:bg-[#fffaf0] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <AdminStatusBadge status={post.status} />
                    <span className="text-[11px] text-[#5a472c]/70">
                      {formatDate(post.publicado_em || post.updated_at)}
                    </span>
                  </div>
                  <h3 className="mt-1 font-serif text-sm font-bold text-[#171006] line-clamp-1">{post.titulo}</h3>
                </div>

                <div className="flex shrink-0 items-center gap-2.5">
                  {canAccessNews ? (
                    <Link
                      href={`/admin/noticias?edit=${post.id}`}
                      className="text-xs font-bold text-[#8b2f2b] hover:underline"
                    >
                      Editar
                    </Link>
                  ) : null}
                  <Link
                    href={`/noticias/${post.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-0.5 text-xs text-[#5a472c]/80 hover:text-[#171006] hover:underline"
                  >
                    <span>Ver no portal</span>
                    <ExternalLink size={11} />
                  </Link>
                </div>
              </div>
            ))}
            {recentPosts.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#5a472c]">Nenhuma publicação recente cadastrada.</div>
            ) : null}
          </div>
        </div>

        {/* 6. Próximos Eventos (Somente Leitura) */}
        <div className="border border-[#d8c38b] bg-[#171006] p-6 text-white shadow-[0_18px_50px_rgba(23,16,6,.14)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#f4cf6a]">Agenda do Portal</p>
              <h2 className="mt-1 font-serif text-xl font-black text-white">Próximos Eventos</h2>
            </div>
            <span className="text-[11px] text-white/50">Sincronizado do CRM</span>
          </div>

          <div className="mt-4 grid gap-3">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="border border-white/10 bg-white/[0.055] p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#f4cf6a]">{formatDate(event.data_inicio)}</span>
                  <span className="bg-emerald-500/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-emerald-300">
                    Programado
                  </span>
                </div>
                <h3 className="mt-1.5 font-serif text-base font-bold text-white line-clamp-1">{event.nome}</h3>
                {event.cidade || event.local ? (
                  <div className="mt-1 flex items-center gap-1 text-xs text-white/55">
                    <MapPin size={12} className="text-[#f4cf6a]" />
                    <span>{[event.local, event.cidade].filter(Boolean).join(" - ")}</span>
                  </div>
                ) : null}
              </div>
            ))}
            {upcomingEvents.length === 0 ? (
              <AdminEmptyState
                title="Nenhum evento programado"
                description="Nenhum evento ativo retornado pelo sistema oficial de eventos."
              />
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "-";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}


