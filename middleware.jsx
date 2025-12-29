import { NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session }
  } = await supabase.auth.getSession();

  const isLoginPage = req.nextUrl.pathname.startsWith("/login");

  if (!session && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (session && isLoginPage) {
    return NextResponse.redirect(new URL("/display", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/display/:path*", "/playlist/:path*", "/content/:path*", "/settings/:path*", "/login"]
};
