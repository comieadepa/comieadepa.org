import { contentModules, editorialWorkflow } from "@/lib/cms";
import { countSupabaseRows } from "@/lib/supabase-admin";
import { ArrowRight, CheckCircle2, Clock3 } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const visiblePublishedPostsQuery = `select=id&status=eq.publicado&or=(publicado_em.is.null,publicado_em.lte.${encodeURIComponent(new Date().toISOString())})`;
  const [publishedPosts, draftPosts, activeVideos, mediaAssets, openEvents] = await Promise.all([
    countSupabaseRows("cms_posts", visiblePublishedPostsQuery),
    countSupabaseRows("cms_posts", "select=id&status=in.(rascunho,revisao,agendado)"),
    countSupabaseRows("cms_videos", "select=id&ativo=eq.true"),
    countSupabaseRows("cms_media_assets", "select=id"),
    countSupabaseRows("v_eventos_publicos", "select=id&inscricoes_abertas=eq.true"),
  ]);
  const dashboardStats = [
    { label: "Notícias publicadas", value: String(publishedPosts), detail: `${draftPosts} conteúdo(s) em rascunho, revisão ou agenda` },
    { label: "Vídeos ativos", value: String(activeVideos), detail: "Exibidos ou disponíveis para seleção no portal" },
    { label: "Mídia", value: String(mediaAssets), detail: "Arquivos disponíveis na biblioteca" },
    { label: "Eventos abertos", value: String(openEvents), detail: "Lidos diretamente do sistema de eventos" },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <section className="overflow-hidden border border-[#d8c38b] bg-[#171006] text-white shadow-[0_24px_70px_rgba(23,16,6,.18)]">
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#f4cf6a]">Implantação do CMS</p>
            <h2 className="mt-5 max-w-3xl font-serif text-4xl font-black leading-[1.02] sm:text-5xl">
              Uma redação digital para alimentar o portal da convenção.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/68">
              O painel organiza notícias, vídeos, departamentos e destaques da home em um fluxo simples para a equipe de mídia publicar com consistência, revisão e identidade institucional.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/admin/noticias" className="inline-flex items-center justify-center gap-3 bg-[#f4cf6a] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#171006]">
                Criar notícia
                <ArrowRight size={18} />
              </Link>
              <Link href="/admin/videos" className="inline-flex items-center justify-center gap-3 border border-white/18 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white">
                Organizar vídeos
              </Link>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {dashboardStats.map((stat) => (
              <div key={stat.label} className="border border-white/10 bg-white/[0.055] p-5">
                <p className="font-serif text-5xl font-black text-[#f4cf6a]">{stat.value}</p>
                <p className="mt-3 text-sm font-black uppercase tracking-[0.13em] text-white">{stat.label}</p>
                <p className="mt-2 text-sm leading-6 text-white/54">{stat.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-4">
        {contentModules.map((module) => (
          <article key={module.title} className="border border-[#d8c38b] bg-white/70 p-6 shadow-[0_18px_50px_rgba(23,16,6,.08)]">
            <module.icon size={26} className="text-[#8b2f2b]" />
            <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-[#8b2f2b]">{module.status}</p>
            <h3 className="mt-2 font-serif text-3xl font-black">{module.title}</h3>
            <p className="mt-4 leading-7 text-[#5a472c]">{module.text}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="border border-[#d8c38b] bg-white/70 p-6">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8b2f2b]">Fluxo editorial</p>
          <div className="mt-6 grid gap-4">
            {editorialWorkflow.map((step, index) => (
              <div key={step.title} className="flex gap-4 border border-[#ead9a6] bg-[#f7efd6] p-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#171006] text-sm font-black text-[#f4cf6a]">0{index + 1}</span>
                <div>
                  <h3 className="font-serif text-2xl font-black">{step.title}</h3>
                  <p className="mt-1 leading-6 text-[#5a472c]">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-[#d8c38b] bg-white/70 p-6">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8b2f2b]">Próximas conexões</p>
          <div className="mt-6 grid gap-4">
            {[
              "Executar o SQL inicial no Supabase",
              "Configurar autenticação e perfis editoriais",
              "Conectar formulários para gravar notícias, vídeos e departamentos",
              "Atualizar o portal para ler posts e vídeos publicados",
            ].map((item, index) => (
              <div key={item} className="flex items-center gap-3 border-b border-[#ead9a6] pb-4 last:border-b-0">
                {index === 0 ? <Clock3 size={20} className="text-[#d97a00]" /> : <CheckCircle2 size={20} className="text-[#8b2f2b]" />}
                <span className="font-semibold text-[#342411]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
