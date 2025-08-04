import type { APIRoute } from "astro";
import { createStatsService } from "@/lib/services/stats.service";
import { performanceQuerySchema } from "@/lib/validators/stats.schema";

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  const { user, supabase } = locals;

  if (!user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  // 1. Validate query parameters using the shared Zod schema
  const url = new URL(request.url);
  const queryParams = Object.fromEntries(url.searchParams.entries());
  const validation = performanceQuerySchema.safeParse(queryParams);

  if (!validation.success) {
    return new Response(JSON.stringify({ message: "Invalid query parameters" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const includeDaily = validation.data.include.includes("daily_stats");

  // 2. Call the service layer
  const statsService = createStatsService(supabase);

  try {
    const result = await statsService.getPerformanceStats(user.id, { includeDaily });

    if (result.isError) {
      console.error(result.error);
      return new Response(JSON.stringify({ message: "An unexpected error occurred." }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify(result.value), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "An unexpected error occurred." }), {
      status: 500,
    });
  }
};
