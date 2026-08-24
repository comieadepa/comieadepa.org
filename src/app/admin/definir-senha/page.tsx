"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";

export default function AdminSetupPasswordPage() {
  const router = useRouter();
  const [tokenData, setTokenData] = useState<{
    accessToken?: string;
    tokenHash?: string;
    code?: string;
    email?: string;
    ready: boolean;
  }>({ ready: false });

  const [emailInput, setEmailInput] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Procura em hash (#access_token=...&type=recovery)
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const hashAccessToken = hashParams.get("access_token") ?? undefined;

    // 2. Procura em query search (?code=... ou ?token_hash=... ou ?access_token=...)
    const searchParams = new URLSearchParams(window.location.search);
    const searchCode = searchParams.get("code") ?? undefined;
    const searchTokenHash = searchParams.get("token_hash") ?? undefined;
    const searchAccessToken = searchParams.get("access_token") ?? undefined;
    const searchEmail = searchParams.get("email") ?? undefined;

    const accessToken = hashAccessToken || searchAccessToken;
    const code = searchCode;
    const tokenHash = searchTokenHash;
    const email = searchEmail;

    setTokenData({
      accessToken,
      tokenHash,
      code,
      email,
      ready: true,
    });

    if (searchEmail) {
      setEmailInput(searchEmail);
    }
  }, []);

  const hasValidAuthMethod = Boolean(
    tokenData.accessToken || tokenData.tokenHash || tokenData.code || tokenData.email || emailInput.trim(),
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasValidAuthMethod) {
      setError("O link de acesso está inválido ou expirado.");
      return;
    }

    if (password.length < 8) {
      setError("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("A confirmação da senha não confere.");
      return;
    }

    setLoading(true);
    setError("");

    const response = await fetch("/api/admin/auth/setup-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accessToken: tokenData.accessToken,
        tokenHash: tokenData.tokenHash,
        code: tokenData.code,
        email: tokenData.email || emailInput.trim() || undefined,
        password,
      }),
    });

    const data = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setError(data?.error ?? "Não foi possível definir a nova senha.");
      setLoading(false);
      return;
    }

    router.push("/admin/login?success=1&message=Senha%20definida%20com%20sucesso.%20Agora%20fa%C3%A7a%20login%20no%20painel.");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-12">
      <section className="w-full border border-[#d8c38b] bg-white/76 p-8 shadow-[0_20px_60px_rgba(23,16,6,.12)]">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center bg-[#171006] text-[#f4cf6a]">
            <LockKeyhole size={20} />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8b2f2b]">Acesso Seguro</p>
            <h1 className="font-serif text-3xl font-black leading-tight text-[#171006]">Definir senha do painel</h1>
          </div>
        </div>

        <p className="mt-4 max-w-xl text-sm leading-6 text-[#5a472c]">
          Crie ou redefina sua senha para acessar o painel editorial da COMIEADEPA.
        </p>

        {tokenData.ready && !tokenData.accessToken && !tokenData.code && !tokenData.tokenHash && !tokenData.email ? (
          <div className="mt-6 border border-[#d8c38b] bg-[#fffaf0] p-4 text-xs text-[#5a472c]">
            Informe seu e-mail cadastrado e a nova senha para concluir a ativação.
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 border border-[#8b2f2b]/30 bg-[#fff1ed] px-4 py-3 text-sm font-semibold text-[#8b2f2b]">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
          {!tokenData.accessToken && !tokenData.code && !tokenData.tokenHash && !tokenData.email ? (
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Seu E-mail</span>
              <input
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                type="email"
                required
                className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]"
                placeholder="seu.email@comieadepa.org"
              />
            </label>
          ) : null}

          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Nova senha</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              name="password"
              type="password"
              minLength={8}
              required
              className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]"
              placeholder="Mínimo 8 caracteres"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Confirmar senha</span>
            <input
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              name="confirmPassword"
              type="password"
              minLength={8}
              required
              className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]"
              placeholder="Repita a nova senha"
            />
          </label>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 bg-[#8b2f2b] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white shadow-sm transition hover:bg-[#6e2421] disabled:opacity-60"
            >
              {loading ? "Salvando..." : "Salvar nova senha"}
            </button>
            <Link href="/admin/login" className="text-xs font-bold text-[#8b2f2b] hover:underline">
              Voltar ao Login
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
