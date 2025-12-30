import { NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const url = req.nextUrl.pathname;

  // Rotte pubbliche
  const publicRoutes = ["/login", "/auth/callback"];

  // Se la route è pubblica → ok
  if (publicRoutes.includes(url)) {
    return res;
  }

  // Se NON c’è sessione → redirect al login
  if (!session) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/login";
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next|favicon.ico|api|static|.*\\..*).*)",
  ],
};
