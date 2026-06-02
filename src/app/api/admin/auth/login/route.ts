import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://wtifljxpoinpbzyugrfc.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const siteSchema = process.env.SUPABASE_SITE_SCHEMA ?? "site";

const accessTokenCookie = "admin_access_token";
const refreshTokenCookie = "admin_refresh_token";
const isProd = process.env.NODE_ENV === "production";

type AuthTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  user?: { email?: string };
};

type AdminUser = {
  id: string;
  email: string;
  role: string;
  ativo: boolean;
};

export async function POST(request: Request) {
  if (!supabaseAnonKey || !serviceRoleKey) {
    return redirectWithError(request.url, "Painel temporariamente indisponível. Tente novamente em instantes.");
  }

  const formData = await request.formData();
  const email = requiredString(formData, "email").toLowerCase();
  const password = requiredString(formData, "password");
  const nextPath = requiredString(formData, "next") || "/admin";

  if (!email || !password) {
    return redirectWithError(request.url, "Informe e-mail e senha.");
  }

  try {
    const authResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!authResponse.ok) {
      return redirectWithError(request.url, "E-mail ou senha inválidos.");
    }

    const authData = (await authResponse.json()) as AuthTokenResponse;
    const accessToken = authData.access_token;
    const refreshToken = authData.refresh_token;

    if (!accessToken || !refreshToken) {
      return redirectWithError(request.url, "Nao foi possivel iniciar a sessao.");
    }

    const adminUser = await fetchAdminUser(email);

    if (!adminUser || !adminUser.ativo) {
      return redirectWithError(request.url, "Usuario nao autorizado para o painel.");
    }

    const safeNext = nextPath.startsWith("/admin") ? nextPath : "/admin";
    const response = NextResponse.redirect(new URL(safeNext, request.url), 303);
    response.cookies.set(accessTokenCookie, accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: authData.expires_in ?? 3600,
    });
    response.cookies.set(refreshTokenCookie, refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  } catch (error) {
    return redirectWithError(request.url, error instanceof Error ? error.message : "Erro ao autenticar.");
  }
}

async function fetchAdminUser(email: string) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/cms_admin_users?select=id,email,role,ativo&email=eq.${encodeURIComponent(email)}&limit=1`,
    {
      headers: {
        apikey: serviceRoleKey ?? "",
        Authorization: `Bearer ${serviceRoleKey ?? ""}`,
        "Accept-Profile": siteSchema,
        "Content-Profile": siteSchema,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Não foi possível validar o acesso ao painel.");
  }

  const data = (await response.json()) as AdminUser[];
  return data[0] ?? null;
}

function requiredString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function redirectWithError(requestUrl: string, message: string) {
  const url = new URL("/admin/login", new URL(requestUrl).origin);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url, 303);
}
