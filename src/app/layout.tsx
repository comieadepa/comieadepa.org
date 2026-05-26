import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { absoluteUrl, buildSeoMetadata, siteUrl } from "@/lib/seo";
import { LgpdConsent } from "./lgpd-consent";
import "./globals.css";

const serif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  ...buildSeoMetadata({
    title: "COMIEADEPA | Portal Institucional",
    path: "/",
  }),
  applicationName: "COMIEADEPA",
  category: "Institucional",
  keywords: ["COMIEADEPA", "Assembleia de Deus", "Pará", "convenção", "ministros", "pentecostal"],
  icons: {
    icon: absoluteUrl("/assets/logo-comieadepa.png"),
    apple: absoluteUrl("/assets/logo-comieadepa.png"),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${serif.variable} ${sans.variable}`}>
        {children}
        <LgpdConsent />
      </body>
    </html>
  );
}
