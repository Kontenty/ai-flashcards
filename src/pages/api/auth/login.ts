export const prerender = false;

import type { APIRoute } from "astro";
import { z } from "zod";
import { rateLimit, RateLimitError } from "@/middleware/rateLimit";

const schema = z.object({
  email: z.string().email("Nieprawidłowy email"),
  password: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków"),
});

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  try {
    rateLimit(request.headers.get("x-forwarded-for") ?? "", 5, 60 * 1000);
  } catch (error) {
    if (error instanceof RateLimitError) {
      return new Response(JSON.stringify({ error: "Za dużo prób, spróbuj ponownie później" }), {
        status: 429,
      });
    }
    throw error;
  }

  const body = await request.json();
  console.log("🚀 ~ constPOST:APIRoute= ~ body:", body);
  const result = schema.safeParse(body);
  console.log("🚀 ~ constPOST:APIRoute= ~ result:", result);
  if (!result.success) {
    const firstError = result.error.errors[0];
    return new Response(JSON.stringify({ error: firstError.message }), { status: 400 });
  }

  const { email, password } = result.data;
  const supabase = locals.supabase;
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }

  // Perform server-side redirect on successful login
  return redirect("/dashboard", 302);
};
