import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role;

    // Admin-only areas: full admin dashboard
    if (pathname.startsWith("/admin")) {
      // Managers can access product/order management, but not user-role management
      if (role === "admin") return NextResponse.next();
      if (role === "manager" && !pathname.startsWith("/admin/users")) {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Logged-in user areas
    if (pathname.startsWith("/dashboard")) {
      return NextResponse.next();
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/checkout"],
};
