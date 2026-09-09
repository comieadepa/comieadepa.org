import { selectSupabaseRows } from "@/lib/supabase-admin";
import { CategoriesManager, CmsCategory } from "./categories-manager";

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
    <CategoriesManager
      categories={categories}
      editingCategory={editingCategory}
      initialSuccess={params?.success}
      initialError={params?.message ?? params?.error}
    />
  );
}

