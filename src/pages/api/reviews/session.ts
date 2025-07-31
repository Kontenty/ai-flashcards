import type { APIRoute } from "astro";
import type { ReviewSessionResponseDto } from "@/types";

// Disable prerendering for API routes
export const prerender = false;

// Handler for review session (due cards)
export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const history = url.searchParams.get("history");
  // Stub ignores history parameter
  const stub: ReviewSessionResponseDto = {
    cards: [
      { id: "1", front: "What is the capital of France?", interval: 0, ease_factor: 2.5 },
      { id: "2", front: "Who painted the Mona Lisa?", interval: 3, ease_factor: 2.3 },
      { id: "3", front: "What is the chemical symbol for water?", interval: 7, ease_factor: 2.1 },
    ],
  };
  return new Response(JSON.stringify(stub), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
