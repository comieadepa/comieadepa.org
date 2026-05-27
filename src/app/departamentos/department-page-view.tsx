import { ArrowLeft, ArrowRight, CalendarDays, ExternalLink, FileText, LinkIcon, Play } from "lucide-react";
import Link from "next/link";

export type DepartmentRelatedPost = {
  id: string;
  titulo: string;
  slug: string;
  resumo: string | null;
  publicadoEm: string;
};

export type DepartmentRelatedVideo = {
  id: string;
  titulo: string;
  youtubeId: string;
  tipo: string;
};

export type DepartmentViewData = {
  nome: string;
  titulo: string;
  resumo: string;
  conteudo: string;
  bannerUrl: string | null;
  contactName: string | null;
  contactWhatsapp: string | null;
  socialLinks?: DepartmentLink[];
  documentLinks?: DepartmentLink[];
  relatedPosts?: DepartmentRelatedPost[];
  relatedVideos?: DepartmentRelatedVideo[];
};

export type DepartmentLink = {
  label: string;
  url: string;
};

type DepartmentPageViewProps = {
  department: DepartmentViewData;
  backHref?: string;
  preview?: boolean;
};

export function DepartmentPageView({ department, backHref = "/departamentos", preview = false }: DepartmentPageViewProps) {
  return (
    <main className="min-h-screen bg-white text-[#1F2937]">
      {preview ? (
        <div className="bg-[#0F3B63] px-5 py-3 text-center text-xs font-black uppercase tracking-[0.16em] text-white">
          Prévia administrativa
        </div>
      ) : null}
      <section className="relative overflow-hidden px-5 py-16 sm:px-8">
        {department.bannerUrl ? <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${department.bannerUrl})` }} /> : null}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(244,207,106,.18),transparent_28%)]" />
        <div className="relative mx-auto max-w-6xl">
          <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-[#0F3B63] transition hover:text-[#4A86B8]">
            <ArrowLeft size={18} />
            Departamentos
          </Link>

          <div className="mt-12 grid gap-10 lg:grid-cols-[0.7fr_1fr] lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#B8872D]">{department.nome}</p>
              <h1 className="mt-5 font-serif text-4xl font-black leading-[1.04] text-[#0F3B63] sm:text-6xl">{department.titulo}</h1>
            </div>
            <p className="text-lg leading-8 text-[#6B7280]">{department.resumo}</p>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_360px]">
          <article className="rounded-xl border border-[#0F3B63]/10 bg-[#F4F6F8] p-7 shadow-[0_18px_50px_rgba(15,59,99,.10)] sm:p-10">
            <div className="space-y-6 text-lg leading-8 text-[#6B7280]">
              {renderContent(department.conteudo || department.resumo)}
            </div>
          </article>

          <aside className="h-fit rounded-xl border border-[#0F3B63]/10 bg-[#F4F6F8] p-7 text-[#1F2937] shadow-[0_18px_50px_rgba(15,59,99,.10)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B8872D]">Canal oficial</p>
            <h2 className="mt-4 font-serif text-3xl font-black">{department.nome}</h2>
            <p className="mt-4 leading-7 text-[#4c391e]">Conteúdo editável pelo painel administrativo para manter a comunicação do departamento sempre atualizada.</p>
            {department.contactName ? <p className="mt-5 text-sm font-black uppercase tracking-[0.12em] text-[#0F3B63]">{department.contactName}</p> : null}
            {department.contactWhatsapp ? (
              <a href={`https://wa.me/${onlyDigits(department.contactWhatsapp)}`} target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-3 rounded-lg bg-[#0F3B63] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white">
                Falar com equipe <ArrowRight size={18} />
              </a>
            ) : null}
            <DepartmentLinks title="Links oficiais" icon="link" links={department.socialLinks} />
            <DepartmentLinks title="Documentos e materiais" icon="file" links={department.documentLinks} />
          </aside>
        </div>
      </section>

      {department.relatedPosts?.length || department.relatedVideos?.length ? (
        <section className="border-t border-[#0F3B63]/10 px-5 pb-20 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1fr]">
              {department.relatedPosts?.length ? (
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#B8872D]">Notícias</p>
                  <h2 className="mt-4 font-serif text-3xl font-black text-[#0F3B63]">Atualizações do departamento.</h2>
                  <div className="mt-7 grid gap-4">
                    {department.relatedPosts.map((post) => (
                      <Link key={post.id} href={`/noticias/${post.slug}`} className="group rounded-xl border border-[#0F3B63]/10 bg-[#F4F6F8] p-5 transition hover:-translate-y-1 hover:bg-white">
                        <span className="inline-flex items-center gap-2 text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#B8872D]">
                          <CalendarDays size={14} />
                          {formatDate(post.publicadoEm)}
                        </span>
                        <h3 className="mt-3 font-serif text-2xl font-black leading-tight text-[#0F3B63]">{post.titulo}</h3>
                        {post.resumo ? <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#6B7280]">{post.resumo}</p> : null}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}

              {department.relatedVideos?.length ? (
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#B8872D]">Vídeos</p>
                  <h2 className="mt-4 font-serif text-3xl font-black text-[#0F3B63]">Registros em movimento.</h2>
                  <div className="mt-7 grid gap-4 sm:grid-cols-2">
                    {department.relatedVideos.map((video) => (
                      <a
                        key={video.id}
                        href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="group overflow-hidden rounded-xl border border-[#0F3B63]/10 bg-[#F4F6F8] transition hover:-translate-y-1 hover:bg-white"
                      >
                        <div className="relative aspect-video bg-[#0F3B63]">
                          <div
                            className="h-full w-full bg-cover bg-center opacity-70 transition group-hover:scale-105 group-hover:opacity-90"
                            style={{ backgroundImage: `url(https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg)` }}
                          />
                          <span className="absolute inset-0 grid place-items-center">
                            <span className="grid h-14 w-14 place-items-center rounded-full bg-[#D4A24C] text-white shadow-[0_16px_36px_rgba(0,0,0,.25)]">
                              <Play size={22} fill="currentColor" />
                            </span>
                          </span>
                        </div>
                        <div className="p-5">
                          <span className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#B8872D]">{video.tipo}</span>
                          <h3 className="mt-2 font-serif text-xl font-black leading-tight text-[#0F3B63]">{video.titulo}</h3>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}

function renderContent(content: string) {
  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => <p key={paragraph}>{paragraph}</p>);
}

function DepartmentLinks({ title, icon, links }: { title: string; icon: "link" | "file"; links?: DepartmentLink[] }) {
  const visibleLinks = links?.filter((link) => link.label && link.url) ?? [];

  if (!visibleLinks.length) {
    return null;
  }

  const Icon = icon === "file" ? FileText : LinkIcon;

  return (
    <div className="mt-7 border-t border-[#0F3B63]/15 pt-6">
      <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#B8872D]">
        <Icon size={15} />
        {title}
      </p>
      <div className="mt-4 grid gap-2">
        {visibleLinks.map((link) => (
          <a
            key={`${title}-${link.url}`}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between gap-3 rounded-lg border border-[#0F3B63]/15 bg-white px-4 py-3 text-sm font-black text-[#0F3B63] transition hover:border-[#0F3B63]/35 hover:bg-[#F4F6F8]"
          >
            <span>{link.label}</span>
            <ExternalLink size={15} />
          </a>
        ))}
      </div>
    </div>
  );
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}
