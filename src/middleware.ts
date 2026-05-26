import { NextRequest, NextResponse } from "next/server";
import { canAccessAdminPath, normalizeAdminRole } from "@/lib/admin-permissions";

const adminUser = process.env.ADMIN_USERNAME;
const adminPassword = process.env.ADMIN_PASSWORD;
const adminRole = normalizeAdminRole(process.env.ADMIN_ROLE);

export function middleware(request: NextRequest) {
  if (!adminUser || !adminPassword) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Basic ")) {
    return unauthorizedResponse();
  }

  const credentials = decodeBasicAuth(authHeader);

  if (!credentials || credentials.username !== adminUser || credentials.password !== adminPassword) {
    return unauthorizedResponse();
  }

  if (!canAccessAdminPath(request.nextUrl.pathname, adminRole)) {
    return forbiddenResponse();
  }

  return NextResponse.next();
}

function decodeBasicAuth(authHeader: string) {
  try {
    const encoded = authHeader.replace("Basic ", "");
    const decoded = atob(encoded);
    const separatorIndex = decoded.indexOf(":");

    if (separatorIndex === -1) {
      return null;
    }

    return {
      username: decoded.slice(0, separatorIndex),
      password: decoded.slice(separatorIndex + 1),
    };
  } catch {
    return null;
  }
}

function unauthorizedResponse() {
  return new NextResponse("Autenticação necessária para acessar o painel.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="COMIEADEPA Admin"',
    },
  });
}

function forbiddenResponse() {
  return new NextResponse("Seu perfil administrativo nao tem permissao para acessar este modulo.", {
    status: 403,
  });
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
