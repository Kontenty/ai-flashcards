import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";
import { Result } from "@/lib/utils/result";
import type { ReviewCardDto } from "@/types";

/**
 * Command object accepted by {@link createReviewService().processReview}
 */
export interface SubmitReviewCommand {
  flashcardId: string;
  /** Integer 0‒5 indicating recall quality */
  quality: number;
}

/**
 * Factory for the review service. It encapsulates *all* SM-2 review-related
 * database interaction behind an easy to use API.
 *
 * NOTE: All methods return {@link Result} so that the caller can easily
 * differentiate happy-path from error conditions without relying on thrown
 * exceptions.
 */
export function createReviewService(supabase: SupabaseClient<Database>) {
  return {
    /**
     * Returns flashcards that are **due for review today** for the currently
     * authenticated user. A card is considered due when its
     * `next_review_date` is on or before the current date (in the database
     * time-zone).
     */
    async getDueFlashcards(): Promise<Result<ReviewCardDto[], string>> {
      try {
        // Ensure the user is authenticated first
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          return Result.error("User not authenticated");
        }

        // Supabase Postgres comparison – we keep the ISO date string which
        // Postgres can cast to date implicitly
        const todayIso = new Date().toISOString();

        const { data, error } = await supabase
          .from("flashcards")
          .select("id, front, back")
          .eq("user_id", user.id)
          .lte("next_review_date", todayIso);

        if (error) {
          return Result.error(`Failed to fetch due flashcards: ${error.message}`);
        }

        return Result.ok(data as ReviewCardDto[]);
      } catch (err) {
        return Result.error(err instanceof Error ? err.message : "Unknown error occurred");
      }
    },

    /**
     * Calls the Postgres RPC function `process_flashcard_review` which updates
     * SM-2 scheduling parameters and stores the review history.
     */
    async processReview(cmd: SubmitReviewCommand): Promise<Result<null, string>> {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          return Result.error("User not authenticated");
        }

        // The RPC function will take care of permissions via RLS.
        const { error } = await supabase.rpc("process_flashcard_review", {
          p_flashcard_id: cmd.flashcardId,
          p_quality: cmd.quality,
        });

        if (error) {
          // Distinguish between not-found vs internal error when possible
          if (error.code === "22P02" /* invalid_text_representation */) {
            return Result.error("Invalid flashcard ID");
          }
          if (error.code === "PGRST116" /* row not found */ || error.code === "42501") {
            return Result.error("Flashcard not found");
          }
          return Result.error(`Failed to process review: ${error.message}`);
        }

        return Result.ok(null);
      } catch (err) {
        return Result.error(err instanceof Error ? err.message : "Unknown error occurred");
      }
    },
  };
}
