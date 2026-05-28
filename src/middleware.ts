import { NextRequest, NextResponse } from "next/server";
import { canAccessAdminPath, normalizeAdminRole } from "@/lib/admin-permissions";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://wtifljxpoinpbzyugrfc.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const siteSchema = process.env.SUPABASE_SITE_SCHEMA ?? "site";

const accessTokenCookie = "admin_access_token";
const refreshTokenCookie = "admin_refresh_token";
const isProd = process.env.NODE_ENV === "production";

type AuthUserResponse = {
  email?: string;
};

type AuthTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user?: { email?: string };
};

type AdminUser = {
  email: string;
  role: string;
  ativo: boolean;
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/admin/login") || pathname.startsWith("/api/admin/auth")) {
    return NextResponse.next({
      request: {
        headers: buildRequestHeaders(request, { pathname }),
      },
    });
  }

  if (!supabaseAnonKey || !serviceRoleKey) {
    return configurationMissingResponse();
  }

  const accessToken = request.cookies.get(accessTokenCookie)?.value;
  const refreshToken = request.cookies.get(refreshTokenCookie)?.value;

  const session = await resolveSession(accessToken, refreshToken);

  if (!session) {
    return redirectToLogin(request, "Sessao expirada. Faca login novamente.");
  }

  const adminUser = await fetchAdminUser(session.email);

  if (!adminUser || !adminUser.ativo) {
    return redirectToLogin(request, "Usuario nao autorizado para o painel.");
  }

  const role = normalizeAdminRole(adminUser.role);

  if (!canAccessAdminPath(pathname, role)) {
    return forbiddenResponse();
  }

  const response = NextResponse.next({
    request: {
      headers: buildRequestHeaders(request, { pathname, role, email: session.email }),
    },
  });

  if (session.needsCookieUpdate) {
    response.cookies.set(accessTokenCookie, session.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: session.expiresIn ?? 3600,
    });
    response.cookies.set(refreshTokenCookie, session.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return response;
}

async function resolveSession(accessToken?: string, refreshToken?: string) {
  if (accessToken) {
    const user = await fetchAuthUser(accessToken);
    if (user?.email) {
      return {
        email: user.email,
        accessToken,
        refreshToken: refreshToken ?? "",
        needsCookieUpdate: false,
        expiresIn: undefined,
      };
    }
  }

  if (refreshToken) {
    const refreshed = await refreshAuthSession(refreshToken);
    if (refreshed?.access_token && refreshed?.refresh_token) {
      const refreshedEmail = refreshed.user?.email ?? (await fetchAuthUser(refreshed.access_token))?.email;
      if (!refreshedEmail) {
        return null;
      }
      return {
        email: refreshedEmail,
        accessToken: refreshed.access_token,
        refreshToken: refreshed.refresh_token,
        needsCookieUpdate: true,
        expiresIn: refreshed.expires_in,
      };
    }
  }

  return null;
}

async function fetchAuthUser(accessToken: string) {
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: supabaseAnonKey ?? "",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as AuthUserResponse;
}

async function refreshAuthSession(refreshToken: string) {
  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey ?? "",
      Authorization: `Bearer ${supabaseAnonKey ?? ""}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as AuthTokenResponse;
}

async function fetchAdminUser(email: string) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/cms_admin_users?select=email,role,ativo&email=eq.${encodeURIComponent(email)}&limit=1`,
    {
      headers: {
        apikey: serviceRoleKey ?? "",
        Authorization: `Bearer ${serviceRoleKey ?? ""}`,
        "Accept-Profile": siteSchema,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as AdminUser[];
  return data[0] ?? null;
}

function buildRequestHeaders(
  request: NextRequest,
  payload: { pathname: string; role?: string; email?: string },
) {
  const headers = new Headers(request.headers);
  headers.set("x-admin-path", payload.pathname);

  if (payload.role) {
    headers.set("x-admin-role", payload.role);
  }

  if (payload.email) {
    headers.set("x-admin-email", payload.email);
  }

  return headers;
}

function redirectToLogin(request: NextRequest, message?: string) {
  const url = new URL("/admin/login", request.url);
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  url.searchParams.set("next", nextPath);

  if (message) {
    url.searchParams.set("error", message);
  }

  return NextResponse.redirect(url, 303);
}

function configurationMissingResponse() {
  return new NextResponse("Configuracao do Supabase ausente para autenticar o painel.", { status: 500 });
}

function forbiddenResponse() {
  return new NextResponse("Seu perfil administrativo nao tem permissao para acessar este modulo.", {
    status: 403,
  });
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
