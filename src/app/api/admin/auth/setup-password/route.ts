import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://wtifljxpoinpbzyugrfc.supabase.co";
const supabasePublicKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export async function POST(request: Request) {
  if (!supabasePublicKey) {
    return NextResponse.json(
      { error: "Configuração de autenticação indisponível no momento." },
      { status: 500 },
    );
  }

  const body = (await request.json().catch(() => null)) as
    | {
        accessToken?: string;
        password?: string;
      }
    | null;

  const accessToken = body?.accessToken?.trim();
  const password = body?.password?.trim();

  if (!accessToken || !password) {
    return NextResponse.json({ error: "Informe o token de acesso e a nova senha." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "A nova senha precisa ter pelo menos 8 caracteres." }, { status: 400 });
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    method: "PUT",
    headers: {
      apikey: supabasePublicKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    const message = await response.text();
    return NextResponse.json(
      { error: message || "Não foi possível definir a nova senha." },
      { status: response.status || 500 },
    );
  }

  return NextResponse.json({ success: true });
}
