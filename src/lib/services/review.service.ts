import { supabaseClient } from "@/db/supabase.client";
import type { ReviewCardDto } from "@/types";

class ReviewService {
  async getDueCards(userId: string, opts?: { history?: boolean }): Promise<ReviewCardDto[]> {
    const { history } = opts ?? {};
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabaseClient
      .from("flashcards")
      .select("id, front, interval, ease_factor")
      .eq("user_id", userId)
      .lte("next_review_date", today)
      .order("next_review_date", { ascending: true })
      .limit(100);
    if (error) {
      throw error;
    }
    return data as ReviewCardDto[];
  }
}

export const reviewService = new ReviewService();
