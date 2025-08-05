import type {
  ReviewCardDto,
  ReviewRequestDto,
  ReviewSessionResponseDto,
  ReviewResponseDto,
} from "@/types";
import { getStringField } from "@/lib/utils";

/**
 * Fetches the review session cards.
 * @param tagIds optional array of tag UUIDs to filter session
 * @throws Error when request fails (status !200 && !204)
 * @returns array of cards or null when 204 No Content
 */
export async function fetchReviewSession(tagIds?: string[]): Promise<ReviewCardDto[] | null> {
  const params = new URLSearchParams();
  if (tagIds?.length) params.set("tags", tagIds.join(","));

  const res = await fetch(`/api/reviews/session?${params.toString()}`);

  // 204 – no cards to review
  if (res.status === 204) return null;

  if (!res.ok) {
    const json = await safeJson(res);
    throw new Error(getStringField(json, "message", res.statusText));
  }
  const data: ReviewSessionResponseDto = await res.json();
  return data.cards;
}

/**
 * Submits quality rating for a flashcard.
 */
export async function submitReview(
  flashcardId: string,
  quality: number,
): Promise<ReviewResponseDto> {
  const payload: ReviewRequestDto = { quality };

  const res = await fetch(`/api/flashcards/${flashcardId}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const json = await safeJson(res);
    throw new Error(getStringField(json, "message", res.statusText));
  }

  return (await res.json()) as ReviewResponseDto;
}

async function safeJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return {};
  }
}
