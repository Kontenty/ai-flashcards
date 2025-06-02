import type { SuggestionDto } from "@/types";

export class AiServiceError extends Error {
  constructor(
    message: string,
    public readonly code: "TIMEOUT" | "RATE_LIMIT" | "SERVICE_ERROR" = "SERVICE_ERROR",
  ) {
    super(message);
    this.name = "AiServiceError";
  }
}

export class AiService {
  /**
   * Generates flashcard suggestions based on the provided text
   * @param text The input text to generate flashcards from
   * @returns Promise with array of flashcard suggestions
   * @throws AiServiceError if AI service fails to generate suggestions
   */
  async generateFlashcards(text: string): Promise<SuggestionDto[]> {
    try {
      // TODO: Implement actual AI service integration
      // This is a placeholder implementation that simulates AI processing
      await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate API call

      if (text.length < 10) {
        throw new AiServiceError("Text too short for meaningful flashcards", "SERVICE_ERROR");
      }

      return [
        {
          front: `Question about: ${text.substring(0, 20)}...`,
          back: "Sample answer 1",
        },
        {
          front: "Sample question 2",
          back: "Sample answer 2",
        },
      ];
    } catch (error) {
      if (error instanceof AiServiceError) {
        throw error;
      }
      throw new AiServiceError(
        "Failed to generate flashcards: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    }
  }
}

export const aiService = new AiService();
