import { notFound } from "next/navigation";
import type { DepartmentLink } from "@/app/departamentos/department-page-view";
import { DepartmentPageView } from "@/app/departamentos/department-page-view";
import { selectSupabaseRows } from "@/lib/supabase-admin";

type CmsDepartment = {
  id: string;
  nome: string;
  titulo: string | null;
  resumo: string | null;
  conteudo: string | null;
  banner_url: string | null;
  contato_nome: string | null;
  contato_whatsapp: string | null;
  redes_sociais: unknown;
  documentos: unknown;
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminDepartmentPreviewPage({ params }: PageProps) {
  const { id } = await params;
  const rows = await selectSupabaseRows<CmsDepartment>(
    "cms_departamentos",
    `select=id,nome,titulo,resumo,conteudo,banner_url,contato_nome,contato_whatsapp,redes_sociais,documentos&id=eq.${encodeURIComponent(id)}&limit=1`,
  );
  const department = rows[0];

  if (!department) {
    notFound();
  }

  return (
    <DepartmentPageView
      preview
      backHref="/admin/departamentos"
      department={{
        nome: department.nome,
        titulo: department.titulo ?? department.nome,
        resumo: department.resumo ?? "",
        conteudo: department.conteudo ?? department.resumo ?? "",
        bannerUrl: department.banner_url,
        contactName: department.contato_nome,
        contactWhatsapp: department.contato_whatsapp,
        socialLinks: normalizeDepartmentLinks(department.redes_sociais),
        documentLinks: normalizeDepartmentLinks(department.documentos),
      }}
    />
  );
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
