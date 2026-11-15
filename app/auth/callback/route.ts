import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const code = request.nextUrl.searchParams.get("code");

  if (!url || !key || !code) {
    return NextResponse.redirect(new URL("/login?error=confirmation", request.url));
  }

  let response = NextResponse.redirect(new URL("/dashboard", request.url));

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      }
    }
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    response = NextResponse.redirect(new URL("/login?error=confirmation", request.url));
  }

  return response;
}
