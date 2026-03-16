import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              res.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = req.nextUrl;
    const isProtected =
      pathname === "/favorites" ||
      pathname.startsWith("/favorites/") ||
      pathname === "/profile" ||
      pathname === "/dashboard" ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/admin");

    if (pathname.startsWith("/admin")) {
      const ADMIN_EMAIL = "satyamshukla5094@gmail.com";
      if (!user || user.email !== ADMIN_EMAIL) {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
      }
    } else if (isProtected && !user) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  } catch (error) {
    // In case Supabase or env is misconfigured, fail-open to avoid blocking all routes.
    console.warn("Auth middleware error:", error);
  }

  return res;
}

export const config = {
  matcher: ["/favorites/:path*", "/favorites", "/profile", "/dashboard/:path*", "/dashboard", "/admin/:path*"],
};

