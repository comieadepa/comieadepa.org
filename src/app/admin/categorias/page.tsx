import { selectSupabaseRows } from "@/lib/supabase-admin";
import { Save, Tags } from "lucide-react";
import Link from "next/link";
import { StatusMessage } from "../status-message";
import { AdminSubNavTabs } from "../admin-ui";

type CmsCategory = {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  created_at: string;
};

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string; message?: string; edit?: string }>;
}) {
  const params = await searchParams;
  const categories = await selectSupabaseRows<CmsCategory>(
    "cms_categorias",
    "select=id,nome,slug,descricao,created_at&order=nome.asc&limit=40",
  );
  const editingCategory = categories.find((category) => category.id === params?.edit);

  return (
    <div className="mx-auto max-w-7xl">
      <AdminSubNavTabs
        tabs={[
          { href: "/admin/noticias", label: "Todas as notícias", active: false },
          { href: "/admin/categorias", label: "Categorias", active: true },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <section className="h-fit border border-[#d8c38b] bg-white/76 p-6 shadow-[0_18px_50px_rgba(23,16,6,.08)]">
          <StatusMessage success={params?.success} error={params?.message ?? params?.error} />
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8b2f2b]">Categorias</p>
          <h2 className="mt-3 font-serif text-4xl font-black leading-tight">{editingCategory ? "Editar categoria" : "Nova categoria"}</h2>
          <p className="mt-4 leading-7 text-[#5a472c]">Organize notícias por editoria, como comunicados, cobertura, AGO, departamentos e notas oficiais.</p>

        <form action="/api/admin/categorias" method="post" className="mt-8 grid gap-5">
          <input type="hidden" name="id" value={editingCategory?.id ?? ""} />
          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Nome</span>
            <input name="nome" required defaultValue={editingCategory?.nome} className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]" placeholder="Ex.: Comunicados oficiais" />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Slug</span>
            <input name="slug" defaultValue={editingCategory?.slug} className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]" placeholder="gerado pelo nome se ficar vazio" />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Descrição</span>
            <textarea name="descricao" defaultValue={editingCategory?.descricao ?? ""} className="min-h-28 border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]" placeholder="Uso editorial dessa categoria." />
          </label>
          <button type="submit" className="inline-flex w-fit items-center gap-3 bg-[#171006] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white">
            <Save size={18} />
            {editingCategory ? "Atualizar categoria" : "Salvar categoria"}
          </button>
          {editingCategory ? (
            <Link href="/admin/categorias" className="w-fit text-sm font-semibold text-[#8b2f2b] underline underline-offset-4">
              Cancelar edição
            </Link>
          ) : null}
        </form>
      </section>

      <section className="border border-[#d8c38b] bg-[#171006] p-6 text-white shadow-[0_18px_50px_rgba(23,16,6,.14)]">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#f4cf6a]">Editorias</p>
            <h2 className="mt-2 font-serif text-4xl font-black">Categorias cadastradas</h2>
          </div>
          <span className="text-sm text-white/52">{categories.length} categoria(s)</span>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {categories.map((category) => (
            <article key={category.id} className="border border-white/10 bg-white/[0.055] p-5">
              <div className="flex items-start gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center bg-[#f4cf6a] text-[#171006]">
                  <Tags size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#f4cf6a]">{category.slug}</p>
                  <h3 className="mt-1 font-serif text-2xl font-black">{category.nome}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/58">{category.descricao ?? "Sem descrição."}</p>
                  <Link href={`/admin/categorias?edit=${category.id}`} className="mt-4 inline-flex text-xs font-black uppercase tracking-[0.14em] text-[#f4cf6a]">
                    Editar
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {categories.length === 0 ? <div className="mt-8 border border-white/10 bg-white/[0.055] p-6 text-white/62">Nenhuma categoria cadastrada ainda.</div> : null}
      </section>
    </div>
  </div>
  );
}
