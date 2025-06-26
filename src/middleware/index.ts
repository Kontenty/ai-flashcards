import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.client";

const PUBLIC_PATHS = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/reset-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
];

// Paths for auth UI pages where logged-in users should be redirected away
const AUTH_UI_PATHS = ["/auth/login", "/auth/register", "/auth/reset-password"];

export const onRequest = defineMiddleware(
  async ({ request, cookies, url, locals, redirect }, next) => {
    const supabase = createSupabaseServerInstance({
      headers: request.headers,
      cookies,
    });
    locals.supabase = supabase;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // @ts-expect-error assign user data to locals
      locals.user = {
        id: user.id,
        email: user.email,
      };
      // If a logged-in user hits an auth page, redirect to dashboard
      if (AUTH_UI_PATHS.includes(url.pathname)) {
        return redirect("/dashboard");
      }
    } else if (!PUBLIC_PATHS.includes(url.pathname)) {
      return redirect("/auth/login");
    }

    return next();
  },
);
