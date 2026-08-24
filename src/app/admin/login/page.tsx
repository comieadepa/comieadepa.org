import { LockKeyhole } from "lucide-react";
import Link from "next/link";
import { StatusMessage } from "../status-message";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; success?: string; message?: string; next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = params?.next ?? "/admin";

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-12">
      <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="border border-[#d8c38b] bg-white/76 p-8 shadow-[0_20px_60px_rgba(23,16,6,.12)]">
          <StatusMessage success={params?.success} error={params?.error} successMessage={params?.message} />
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8b2f2b]">Acesso restrito</p>
          <h1 className="mt-3 font-serif text-4xl font-black leading-tight">Login do painel editorial</h1>
          <p className="mt-4 max-w-xl leading-7 text-[#5a472c]">
            Use o e-mail cadastrado e sua senha para entrar no painel da COMIEADEPA.
          </p>

          <form action="/api/admin/auth/login" method="post" className="mt-8 grid gap-5">
            <input type="hidden" name="next" value={nextPath} />
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">E-mail</span>
              <input
                name="email"
                type="email"
                required
                className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]"
                placeholder="midia@comieadepa.org"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Senha</span>
              <input
                name="password"
                type="password"
                required
                className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]"
                placeholder="Sua senha"
              />
            </label>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-3 bg-[#8b2f2b] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white shadow-sm transition hover:bg-[#6e2421]"
              >
                Entrar no painel
              </button>
              <Link
                href="/admin/definir-senha"
                className="text-xs font-bold text-[#8b2f2b] underline underline-offset-4 hover:opacity-80"
              >
                Primeiro acesso / Definir senha
              </Link>
            </div>
          </form>
        </section>

        <aside className="border border-[#d8c38b] bg-[#171006] p-8 text-white">
          <div className="grid h-12 w-12 place-items-center bg-[#f4cf6a] text-[#171006]">
            <LockKeyhole size={24} />
          </div>
          <p className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-[#f4cf6a]">Seguranca</p>
          <h2 className="mt-3 font-serif text-3xl font-black leading-tight">Apenas perfis ativos entram.</h2>
          <p className="mt-4 leading-7 text-white/62">
            Acesso restrito a membros autorizados. Se precisar de permissao, fale com a administracao.
          </p>
        </aside>
      </div>
    </div>
  );
}
