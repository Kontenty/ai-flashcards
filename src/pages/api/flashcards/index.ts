import { z } from "zod";
import type { APIRoute } from "astro";
import { createFlashcardService } from "@/lib/services/flashcard.service";
import { createTagService } from "@/lib/services/tag.service";
import { logService } from "@/lib/services/log.service";
import type { FlashcardListQueryDto, FlashcardListResponseDto } from "@/types";

// Disable prerendering for API routes
export const prerender = false;

// Validation schema for listing flashcards (query params)
const listQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  pageSize: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  tags: z.array(z.string().uuid()).optional(),
  search: z.string().optional(),
});

// Validation schema for a single flashcard
const createFlashcardSchema = z.object({
  front: z.string().min(1).max(200),
  back: z.string().min(1).max(500),
  tagIds: z.array(z.string().uuid()),
});

// Validation schema for the request body (single or bulk)
const requestSchema = z.union([createFlashcardSchema, z.array(createFlashcardSchema)]);

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // 1. Parse and validate request body
    const body = await request.json();
    const validationResult = requestSchema.safeParse(body);

    if (!validationResult.success) {
      logService.warn("Invalid request data for creating flashcard(s)", {
        details: validationResult.error.format(),
      });
      return new Response(
        JSON.stringify({
          error: "Invalid request data",
          details: validationResult.error.format(),
        }),
        { status: 400 },
      );
    }

    const flashcardData = validationResult.data;
    const isBulk = Array.isArray(flashcardData);

    // 2. Initialize services
    const flashcardService = createFlashcardService(locals.supabase);
    const tagService = createTagService(locals.supabase);

    // 3. Validate that all tags exist and user has access to them
    const tagIds = isBulk
      ? [...new Set(flashcardData.flatMap((card) => card.tagIds))]
      : flashcardData.tagIds;

    const tagValidationResult = await tagService.validateTags(tagIds);
    if (!tagValidationResult.isSuccess) {
      logService.warn("Invalid tags for creating flashcard(s)", {
        error: tagValidationResult.error,
      });
      return new Response(
        JSON.stringify({
          error: "Invalid tags",
          details: tagValidationResult.error,
        }),
        { status: 404 },
      );
    }

    // 4. Create the flashcard(s)
    const result = isBulk
      ? await flashcardService.createFlashcards(flashcardData)
      : await flashcardService.createFlashcard(flashcardData);

    if (!result.isSuccess) {
      logService.error("Failed to create flashcard(s)", { error: result.error });
      return new Response(
        JSON.stringify({
          error: "Failed to create flashcard(s)",
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
    logService.error("Error creating flashcard(s)", {
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

// Handler for listing flashcards
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // Validate and parse query parameters
    const url = new URL(request.url);
    const rawQuery = {
      page: url.searchParams.get("page") ?? undefined,
      pageSize: url.searchParams.get("pageSize") ?? undefined,
      tags: url.searchParams.getAll("tags") || undefined,
      search: url.searchParams.get("search") ?? undefined,
    };
    const parsed = listQuerySchema.safeParse(rawQuery);
    if (!parsed.success) {
      logService.warn("Invalid query parameters for listing flashcards", {
        details: parsed.error.format(),
      });
      return new Response(
        JSON.stringify({ error: "Invalid query parameters", details: parsed.error.format() }),
        { status: 400 },
      );
    }
    const query: FlashcardListQueryDto = parsed.data;
    // List flashcards
    const flashcardService = createFlashcardService(locals.supabase);
    const result = await flashcardService.listFlashcards(query);
    if (!result.isSuccess) {
      logService.error("Failed to list flashcards", { error: result.error });
      return new Response(
        JSON.stringify({ error: "Failed to list flashcards", details: result.error }),
        { status: 500 },
      );
    }
    return new Response(JSON.stringify(result.value as FlashcardListResponseDto), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logService.error("Internal error listing flashcards", {
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
