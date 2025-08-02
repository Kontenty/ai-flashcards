import { z } from "zod";
import type { APIRoute } from "astro";
import { logService } from "@/lib/services/log.service";

export const prerender = false;

// Validation schemas
const paramSchema = z.object({ id: z.string().uuid() });
const reviewSchema = z.object({ quality: z.number().int().min(0).max(5) });

export const POST: APIRoute = async ({ request, params, locals }) => {
  try {
    // Parse and validate params
    const parsedParams = paramSchema.safeParse(params);
    if (!parsedParams.success) {
      logService.warn("Invalid flashcard ID format for review", {
        details: parsedParams.error.format(),
      });
      return new Response(JSON.stringify({ error: "Invalid ID format" }), { status: 400 });
    }
    const { id } = parsedParams.data;

    // Parse and validate body
    const body = await request.json();
    const parsedBody = reviewSchema.safeParse(body);
    if (!parsedBody.success) {
      logService.warn("Invalid review request", { details: parsedBody.error.format() });
      return new Response(
        JSON.stringify({ error: "Invalid request data", details: parsedBody.error.format() }),
        { status: 400 },
      );
    }
    const { quality } = parsedBody.data;

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await locals.supabase.auth.getUser();
    if (authError || !user) {
      logService.warn("Unauthorized review attempt", { id });
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // Call the SM-2 processing function
    const { error: rpcError } = await locals.supabase.rpc("process_flashcard_review", {
      p_flashcard_id: id,
      p_quality: quality,
    });
    if (rpcError) {
      if (rpcError.message.includes("Flashcard not found")) {
        logService.warn("Flashcard not found for review", { id });
        return new Response(JSON.stringify({ error: "Flashcard not found" }), { status: 404 });
      }
      logService.error("Failed to process flashcard review", { error: rpcError.message });
      return new Response(
        JSON.stringify({ error: "Failed to process review", details: rpcError.message }),
        { status: 500 },
      );
    }

    // Success
    return new Response(JSON.stringify({ message: "Review processed successfully." }), {
      status: 200,
    });
  } catch (error) {
    logService.error("Internal error processing flashcard review", {
      error: error instanceof Error ? error.message : error,
    });
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 },
    );
  }
};
