export const prerender = false;

import type { APIRoute } from "astro";
import { z } from "zod";
import { rateLimit, RateLimitError } from "@/middleware/rateLimit";

const schema = z
  .object({
    email: z.string().email("Nieprawidłowy email"),
    password: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków"),
    confirmPassword: z.string().min(8),
    gdpr: z.literal(true, {
      errorMap: () => ({ message: "Musisz zaakceptować RODO" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła muszą być takie same",
    path: ["confirmPassword"],
  });

export const POST: APIRoute = async ({ request, locals }) => {
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
  const result = schema.safeParse(body);
  if (!result.success) {
    const firstError = result.error.errors[0];
    return new Response(JSON.stringify({ error: firstError.message }), { status: 400 });
  }

  const { email, password } = result.data;
  const supabase = locals.supabase;
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${new URL(request.url).origin}/auth/login`,
    },
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }

  // Send confirmation email message to client
  return new Response(
    JSON.stringify({
      message: "Na podany adres email wysłano wiadomość z linkiem potwierdzającym.",
    }),
    { status: 201 },
  );
};
