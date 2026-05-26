import type { Metadata } from "next";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://comieadepa-org.vercel.app";
export const siteName = "COMIEADEPA";
export const defaultDescription =
  "Portal institucional da Convenção de Ministros das Igrejas Evangélicas Assembleia de Deus no Estado do Pará.";
export const defaultOgImage = "/assets/sede-aerea-comieadepa.jpg";

type SeoMetadataInput = {
  title: string;
  description?: string | null;
  path?: string;
  image?: string | null;
  type?: "website" | "article";
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteUrl).toString();
}

export function absoluteImageUrl(image?: string | null) {
  if (!image) {
    return absoluteUrl(defaultOgImage);
  }

  try {
    return new URL(image).toString();
  } catch {
    return absoluteUrl(image);
  }
}

export function buildSeoMetadata({ title, description, path = "/", image, type = "website" }: SeoMetadataInput): Metadata {
  const resolvedDescription = description?.trim() || defaultDescription;
  const url = absoluteUrl(path);
  const imageUrl = absoluteImageUrl(image);

  return {
    title,
    description: resolvedDescription,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description: resolvedDescription,
      url,
      siteName,
      type,
      locale: "pt_BR",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: resolvedDescription,
      images: [imageUrl],
    },
  };
}
