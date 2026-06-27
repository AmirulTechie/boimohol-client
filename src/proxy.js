// proxy.js (root of project, next to src/)
import { NextResponse } from "next/server";

const ROLE_ROUTES = {
  "/dashboard/admin": "admin",
  "/dashboard/librarian": "librarian",
  "/dashboard/user": "user",
};

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  const matchedRoute = Object.keys(ROLE_ROUTES).find((route) =>
    pathname.startsWith(route)
  );

  if (!matchedRoute) return NextResponse.next();

  const requiredRole = ROLE_ROUTES[matchedRoute];

  const sessionRes = await fetch(
    `${request.nextUrl.origin}/api/auth/get-session`,
    {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    }
  );

  const session = await sessionRes.json();

  if (!session?.user) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (session.user.role !== requiredRole) {
    const roleRedirect = {
      admin: "/dashboard/admin",
      librarian: "/dashboard/librarian",
      user: "/dashboard/user",
    };
    return NextResponse.redirect(
      new URL(roleRedirect[session.user.role] || "/", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};