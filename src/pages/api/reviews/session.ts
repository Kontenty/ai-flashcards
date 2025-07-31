import type { APIRoute } from "astro";
import type { ReviewSessionResponseDto } from "@/types";
import { reviewService } from "@/lib/services/review.service";
import { logService } from "@/lib/services/log.service";

// Disable prerendering for API routes
export const prerender = false;

// Handler for review session (due cards)
export const GET: APIRoute = async ({ request, locals }) => {
  if (!locals.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const userId = locals.user.id;
  try {
    const url = new URL(request.url);
    const historyParam = url.searchParams.get("history");
    let history: boolean | undefined;
    if (historyParam !== null) {
      if (historyParam === "true") {
        history = true;
      } else if (historyParam === "false") {
        history = false;
      } else {
        return new Response(JSON.stringify({ error: "Invalid history parameter" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    }
    const cards = await reviewService.getDueCards(userId, { history });
    if (cards.length === 0) {
      return new Response(null, { status: 204 });
    }
    const response: ReviewSessionResponseDto = { cards };
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logService.error(error instanceof Error ? error.message : String(error));
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
