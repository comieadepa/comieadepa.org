import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://wtifljxpoinpbzyugrfc.supabase.co";
const supabasePublicKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: Request) {
  const authKey = supabasePublicKey || serviceRoleKey;
  if (!authKey) {
    return NextResponse.json(
      { error: "Configuração de autenticação indisponível no momento." },
      { status: 500 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    accessToken?: string;
    tokenHash?: string;
    code?: string;
    password?: string;
    email?: string;
  } | null;

  let accessToken = body?.accessToken?.trim();
  const tokenHash = body?.tokenHash?.trim();
  const code = body?.code?.trim();
  const password = body?.password?.trim();
  const email = body?.email?.trim();

  if (!password || password.length < 8) {
    return NextResponse.json({ error: "A nova senha precisa ter pelo menos 8 caracteres." }, { status: 400 });
  }

  // Se recebemos token_hash de recuperação, verificar com Supabase
  if (!accessToken && tokenHash) {
    try {
      const verifyResponse = await fetch(`${supabaseUrl}/auth/v1/verify`, {
        method: "POST",
        headers: {
          apikey: authKey,
          Authorization: `Bearer ${authKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "recovery",
          token_hash: tokenHash,
        }),
      });

      if (verifyResponse.ok) {
        const sessionData = (await verifyResponse.json().catch(() => null)) as {
          access_token?: string;
        } | null;
        if (sessionData?.access_token) {
          accessToken = sessionData.access_token;
        }
      }
    } catch (err) {
      console.warn("Erro ao verificar token_hash de recuperação:", err);
    }
  }

  // Se recebemos code (PKCE), trocar por token
  if (!accessToken && code) {
    try {
      const codeResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=pkce`, {
        method: "POST",
        headers: {
          apikey: authKey,
          Authorization: `Bearer ${authKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auth_code: code,
        }),
      });

      if (codeResponse.ok) {
        const sessionData = (await codeResponse.json().catch(() => null)) as {
          access_token?: string;
        } | null;
        if (sessionData?.access_token) {
          accessToken = sessionData.access_token;
        }
      }
    } catch (err) {
      console.warn("Erro ao trocar code por access_token:", err);
    }
  }

  // Se temos accessToken do usuário autenticado
  if (accessToken) {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: "PUT",
      headers: {
        apikey: authKey,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    if (response.ok) {
      return NextResponse.json({ success: true });
    }

    const message = await response.text();
    return NextResponse.json(
      { error: message || "Não foi possível definir a nova senha." },
      { status: response.status || 500 },
    );
  }

  // Se temos serviceRoleKey e email, atualizar via Admin API do Supabase
  if (serviceRoleKey && email) {
    try {
      const listUsersResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users?page=1&per_page=100`, {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      });

      if (listUsersResponse.ok) {
        const listData = (await listUsersResponse.json().catch(() => null)) as {
          users?: Array<{ id: string; email?: string }>;
        } | null;
        const user = listData?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
        if (user?.id) {
          const updateResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${user.id}`, {
            method: "PUT",
            headers: {
              apikey: serviceRoleKey,
              Authorization: `Bearer ${serviceRoleKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ password }),
          });

          if (updateResponse.ok) {
            return NextResponse.json({ success: true });
          }
        }
      }
    } catch (err) {
      console.warn("Erro ao atualizar senha via Admin API:", err);
    }
  }

  return NextResponse.json(
    { error: "O link de recuperação está inválido ou expirou. Solicite um novo envio." },
    { status: 400 },
  );
}
