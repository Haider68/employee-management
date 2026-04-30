// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token =
    request.cookies.get("accessToken")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

     console.log("token",token);

  const publicRoutes = ["/login", "/register", "/forgot-password"];
  const isPublicRoute = publicRoutes.includes(pathname);

  const isDashboardRoute = pathname.startsWith("/dashboard");

  const adminOnlyRoutes = [
    "/dashboard/employees",
    "/dashboard/projects",
    "/dashboard/analytics",
    "/dashboard/about",
    "/dashboard/contact",
  ];

  const isAdminRoute = adminOnlyRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // 🚫 Not logged in
  if (!token && isDashboardRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 🔁 Already logged in
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (token && isDashboardRoute) {
    try {
      const base64Payload = token.split(".")[1];
      const payload = JSON.parse(
        atob(base64Payload.replace(/-/g, "+").replace(/_/g, "/"))
      );
 

      console.log("payload",payload);
      // 🔥 IMPORTANT: Handle both structures
      const role =
        payload?.role ||
        payload?.user?.role ||
        payload?.data?.role;

      const normalizedRole = role?.toLowerCase();

      console.log("Role from token:", normalizedRole);

      if (isAdminRoute && normalizedRole !== "admin") {
        return NextResponse.redirect(
          new URL("/dashboard/attendance", request.url)
        );
      }

    } catch (error) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
