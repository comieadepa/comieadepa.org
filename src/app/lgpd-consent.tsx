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
      className="fixed bottom-4 left-4 right-4 z-[90] max-w-md rounded-xl border border-[#0F3B63]/12 bg-white p-5 text-center text-[#1F2937] shadow-[0_22px_70px_rgba(15,59,99,.18)] sm:bottom-6 sm:left-6 sm:right-auto"
    >
      <p className="text-sm leading-7 text-[#6B7280]">
        A COMIEADEPA utiliza cookies e tecnologias semelhantes para melhorar sua navegação, proteger nossos serviços e compreender o uso do portal institucional. Ao
        continuar, você concorda com nossa{" "}
        <Link href="/privacidade" className="font-bold text-[#0F3B63] underline underline-offset-2">
          Política de Privacidade
        </Link>{" "}
        e nossos{" "}
        <Link href="/termos" className="font-bold text-[#0F3B63] underline underline-offset-2">
          Termos de Uso
        </Link>
        , conforme a LGPD.
      </p>

      <button
        type="button"
        onClick={acceptConsent}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0F3B63] px-5 py-3 text-sm font-black text-white transition hover:bg-[#4A86B8]"
      >
        <Check size={18} />
        Concordo e continuar
      </button>

      <div className="mt-6 inline-flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B8872D]">
        <ShieldCheck size={14} />
        Privacidade e segurança
      </div>
    </section>
  );
}
