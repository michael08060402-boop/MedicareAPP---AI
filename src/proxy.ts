import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/", "/dashboard", "/login", "/register", "/forgot-password", "/api/auth", "/api/register"];

export const proxy = auth(function proxyHandler(req) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  if (!req.auth?.user) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  const role = req.auth.user.role as string;

  if (pathname.startsWith("/admin") && role !== "ADMIN")
    return NextResponse.redirect(new URL("/login", req.url));
  if (pathname.startsWith("/doctor") && role !== "DOCTOR" && role !== "ADMIN")
    return NextResponse.redirect(new URL("/login", req.url));
  if (pathname.startsWith("/patient") && role !== "PATIENT" && role !== "ADMIN")
    return NextResponse.redirect(new URL("/login", req.url));

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)"],
};
