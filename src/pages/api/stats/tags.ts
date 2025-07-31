import type { APIRoute } from "astro";
import type { TagStatisticDto } from "@/types";

// Disable prerendering for API routes
export const prerender = false;

// Handler for tag stats
export const GET: APIRoute = async () => {
  const stub: TagStatisticDto[] = [];
  return new Response(JSON.stringify(stub), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
