import { departmentPages } from "@/lib/cms";
import { selectSupabaseRows } from "@/lib/supabase-admin";
import { ArrowRight, Building2, Save } from "lucide-react";
import Link from "next/link";
import { MediaPickerAsset, MediaUrlField } from "../media-url-field";
import { StatusMessage } from "../status-message";
import { AdminFilterPills, AdminPageHeader, AdminStatusBadge } from "../admin-ui";

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

      <AdminPageHeader
        icon={Building2}
        eyebrow="Departamentos & Secretarias"
        title="Gestão de Departamentos da Convenção"
        description="Configure páginas dedicadas a conselhos, secretarias e comissões da COMIEADEPA, com coordenação, notícias, banners e arquivos oficiais."
      />

      <section className="border border-[#d8c38b] bg-white/76 p-6 shadow-[0_18px_50px_rgba(23,16,6,.08)]">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8b2f2b]">
            {editingDepartment ? "Editar Departamento" : "Novo Departamento"}
          </p>
          {editingDepartment ? (
            <Link href="/admin/departamentos" className="text-sm font-semibold text-[#8b2f2b] underline underline-offset-4">
              Cancelar edição
            </Link>
          ) : null}
        </div>

        <form action="/api/admin/departamentos" method="post" className="mt-6 grid gap-5">
          <input type="hidden" name="id" value={editingDepartment?.id ?? ""} />
          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Nome</span>
              <input name="nome" required defaultValue={editingDepartment?.nome} className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]" placeholder="Ex.: UMADEP" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Título institucional</span>
              <input name="titulo" defaultValue={editingDepartment?.titulo ?? ""} className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]" placeholder="União da Mocidade das Assembleias de Deus no Pará" />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Slug</span>
              <input name="slug" pattern="^[a-z0-9-]+$" defaultValue={editingDepartment?.slug} className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]" placeholder="umadep" />
              <span className="text-xs font-semibold text-[#8b2f2b]/80">Use apenas letras minúsculas, números e hífen.</span>
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Ordem</span>
              <input name="ordem" type="number" defaultValue={editingDepartment?.ordem} className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]" placeholder="1" />
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Resumo</span>
            <textarea name="resumo" defaultValue={editingDepartment?.resumo ?? ""} className="min-h-24 border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]" placeholder="Breve apresentação da atuação do departamento." />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Conteúdo completo</span>
            <textarea name="conteudo" defaultValue={editingDepartment?.conteudo ?? ""} className="min-h-36 border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]" placeholder="História, diretoria, missão, visão, atuação e agenda própria." />
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <MediaUrlField name="logo_url" label="Logo do departamento" defaultValue={editingDepartment?.logo_url} assets={mediaAssets} helper="Símbolo oficial ou marca do departamento." />
            <MediaUrlField name="banner_url" label="Banner de capa" defaultValue={editingDepartment?.banner_url} assets={mediaAssets} helper="Imagem principal de topo da página." />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Líder ou coordenador</span>
              <input name="contato_nome" defaultValue={editingDepartment?.contato_nome ?? ""} className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]" placeholder="Ex.: Pr. Coordenador Geral" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">WhatsApp / Contato</span>
              <input name="contato_whatsapp" defaultValue={editingDepartment?.contato_whatsapp ?? ""} className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]" placeholder="55 (91) 00000-0000" />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Redes sociais (uma por linha)</span>
              <textarea name="redes_sociais" defaultValue={formatLinksForTextarea(editingDepartment?.redes_sociais)} className="min-h-24 border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]" placeholder="Instagram | https://instagram.com/..." />
              <span className="text-xs font-semibold text-[#8b2f2b]/80">Formato: Nome da rede | URL</span>
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Documentos / Downloads (um por linha)</span>
              <textarea name="documentos" defaultValue={formatLinksForTextarea(editingDepartment?.documentos)} className="min-h-24 border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]" placeholder="Regimento Interno | https://..." />
              <span className="text-xs font-semibold text-[#8b2f2b]/80">Use para PDFs, formulários, editais e materiais oficiais.</span>
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="submit" className="inline-flex items-center justify-center gap-3 bg-[#171006] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white">
              <Save size={18} />
              {editingDepartment ? "Atualizar departamento" : "Salvar departamento"}
            </button>
          </div>
        </form>
      </section>

      <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <div className="md:col-span-2 xl:col-span-3">
          <AdminFilterPills
            current={activeFilter}
            baseUrl="/admin/departamentos"
            paramName="ativo"
            options={[
              { value: "todos", label: "Todos" },
              { value: "ativos", label: "Ativos" },
              { value: "inativos", label: "Inativos" },
            ]}
          />
        </div>
        {(departments.length > 0 ? departments : departmentPages).map((department) => (
          <article key={"id" in department ? department.id : department.slug} className="group flex flex-col justify-between border border-[#d8c38b] bg-white/70 p-6 shadow-[0_18px_50px_rgba(23,16,6,.08)] transition hover:-translate-y-1 hover:bg-white">
            <div>
              <div className="flex items-center justify-between gap-4">
                <div className="grid h-12 w-12 place-items-center bg-[#171006] text-[#f4cf6a]">
                  <Building2 size={22} />
                </div>
                <AdminStatusBadge status={"ativo" in department ? (department.ativo ? "ativo" : "inativo") : "ativo"} />
              </div>
              <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-[#8b2f2b]">{"nome" in department ? department.nome : department.name}</p>
              <h3 className="mt-2 font-serif text-2xl font-black leading-tight">{"titulo" in department ? department.titulo ?? department.nome : department.title}</h3>
              <p className="mt-4 leading-7 text-[#5a472c]">{"resumo" in department ? department.resumo ?? "Página institucional em construção." : department.text}</p>
            </div>
            <div>
              <Link href={"id" in department ? `/admin/preview/departamentos/${department.id}` : `/departamentos/${department.slug}`} target="_blank" className="mt-6 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-[#8b2f2b]">
                Prévia da página
                <ArrowRight size={17} />
              </Link>
              {"id" in department ? (
                <div className="mt-6 flex flex-wrap gap-4 border-t border-[#d8c38b]/40 pt-3">
                  <Link href={`/admin/departamentos?edit=${department.id}`} className="inline-flex text-xs font-black uppercase tracking-[0.14em] text-[#8b2f2b]">
                    Editar
                  </Link>
                  <form action="/api/admin/departamentos" method="post">
                    <input type="hidden" name="id" value={department.id} />
                    <input type="hidden" name="action" value={department.ativo ? "deactivate" : "activate"} />
                    <button type="submit" className="text-xs font-black uppercase tracking-[0.14em] text-[#8b2f2b]/70 transition hover:text-[#8b2f2b]">
                      {department.ativo ? "Desativar" : "Ativar"}
                    </button>
                  </form>
                </div>
              ) : null}
            </div>
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
