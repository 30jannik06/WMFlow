import { auth } from "@/auth";
import { NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;

  // Admin routes: auth guard only, no locale routing
  if (pathname.startsWith("/admin")) {
    const isLoginPage = pathname === "/admin/login";
    if (!isLoginPage && !req.auth) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    if (isLoginPage && req.auth) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  // All other public routes: locale routing via next-intl
  return intlMiddleware(req);
});

export const config = {
  matcher: [
    // Skip Next.js internals, static files, API routes
    "/((?!api|_next/static|_next/image|.*\\..*).+)",
    "/",
  ],
};
