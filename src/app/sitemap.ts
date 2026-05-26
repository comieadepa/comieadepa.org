import type { MetadataRoute } from "next";
import { fallbackDepartments } from "@/lib/department-content";
import { absoluteUrl } from "@/lib/seo";
import { selectPublicRows } from "@/lib/supabase-public";

type CmsPostSitemapRow = {
  slug: string;
  publicado_em: string | null;
  created_at: string;
};

type CmsDepartmentSitemapRow = {
  slug: string;
  updated_at: string | null;
  created_at: string;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, departments] = await Promise.all([
    selectPublicRows<CmsPostSitemapRow>(
      "cms_posts",
      `select=slug,publicado_em,created_at&status=eq.publicado${getPublishedPostsPublicFilter()}&order=publicado_em.desc.nullslast,created_at.desc&limit=100`,
    ),
    selectPublicRows<CmsDepartmentSitemapRow>("cms_departamentos", "select=slug,updated_at,created_at&ativo=eq.true&order=ordem.asc,nome.asc&limit=100"),
  ]);
  const departmentSlugs = new Set(departments.map((department) => department.slug));
  const fallbackDepartmentEntries = fallbackDepartments
    .filter((department) => !departmentSlugs.has(department.slug))
    .map((department) => ({
      url: absoluteUrl(`/departamentos/${department.slug}`),
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  return [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/noticias"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/videos"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/departamentos"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/privacidade"),
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: absoluteUrl("/termos"),
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...posts.map((post) => ({
      url: absoluteUrl(`/noticias/${post.slug}`),
      lastModified: new Date(post.publicado_em ?? post.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...departments.map((department) => ({
      url: absoluteUrl(`/departamentos/${department.slug}`),
      lastModified: new Date(department.updated_at ?? department.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...fallbackDepartmentEntries,
  ];
}

function getPublishedPostsPublicFilter() {
  return `&or=(publicado_em.is.null,publicado_em.lte.${encodeURIComponent(new Date().toISOString())})`;
}
