"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";

function getHashParams() {
  if (typeof window === "undefined") {
    return new URLSearchParams();
  }

  return new URLSearchParams(window.location.hash.replace(/^#/, ""));
}

export default function AdminSetupPasswordPage() {
  const router = useRouter();
  const hashParams = useMemo(getHashParams, []);
  const accessToken = hashParams.get("access_token") ?? "";
  const isRecovery = hashParams.get("type") === "recovery";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!accessToken || !isRecovery) {
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
      body: JSON.stringify({ accessToken, password }),
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
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8b2f2b]">Primeiro acesso</p>
        <h1 className="mt-3 font-serif text-4xl font-black leading-tight text-[#171006]">Definir senha do painel</h1>
        <p className="mt-4 max-w-xl leading-7 text-[#5a472c]">
          Crie sua senha para concluir o acesso administrativo da COMIEADEPA.
        </p>

        {!accessToken || !isRecovery ? (
          <div className="mt-8 border border-[#8b2f2b]/30 bg-[#fff1ed] px-4 py-3 text-sm font-semibold text-[#8b2f2b]">
            O link de definição de senha está inválido ou expirou. Solicite um novo envio ao administrador.
          </div>
        ) : null}

        {error ? (
          <div className="mt-8 border border-[#8b2f2b]/30 bg-[#fff1ed] px-4 py-3 text-sm font-semibold text-[#8b2f2b]">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
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
              placeholder="Digite sua nova senha"
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
          <button
            type="submit"
            disabled={loading || !accessToken || !isRecovery}
            className="inline-flex w-fit items-center gap-3 bg-[#171006] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Salvando..." : "Definir senha"}
          </button>
        </form>
      </section>
    </div>
  );
}
