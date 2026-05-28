import { NextResponse } from "next/server";

const accessTokenCookie = "admin_access_token";
const refreshTokenCookie = "admin_refresh_token";
const isProd = process.env.NODE_ENV === "production";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/admin/login", request.url), 303);
  response.cookies.set(accessTokenCookie, "", {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(refreshTokenCookie, "", {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
