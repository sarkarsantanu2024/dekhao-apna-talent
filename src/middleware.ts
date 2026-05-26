import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const path = nextUrl.pathname;

  const isAdmin  = path.startsWith("/admin");
  const isCenter = path.startsWith("/center");
  const isAuth   = path === "/login" || path === "/register";

  if (!session && (isAdmin || isCenter)) {
    const url = new URL("/login", nextUrl);
    url.searchParams.set("from", path);
    return NextResponse.redirect(url);
  }

  if (session && isAuth) {
    return NextResponse.redirect(new URL(session.user.role === "admin" ? "/admin/dashboard" : "/center/dashboard", nextUrl));
  }

  if (session) {
    if (isAdmin  && session.user.role !== "admin")        return NextResponse.redirect(new URL("/center/dashboard", nextUrl));
    if (isCenter && session.user.role !== "center_owner") return NextResponse.redirect(new URL("/admin/dashboard",  nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/center/:path*", "/login", "/register"],
};
