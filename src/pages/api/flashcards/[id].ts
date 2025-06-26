import { z } from "zod";
import type { APIRoute } from "astro";
import { createFlashcardService } from "@/lib/services/flashcard.service";
import { createTagService } from "@/lib/services/tag.service";
import { logService } from "@/lib/services/log.service";
import type { CreateFlashcardCommand, FlashcardDetailDto } from "@/types";

// Disable prerendering for API routes
export const prerender = false;

// Validation schemas
const paramSchema = z.object({ id: z.string().uuid() });
const updateFlashcardSchema = z.object({
  front: z.string().min(1).max(200),
  back: z.string().min(1).max(500),
  tagIds: z.array(z.string().uuid()),
});

// GET /api/flashcards/{id}
export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const parsedParams = paramSchema.safeParse(params);
    if (!parsedParams.success) {
      logService.warn("Invalid flashcard ID format", { details: parsedParams.error.format() });
      return new Response(JSON.stringify({ error: "Invalid ID format" }), { status: 400 });
    }
    const { id } = parsedParams.data;
    const flashcardService = createFlashcardService(locals.supabase);
    const result = await flashcardService.getFlashcardById(id);
    if (!result.isSuccess) {
      logService.warn("Flashcard not found or access denied", { id });
      return new Response(JSON.stringify({ error: "Flashcard not found" }), { status: 404 });
    }
    return new Response(JSON.stringify(result.value as FlashcardDetailDto), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logService.error("Internal error fetching flashcard", {
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

// PUT /api/flashcards/{id}
export const PUT: APIRoute = async ({ request, params, locals }) => {
  try {
    const parsedParams = paramSchema.safeParse(params);
    if (!parsedParams.success) {
      logService.warn("Invalid flashcard ID format for update", {
        details: parsedParams.error.format(),
      });
      return new Response(JSON.stringify({ error: "Invalid ID format" }), { status: 400 });
    }
    const { id } = parsedParams.data;
    const body = await request.json();
    const parsedBody = updateFlashcardSchema.safeParse(body);
    if (!parsedBody.success) {
      logService.warn("Invalid update data", { details: parsedBody.error.format() });
      return new Response(
        JSON.stringify({ error: "Invalid request data", details: parsedBody.error.format() }),
        { status: 400 },
      );
    }
    const data = parsedBody.data as CreateFlashcardCommand;
    // Validate tags
    const tagService = createTagService(locals.supabase);
    const tagValidation = await tagService.validateTags(data.tagIds);
    if (!tagValidation.isSuccess) {
      logService.warn("Invalid tags for update", { tagIds: data.tagIds });
      return new Response(JSON.stringify({ error: "Invalid tags", details: tagValidation.error }), {
        status: 404,
      });
    }
    // Perform update
    const flashcardService = createFlashcardService(locals.supabase);
    const result = await flashcardService.updateFlashcard(id, data);
    if (!result.isSuccess) {
      logService.error("Failed to update flashcard", { error: result.error });
      return new Response(
        JSON.stringify({ error: "Failed to update flashcard", details: result.error }),
        { status: 500 },
      );
    }
    return new Response(JSON.stringify(result.value as FlashcardDetailDto), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logService.error("Internal error updating flashcard", {
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

// DELETE /api/flashcards/{id}
export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const parsedParams = paramSchema.safeParse(params);
    if (!parsedParams.success) {
      logService.warn("Invalid flashcard ID format for deletion", {
        details: parsedParams.error.format(),
      });
      return new Response(JSON.stringify({ error: "Invalid ID format" }), { status: 400 });
    }
    const { id } = parsedParams.data;
    const flashcardService = createFlashcardService(locals.supabase);
    const result = await flashcardService.deleteFlashcard(id);
    if (!result.isSuccess) {
      logService.error("Failed to delete flashcard", { error: result.error });
      return new Response(
        JSON.stringify({ error: "Failed to delete flashcard", details: result.error }),
        { status: 500 },
      );
    }
    return new Response(null, { status: 204 });
  } catch (error) {
    logService.error("Internal error deleting flashcard", {
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
