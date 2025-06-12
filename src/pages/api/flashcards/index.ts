import { z } from "zod";
import type { APIRoute } from "astro";
import { createFlashcardService } from "@/lib/services/flashcard.service";
import { createTagService } from "@/lib/services/tag.service";
import type { CreateFlashcardCommand } from "@/types";

// Disable prerendering for API routes
export const prerender = false;

// Validation schema for the request body
const createFlashcardSchema = z.object({
  front: z.string().min(1).max(200),
  back: z.string().min(1).max(500),
  tagIds: z.array(z.string().uuid()),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // 1. Parse and validate request body
    const body = await request.json();
    const validationResult = createFlashcardSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid request data",
          details: validationResult.error.format(),
        }),
        { status: 400 },
      );
    }

    const flashcardData: CreateFlashcardCommand = validationResult.data;

    // 2. Initialize services
    const flashcardService = createFlashcardService(locals.supabase);
    const tagService = createTagService(locals.supabase);

    // 3. Validate that all tags exist and user has access to them
    const tagValidationResult = await tagService.validateTags(flashcardData.tagIds);
    if (!tagValidationResult.isSuccess) {
      return new Response(
        JSON.stringify({
          error: "Invalid tags",
          details: tagValidationResult.error,
        }),
        { status: 404 },
      );
    }

    // 4. Create the flashcard
    const result = await flashcardService.createFlashcard(flashcardData);

    if (!result.isSuccess) {
      return new Response(
        JSON.stringify({
          error: "Failed to create flashcard",
          details: result.error,
        }),
        { status: 500 },
      );
    }

    // 5. Return success response
    return new Response(JSON.stringify(result.value), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error creating flashcard:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 },
    );
  }
};
