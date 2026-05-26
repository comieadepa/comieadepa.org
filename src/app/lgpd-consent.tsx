"use client";

import { Check, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const consentStorageKey = "comieadepa-lgpd-consent";

export function LgpdConsent() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) {
      return;
    }

    setVisible(localStorage.getItem(consentStorageKey) !== "accepted");
  }, [pathname]);

  if (!visible || pathname?.startsWith("/admin")) {
    return null;
  }

  function acceptConsent() {
    localStorage.setItem(consentStorageKey, "accepted");
    setVisible(false);
  }

  return (
    <section
      aria-label="Aviso de privacidade e cookies"
      className="fixed bottom-4 left-4 right-4 z-[90] max-w-md border border-[#d8c38b]/55 bg-white p-5 text-center text-[#342411] shadow-[0_22px_70px_rgba(0,0,0,.28)] sm:bottom-6 sm:left-6 sm:right-auto"
    >
      <p className="text-sm leading-7 text-[#5a472c]">
        A COMIEADEPA utiliza cookies e tecnologias semelhantes para melhorar sua navegação, proteger nossos serviços e compreender o uso do portal institucional. Ao
        continuar, você concorda com nossa{" "}
        <Link href="/privacidade" className="font-bold text-[#8b2f2b] underline underline-offset-2">
          Política de Privacidade
        </Link>{" "}
        e nossos{" "}
        <Link href="/termos" className="font-bold text-[#8b2f2b] underline underline-offset-2">
          Termos de Uso
        </Link>
        , conforme a LGPD.
      </p>

      <button
        type="button"
        onClick={acceptConsent}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 bg-[#f4cf6a] px-5 py-3 text-sm font-black text-[#171006] transition hover:bg-[#ffe28a]"
      >
        <Check size={18} />
        Concordo e continuar
      </button>

      <div className="mt-6 inline-flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9a8a6a]">
        <ShieldCheck size={14} />
        Privacidade e segurança
      </div>
    </section>
  );
}
