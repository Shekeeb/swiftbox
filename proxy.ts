// proxy.ts  ← same as middleware.ts but renamed for Next.js 16
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export default auth(function middleware(req: any) {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;
  const isLoggedIn = !!req.auth;

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/dashboard") && role === "driver") {
    return NextResponse.redirect(new URL("/driver/dashboard", req.url));
  }

  if (pathname.startsWith("/driver") && role === "customer") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/book/:path*",
    "/track/:path*",
    "/chat/:path*",
    "/notifications/:path*",
    "/subscriptions/:path*",
    "/driver/:path*",
    "/admin/:path*",
  ],
};