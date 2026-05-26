import { departmentPages } from "@/lib/cms";
import { selectSupabaseRows } from "@/lib/supabase-admin";
import { ArrowRight, Building2, Save } from "lucide-react";
import Link from "next/link";
import { MediaPickerAsset, MediaUrlField } from "../media-url-field";
import { StatusMessage } from "../status-message";

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
  redes_sociais: CmsDepartmentLink[] | null;
  documentos: CmsDepartmentLink[] | null;
  ativo: boolean;
  ordem: number;
};

type CmsDepartmentLink = {
  label?: string;
  url?: string;
};

export default async function AdminDepartmentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string; message?: string; edit?: string; ativo?: string }>;
}) {
  const params = await searchParams;
  const activeFilter = params?.ativo ?? "todos";
  const activeQuery = activeFilter !== "todos" ? `&ativo=eq.${activeFilter === "ativos"}` : "";
  const [departments, mediaAssets] = await Promise.all([
    selectSupabaseRows<CmsDepartment>(
      "cms_departamentos",
      `select=id,slug,nome,titulo,resumo,conteudo,logo_url,banner_url,contato_nome,contato_whatsapp,redes_sociais,documentos,ativo,ordem${activeQuery}&order=ordem.asc,nome.asc&limit=20`,
    ),
    selectSupabaseRows<MediaPickerAsset>("cms_media_assets", "select=id,titulo,arquivo_url,tipo,pasta&order=created_at.desc&limit=30"),
  ]);
  const editingDepartment = departments.find((department) => department.id === params?.edit);

  return (
    <div className="mx-auto max-w-7xl">
      <StatusMessage success={params?.success} error={params?.message ?? params?.error} />
      <section className="border border-[#d8c38b] bg-white/76 p-6 shadow-[0_18px_50px_rgba(23,16,6,.08)]">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8b2f2b]">Departamentos</p>
            <h2 className="mt-3 font-serif text-4xl font-black leading-tight">
              Páginas editáveis para conselhos, comissões e departamentos.
            </h2>
            <p className="mt-4 leading-8 text-[#5a472c]">
              Cada área terá conteúdo próprio, notícias vinculadas, vídeos, eventos, coordenação, banners e arquivos oficiais.
            </p>
          </div>

          <form action="/api/admin/departamentos" method="post" className="grid gap-4 border border-[#ead9a6] bg-[#f7efd6] p-5">
            <input type="hidden" name="id" value={editingDepartment?.id ?? ""} />
            {editingDepartment ? (
              <div className="flex flex-wrap items-center gap-3 border border-[#d8c38b] bg-white/70 p-3 text-sm font-semibold text-[#5a472c]">
                Editando: <span className="font-black text-[#171006]">{editingDepartment.nome}</span>
                <a href="/admin/departamentos" className="ml-auto text-[#8b2f2b] underline underline-offset-4">
                  Cancelar
                </a>
              </div>
            ) : null}
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Nome</span>
                <input name="nome" required defaultValue={editingDepartment?.nome} className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]" placeholder="Ex.: COADESPA" />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Slug</span>
                <input name="slug" defaultValue={editingDepartment?.slug} className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]" placeholder="coadespa" />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="grid gap-2 md:col-span-2">
                <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Contato oficial</span>
                <input name="contato_nome" defaultValue={editingDepartment?.contato_nome ?? ""} className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]" placeholder="Ex.: Secretaria SEIADEPA" />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Ordem</span>
                <input name="ordem" type="number" defaultValue={editingDepartment?.ordem ?? 0} className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]" placeholder="10" />
              </label>
            </div>
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">WhatsApp do departamento</span>
              <input name="contato_whatsapp" defaultValue={editingDepartment?.contato_whatsapp ?? ""} className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]" placeholder="5591999999999" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Título da página</span>
              <input name="titulo" defaultValue={editingDepartment?.titulo ?? ""} className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]" placeholder="Título institucional" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Resumo</span>
              <textarea name="resumo" defaultValue={editingDepartment?.resumo ?? ""} className="min-h-28 border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]" placeholder="Descrição curta para a página e cards." />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <MediaUrlField name="logo_url" label="Logo" defaultValue={editingDepartment?.logo_url} assets={mediaAssets} helper="Imagem transparente ou símbolo do departamento." />
              <MediaUrlField name="banner_url" label="Banner" defaultValue={editingDepartment?.banner_url} assets={mediaAssets} helper="Imagem ampla para topo da página pública." />
            </div>
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Conteúdo institucional</span>
              <textarea name="conteudo" defaultValue={editingDepartment?.conteudo ?? ""} className="min-h-32 border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]" placeholder="Texto completo da página do departamento." />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Links oficiais</span>
                <textarea
                  name="redes_sociais"
                  defaultValue={formatLinksForTextarea(editingDepartment?.redes_sociais)}
                  className="min-h-28 border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]"
                  placeholder={"Instagram | https://instagram.com/...\nYouTube | https://youtube.com/..."}
                />
                <span className="text-xs font-semibold text-[#8b2f2b]/80">Um link por linha no formato: TÃ­tulo | URL</span>
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Documentos e materiais</span>
                <textarea
                  name="documentos"
                  defaultValue={formatLinksForTextarea(editingDepartment?.documentos)}
                  className="min-h-28 border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]"
                  placeholder={"Regimento | https://...\nFormulÃ¡rio | https://..."}
                />
                <span className="text-xs font-semibold text-[#8b2f2b]/80">Use para PDFs, formulÃ¡rios, editais e materiais oficiais.</span>
              </label>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="submit" className="inline-flex items-center justify-center gap-3 bg-[#171006] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white">
                <Save size={18} />
                {editingDepartment ? "Atualizar departamento" : "Salvar departamento"}
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <div className="md:col-span-2 xl:col-span-3 flex flex-wrap gap-2">
          {[
            ["todos", "Todos"],
            ["ativos", "Ativos"],
            ["inativos", "Inativos"],
          ].map(([value, label]) => (
            <Link
              key={value}
              href={value === "todos" ? "/admin/departamentos" : `/admin/departamentos?ativo=${value}`}
              className={`px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] transition ${
                activeFilter === value ? "bg-[#171006] text-[#f4cf6a]" : "border border-[#d8c38b] text-[#8b2f2b] hover:bg-white"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
        {(departments.length > 0 ? departments : departmentPages).map((department) => (
          <article key={"id" in department ? department.id : department.slug} className="group border border-[#d8c38b] bg-white/70 p-6 shadow-[0_18px_50px_rgba(23,16,6,.08)] transition hover:-translate-y-1 hover:bg-white">
            <div className="flex items-center justify-between gap-4">
              <div className="grid h-12 w-12 place-items-center bg-[#171006] text-[#f4cf6a]">
                <Building2 size={22} />
              </div>
              <span className="bg-[#f4cf6a] px-3 py-1 text-xs font-black uppercase tracking-[0.12em]">
                {"ativo" in department ? (department.ativo ? "Ativo" : "Inativo") : department.status}
              </span>
            </div>
            <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-[#8b2f2b]">{"nome" in department ? department.nome : department.name}</p>
            <h3 className="mt-2 font-serif text-3xl font-black leading-tight">{"titulo" in department ? department.titulo ?? department.nome : department.title}</h3>
            <p className="mt-4 leading-7 text-[#5a472c]">{"resumo" in department ? department.resumo ?? "Página institucional em construção." : department.text}</p>
            <Link href={"id" in department ? `/admin/preview/departamentos/${department.id}` : `/departamentos/${department.slug}`} target="_blank" className="mt-6 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-[#8b2f2b]">
              Prévia da página
              <ArrowRight size={17} />
            </Link>
            {"id" in department ? (
              <div className="mt-6 flex flex-wrap gap-4">
                <Link href={`/admin/departamentos?edit=${department.id}`} className="inline-flex text-sm font-black uppercase tracking-[0.12em] text-[#8b2f2b] underline underline-offset-4">
                  Editar
                </Link>
                <form action="/api/admin/departamentos" method="post">
                  <input type="hidden" name="id" value={department.id} />
                  <input type="hidden" name="action" value={department.ativo ? "deactivate" : "activate"} />
                  <button type="submit" className="text-sm font-black uppercase tracking-[0.12em] text-[#8b2f2b]/70 underline underline-offset-4 transition hover:text-[#8b2f2b]">
                    {department.ativo ? "Desativar" : "Ativar"}
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

function formatLinksForTextarea(value: CmsDepartmentLink[] | null | undefined) {
  if (!Array.isArray(value)) {
    return "";
  }

  return value
    .map((item) => {
      const label = item.label?.trim();
      const url = item.url?.trim();

      if (!label && !url) {
        return "";
      }

      if (!label || label === url) {
        return url ?? "";
      }

      return `${label} | ${url}`;
    })
    .filter(Boolean)
    .join("\n");
}
