import type { APIRoute } from "astro";
import { generateFlashcardsSchema } from "../../../lib/validators/generateFlashcards.schema";
import { aiService, AiServiceError } from "@/lib/services/ai.service";
import { rateLimit, RateLimitError } from "@/middleware/rateLimit";
import { cacheService } from "@/lib/services/cache.service";
import { logService } from "@/lib/services/log.service";
import { sanitizeService } from "@/lib/services/sanitize.service";
import type { GenerateFlashcardsResponseDto } from "@/types";
import { createHash } from "crypto";

export const prerender = false;

// Security headers
const securityHeaders = {
  "Content-Security-Policy": "default-src 'self'",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
};

// Cache TTL - 1 hour
const CACHE_TTL_MS = 60 * 60 * 1000;

export const POST: APIRoute = async ({ request }) => {
  const startTime = Date.now();
  const requestId = createHash("md5").update(`${Date.now()}-${Math.random()}`).digest("hex");

  try {
    logService.info("Processing flashcard generation request", { requestId });

    // Parse and validate request body
    const body = await request.json();
    const validationResult = generateFlashcardsSchema.safeParse(body);

    if (!validationResult.success) {
      logService.warn("Invalid request body", {
        requestId,
        errors: validationResult.error.format(),
      });
      return new Response(
        JSON.stringify({ error: "Invalid request body", details: validationResult.error.format() }),
        {
          status: 400,
          headers: securityHeaders,
        },
      );
    }

    // Sanitize and validate input text
    const sanitizedText = sanitizeService.sanitizeText(validationResult.data.text);
    if (!sanitizeService.isTextSafe(sanitizedText)) {
      logService.warn("Unsafe input detected", { requestId });
      return new Response(JSON.stringify({ error: "Input contains potentially harmful content" }), {
        status: 400,
        headers: securityHeaders,
      });
    }

    // Verify authentication
    /* const {
      data: { user },
      error: authError,
    } = await locals.supabase.auth.getUser();
    if (authError || !user) {
      logService.warn("Unauthorized request", { requestId });
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: securityHeaders,
      });
    } */
    // TODO: Remove this once authentication is implemented
    const user = {
      id: import.meta.env.USER_ID,
    };

    // Apply rate limiting
    try {
      rateLimit(user.id, 10, 60 * 1000); // 10 requests per minute
    } catch (error) {
      if (error instanceof RateLimitError) {
        logService.warn("Rate limit exceeded", { requestId, userId: user.id });
        return new Response(
          JSON.stringify({
            error: "Rate limit exceeded",
            resetTime: error.resetTime,
          }),
          {
            status: 429,
            headers: {
              ...securityHeaders,
              "Retry-After": Math.ceil((error.resetTime - Date.now()) / 1000).toString(),
            },
          },
        );
      }
      throw error;
    }

    // Check cache
    const cacheKey = `flashcards:${user.id}:${createHash("md5")
      .update(sanitizedText)
      .digest("hex")}`;
    const cachedResult = cacheService.get<GenerateFlashcardsResponseDto>(cacheKey);

    if (cachedResult) {
      logService.info("Cache hit", { requestId, userId: user.id });
      return new Response(JSON.stringify(cachedResult), {
        status: 200,
        headers: {
          ...securityHeaders,
          "Content-Type": "application/json",
          "X-Cache": "HIT",
        },
      });
    }

    // Generate flashcards
    const suggestions = await aiService.generateFlashcards(sanitizedText);

    // Cache the result
    const response: GenerateFlashcardsResponseDto = { suggestions };
    cacheService.set(cacheKey, response, CACHE_TTL_MS);

    const duration = Date.now() - startTime;
    logService.info("Successfully generated flashcards", {
      requestId,
      userId: user.id,
      duration,
      suggestionCount: suggestions.length,
    });

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: {
        ...securityHeaders,
        "Content-Type": "application/json",
        "X-Cache": "MISS",
        "X-Response-Time": `${duration}ms`,
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logService.error("Error generating flashcards", {
      requestId,
      error: error instanceof Error ? error.message : "Unknown error",
      duration,
    });

    if (error instanceof AiServiceError) {
      return new Response(
        JSON.stringify({
          error: "AI service error",
          message: error.message,
          code: error.code,
        }),
        {
          status: 502,
          headers: securityHeaders,
        },
      );
    }

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: securityHeaders,
      },
    );
  }
};
