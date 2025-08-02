// src/types/types.dto.ts
// Data Transfer Objects (DTOs) and Command Models generated from the database
// schema (src/db/database.types.ts) and the REST API contract described in
// .ai/api-plan.md. All DTOs should be treated as **wire-formats** – they map one-to-one
// to the JSON shape exchanged over the network. Where the database uses snake_case
// column names the corresponding DTO keeps the same casing for clarity and to
// minimise the need for runtime mapping.
//
// NOTE: Always derive the structural part of the DTO from the canonical
// database types (Tables / TablesInsert) so that when the schema changes we get
// compile-time feedback.

import type { Tables, TablesInsert } from "@/db/database.types";

/* -------------------------------------------------------------------------- */
/*                                 1. AUTH                                   */
/* -------------------------------------------------------------------------- */

/** Request payload for user registration */
export interface RegisterRequestDto {
  email: string;
  password: string;
  /** GDPR/RODO consent flag – must be explicitly accepted */
  rodo_accepted: boolean;
}

/** Minimal user representation returned from auth endpoints */
export interface AuthUserDto {
  id: string;
  email?: string;
}

/** Response after successful registration */
export interface RegisterResponseDto {
  user: AuthUserDto;
  access_token: string;
}

/** Login payload */
export type LoginRequestDto = Pick<RegisterRequestDto, "email" | "password">;

/** Response after successful login */
export interface LoginResponseDto {
  access_token: string;
  user: Pick<AuthUserDto, "id">;
}

/* -------------------------------------------------------------------------- */
/*                              2. FLASHCARDS                                 */
/* -------------------------------------------------------------------------- */

/** Basic tag representation reused across many DTOs */
export type TagDto = Pick<Tables<"tags">, "id" | "name">;

/** Query parameters accepted by GET /api/flashcards */
export type FlashcardListQueryDto = Partial<{
  page: number;
  pageSize: number;
  /** Array of tag UUIDs – returns cards that have *all* of the tags */
  tags: string[];
  /** Full-text search term */
  search: string;
  /** Sorting parameter in the format 'column:direction', e.g. 'created_at:desc' */
  orderBy: string;
}>;

/** Pagination metadata embedded in list responses */
export interface PaginationDto {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/** Single item inside FlashcardListResponseDto.items */
export type FlashcardListItemDto = Pick<
  Tables<"flashcards">,
  "id" | "front" | "back" | "next_review_date"
> & {
  tags: TagDto[];
};

/** Success payload for GET /api/flashcards */
export interface FlashcardListResponseDto {
  items: FlashcardListItemDto[];
  pagination: PaginationDto;
}

/** Command used by POST /api/flashcards */
export type CreateFlashcardCommand = Pick<TablesInsert<"flashcards">, "front" | "back"> & {
  /** List of tag UUIDs to associate with the card */
  tagIds: TablesInsert<"flashcard_tags">["tag_id"][];
};

/** Command used by PUT /api/flashcards/{id} */
export type UpdateFlashcardCommand = CreateFlashcardCommand;

/** Detailed representation returned by GET /api/flashcards/{id} */
export type FlashcardDetailDto = Pick<
  Tables<"flashcards">,
  "id" | "front" | "back" | "created_at" | "updated_at"
> & {
  tags: TagDto[];
};

/* -------------------------------------------------------------------------- */
/*                          3. AI FLASHCARD GENERATION                        */
/* -------------------------------------------------------------------------- */

/** Request payload for POST /api/flashcards/generate */
export interface GenerateFlashcardsRequestDto {
  /** Source text (≤ 5 000 chars) */
  text: string;
}

/** Single suggestion object returned by the AI */
export type SuggestionDto = Pick<FlashcardDetailDto, "front" | "back">;

/** Success payload for POST /api/flashcards/generate */
export interface GenerateFlashcardsResponseDto {
  suggestions: SuggestionDto[];
}

/* -------------------------------------------------------------------------- */
/*                                   4. TAGS                                  */
/* -------------------------------------------------------------------------- */

/** Query params for GET /api/tags */
export type TagQueryDto = Partial<{ search: string }>;

/** Command payload for POST /api/tags */
export type CreateTagCommand = Pick<TablesInsert<"tags">, "name">;

/** Command payload for PUT /api/tags/{id} */
export type UpdateTagCommand = CreateTagCommand;

/* -------------------------------------------------------------------------- */
/*                               5. REVIEWS (SM-2)                            */
/* -------------------------------------------------------------------------- */

/** Card object inside the review session response */
export type ReviewCardDto = Pick<Tables<"flashcards">, "id" | "front" | "back">;

/** Success payload for GET /api/reviews/session */
export interface ReviewSessionResponseDto {
  cards: ReviewCardDto[];
}

/** Payload for POST /api/flashcards/{id}/review */
export interface ReviewRequestDto {
  /** Integer 0‒5 indicating recall quality */
  quality: number;
}

/** Success payload returned by the review endpoint */
export interface ReviewResponseDto {
  message: string;
}

/* -------------------------------------------------------------------------- */
/*                                6. STATISTICS                               */
/* -------------------------------------------------------------------------- */

/** Row representing a single day in the activity chart */
export interface DailyReviewStatDto {
  reviewDate: string; // ISO YYYY-MM-DD
  cardsReviewed: number;
  meanQuality: number;
}

/** Overall performance stats returned by GET /api/stats/performance */
export interface PerformanceStatsDto {
  totalReviews: number;
  correctPercentage: number;
  /** Present only when the caller asks for the breakdown */
  dailyStats?: DailyReviewStatDto[];
}

/** Aggregated usage count for a single tag */
export interface TagStatisticDto {
  tagId: string;
  tagName: string;
  cardCount: number;
}

/** Success payload for GET /api/stats/tags */
export interface TagStatsResponseDto {
  totalTags?: number;
  byTag?: TagStatisticDto[];
}

/* -------------------------------------------------------------------------- */
/*                                 RE-EXPORTS                                 */
/* -------------------------------------------------------------------------- */

// In most places we import from "@/types" (barrel); the barrel in src/types/index.ts
// re-exports everything from this file, so no additional work is necessary.
