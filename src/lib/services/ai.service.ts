import type { SuggestionDto } from "@/types";
import { logService } from "./log.service";
import { OpenRouterService } from "./open-router.service";
import type { OpenRouterMessage, ResponseFormat, OpenRouterResponse } from "./open-router.types";

const OPEN_ROUTER_API_KEY = import.meta.env.OPEN_ROUTER_API_KEY;

const openRouter = new OpenRouterService({ apiKey: OPEN_ROUTER_API_KEY });

export class AiServiceError extends Error {
  constructor(
    message: string,
    public readonly code: "TIMEOUT" | "RATE_LIMIT" | "SERVICE_ERROR" = "SERVICE_ERROR",
  ) {
    super(message);
    this.name = "AiServiceError";
  }
}

function isSuggestionsResult(obj: unknown): obj is { suggestions: SuggestionDto[] } {
  return (
    typeof obj === "object" &&
    obj !== null &&
    Array.isArray((obj as { suggestions?: unknown }).suggestions) &&
    (obj as { suggestions: unknown[] }).suggestions.every(
      (s) =>
        typeof s === "object" &&
        s !== null &&
        typeof (s as SuggestionDto).front === "string" &&
        typeof (s as SuggestionDto).back === "string",
    )
  );
}

export class AiService {
  /**
   * Generates flashcard suggestions based on the provided text
   * @param text The input text to generate flashcards from
   * @returns Promise with array of flashcard suggestions
   * @throws AiServiceError if AI service fails to generate suggestions
   */
  async generateFlashcards(text: string): Promise<SuggestionDto[]> {
    if (!OPEN_ROUTER_API_KEY) {
      logService.error("Missing OpenRouter API key");
      throw new AiServiceError("AI service is not configured.");
    }
    if (text.length < 10) {
      throw new AiServiceError("Text too short for meaningful flashcards", "SERVICE_ERROR");
    }
    // JSON schema for the expected response
    const responseFormat: ResponseFormat = {
      type: "json_schema",
      json_schema: {
        name: "GenerateFlashcardsResponse",
        strict: true,
        schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  front: { type: "string" },
                  back: { type: "string" },
                },
                required: ["front", "back"],
                additionalProperties: false,
              },
            },
          },
          required: ["suggestions"],
          additionalProperties: false,
        },
      },
    };
    const messages: OpenRouterMessage[] = [
      {
        role: "system",
        content:
          "You are an expert at creating educational flashcards. Given a text, generate a list of flashcards as JSON with 'front' (question/prompt) and 'back' (answer/explanation). Return only the JSON object as specified by the schema.",
      },
      {
        role: "user",
        content: `Text to generate flashcards from:\n${text}`,
      },
    ];
    try {
      const result: OpenRouterResponse = await openRouter.sendChat(messages, { responseFormat });
      if (isSuggestionsResult(result)) {
        return result.suggestions;
      }
      throw new AiServiceError("AI did not return valid suggestions.");
    } catch (error: unknown) {
      logService.error("AI flashcard generation failed", { error });
      if (error instanceof AiServiceError) throw error;
      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message: unknown }).message === "string"
      ) {
        throw new AiServiceError((error as { message: string }).message, "SERVICE_ERROR");
      }
      throw new AiServiceError(
        "Failed to generate flashcards: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    }
  }
}

export const aiService = new AiService();
