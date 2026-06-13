"use client";

import { Clock, Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { PublicSiteConfig } from "./PublicLayout";
import { SocialLinks } from "./SocialLinks";

type FooterProps = {
  config: PublicSiteConfig;
};

export function Footer({ config }: FooterProps) {
  const pathname = usePathname();
  const homePrefix = pathname === "/" ? "" : "/";

  return (
    <footer id="contato" className="relative overflow-hidden border-t border-[#D4A24C]/24 bg-[#0F3B63] px-5 py-12 text-white sm:px-8">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(212,162,76,.12),transparent_34%,rgba(74,134,184,.20))]" />
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(135deg,#D4A24C_1px,transparent_1px)] [background-size:34px_34px]" />
      <div className="absolute -right-16 top-0 h-full w-72 skew-x-[-16deg] bg-[#1D5A8C]/28" />
      <div className="relative mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.1fr_0.7fr_1fr_0.95fr]">
        <div className="flex items-center justify-center md:justify-start">
          <Image src="/assets/logo-comieadepa.png" alt="Brasão COMIEADEPA" width={150} height={150} className="h-36 w-36 object-contain drop-shadow-[0_18px_24px_rgba(0,0,0,.22)]" />
        </div>

        <nav className="grid gap-3 text-sm font-semibold text-white/92">
          <a href={pathname === "/" ? "#" : "/"} className="w-fit border-b-2 border-[#D4A24C] pb-1 text-[#F8D77B]">Home</a>
          <a href={`${homePrefix}#a-comieadepa`} className="transition hover:text-[#F8D77B]">Sobre Nós</a>
          <a href={`${homePrefix}#presidencia`} className="transition hover:text-[#F8D77B]">Institucional</a>
          <a href={`${homePrefix}#eventos`} className="transition hover:text-[#F8D77B]">Mídias</a>
          <a href={`${homePrefix}#noticias`} className="transition hover:text-[#F8D77B]">Notícias</a>
          <a href="#contato" className="transition hover:text-[#F8D77B]">Contatos</a>
          <a href="/privacidade" className="transition hover:text-[#F8D77B]">Privacidade</a>
          <a href="/termos" className="transition hover:text-[#F8D77B]">Termos de Uso</a>
        </nav>

        <div>
          <h3 className="text-sm font-black">Contato</h3>
          <div className="mt-4 grid gap-4 text-sm text-white/92">
            <span className="inline-flex items-start gap-3">
              <MapPin size={18} className="mt-0.5 shrink-0 text-[#F8D77B]" />
              {config.contactAddress}
            </span>
            <span className="inline-flex items-center gap-3">
              <Phone size={18} className="shrink-0 text-[#F8D77B]" />
              {config.contactPhone}
            </span>
            <span className="inline-flex items-center gap-3">
              <Clock size={18} className="shrink-0 text-[#F8D77B]" />
              {config.contactHours}
            </span>
            <span className="inline-flex items-center gap-3">
              <Mail size={18} className="shrink-0 text-[#F8D77B]" />
              {config.contactEmail}
            </span>
            <a href={`mailto:${config.contactEmail}`} className="w-fit rounded-lg border border-[#D4A24C]/70 px-7 py-2 text-sm font-semibold text-[#F8D77B] transition hover:bg-[#D4A24C] hover:text-white">
              Fale conosco
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-black">
            Siga-nos nas <span className="text-[#F8D77B]">redes sociais</span>
          </h3>
          <SocialLinks facebookUrl={config.facebookUrl} instagramUrl={config.instagramUrl} youtubeChannelUrl={config.youtubeChannelUrl} />
        </div>
      </div>
    </footer>
  );
}
