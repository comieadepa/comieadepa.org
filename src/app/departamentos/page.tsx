import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { fallbackDepartments, type DepartmentPageContent } from "@/lib/department-content";
import { buildSeoMetadata } from "@/lib/seo";
import { selectPublicRows } from "@/lib/supabase-public";
import { PublicLayout } from "@/components/site/PublicLayout";

type CmsDepartment = {
  slug: string;
  nome: string;
  titulo: string | null;
  resumo: string | null;
  conteudo: string | null;
};

export const metadata: Metadata = buildSeoMetadata({
  title: "Departamentos | COMIEADEPA",
  description: "Conselhos, comissões e departamentos da COMIEADEPA.",
  path: "/departamentos",
});

export default async function DepartmentsIndexPage() {
  const cmsDepartments = await selectPublicRows<CmsDepartment>(
    "cms_departamentos",
    "select=slug,nome,titulo,resumo,conteudo&ativo=eq.true&order=ordem.asc,nome.asc",
  );
  const departments = mergeDepartments(cmsDepartments);

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
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#F8D77B]">Departamentos</p>
                <h1 className="mt-4 font-serif text-5xl font-black leading-[1.04] text-white sm:text-7xl">Departamentos</h1>
              </div>
              <p className="text-lg leading-8 text-white/80 border-l border-white/20 pl-6 lg:border-l-2">
                Uma estrutura viva de serviço, formação e cuidado para apoiar igrejas, ministros, famílias e juventude em todo o território paraense.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8">

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {departments.map((department) => (
            <Link
              key={department.slug}
              href={`/departamentos/${department.slug}`}
              className="group flex min-h-[280px] flex-col justify-between rounded-xl border border-[#0F3B63]/10 bg-[#F4F6F8] p-7 shadow-[0_18px_50px_rgba(15,59,99,.10)] transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_24px_60px_rgba(15,59,99,.16)]"
            >
              <div>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-[#B8872D]">Departamento</span>
                <h2 className="mt-5 font-serif text-3xl font-black leading-tight text-[#0F3B63]">{department.nome}</h2>
                <p className="mt-4 text-lg font-semibold leading-7 text-[#1F2937]">{department.titulo}</p>
                <p className="mt-4 text-base leading-7 text-[#6B7280]">{department.resumo}</p>
              </div>
              <span className="mt-8 inline-flex items-center gap-3 text-sm font-black uppercase tracking-[0.16em] text-[#0F3B63]">
                Acessar página <ArrowRight size={18} className="transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>
      </main>
    </PublicLayout>
  );
}

function mergeDepartments(cmsDepartments: CmsDepartment[]) {
  const mapped = cmsDepartments.map((department) => ({
    slug: department.slug,
    nome: department.nome,
    titulo: department.titulo ?? department.nome,
    resumo: department.resumo ?? "",
    conteudo: department.conteudo ?? "",
  }));
  const cmsSlugs = new Set(mapped.map((department) => department.slug));
  const missingFallbacks = fallbackDepartments.filter((department) => !cmsSlugs.has(department.slug));

  return [...mapped, ...missingFallbacks] satisfies DepartmentPageContent[];
}
