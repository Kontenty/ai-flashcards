// src/types.ts
// Data Transfer Objects (DTOs) and Command Models for the API

import type { Tables, TablesInsert } from "./db/database.types";

// --------------------
// Authentication
// --------------------

/**
 * Request payload for user registration
 */
export interface RegisterRequestDto {
  email: string;
  password: string;
  rodo_accepted: boolean;
}

/**
 * Authenticated user representation in responses
 */
export interface AuthUserDto {
  id: string;
  email?: string;
}

/**
 * Response payload after successful registration
 */
export interface RegisterResponseDto {
  user: AuthUserDto;
  access_token: string;
}

/**
 * Request payload for user login
 */
export type LoginRequestDto = Pick<RegisterRequestDto, "email" | "password">;

/**
 * Response payload after successful login
 */
export interface LoginResponseDto {
  access_token: string;
  user: Pick<AuthUserDto, "id">;
}

// --------------------
// Flashcards
// --------------------

/**
 * Query parameters for listing flashcards
 */
export type FlashcardListQueryDto = Partial<{
  page: number;
  pageSize: number;
  tags: string[]; // array of tag IDs
  search: string;
}>;

/**
 * Pagination information for list responses
 */
export interface PaginationDto {
  page: number;
  pageSize: number;
  total: number;
}

/**
 * Single flashcard item in list responses
 */
export type FlashcardListItemDto = Pick<
  Tables<"flashcards">,
  "id" | "front" | "back" | "next_review_date"
> & {
  tags: string[]; // list of tag names
};

/**
 * Response payload for listing flashcards
 */
export interface FlashcardListResponseDto {
  items: FlashcardListItemDto[];
  pagination: PaginationDto;
}

/**
 * Command model for creating a flashcard
 */
export type CreateFlashcardCommand = Pick<TablesInsert<"flashcards">, "front" | "back"> & {
  tagIds: TablesInsert<"flashcard_tags">["tag_id"][];
};

/**
 * Command model for updating a flashcard
 */
export type UpdateFlashcardCommand = CreateFlashcardCommand;

/**
 * Detailed flashcard representation for single-item responses
 */
export type FlashcardDetailDto = Omit<
  Tables<"flashcards">,
  "user_id" | "ease_factor" | "interval" | "next_review_date" | "source" | "tsv"
> & {
  tags: string[]; // list of tag names
};

// --------------------
// AI Generation
// --------------------

/**
 * Request payload for generating flashcards via AI
 */
export interface GenerateFlashcardsRequestDto {
  text: string;
}

/**
 * Suggestion returned by AI for a single flashcard
 */
export type SuggestionDto = Pick<FlashcardDetailDto, "front" | "back">;

/**
 * Response payload containing AI-generated suggestions
 */
export interface GenerateFlashcardsResponseDto {
  suggestions: SuggestionDto[];
}

// --------------------
// Tags
// --------------------

/**
 * Representation of a tag in responses
 */
export type TagDto = Pick<Tables<"tags">, "id" | "name">;

/**
 * Query parameters for searching tags
 */
export type TagQueryDto = Partial<
  Pick<TagDto, "name"> & {
    search: string;
  }
>;

/**
 * Command model for creating a tag
 */
export type CreateTagCommand = Pick<TablesInsert<"tags">, "name">;

/**
 * Command model for updating a tag
 */
export type UpdateTagCommand = CreateTagCommand;

// --------------------
// Reviews (SM-2)
// --------------------

/**
 * Single flashcard in a review session
 */
export type ReviewCardDto = Pick<Tables<"flashcards">, "id" | "front" | "interval" | "ease_factor">;

/**
 * Response payload for fetching today's review session
 */
export interface ReviewSessionResponseDto {
  cards: ReviewCardDto[];
}

/**
 * Request payload for submitting a review result
 */
export interface ReviewRequestDto {
  flashcardId: string;
  rating: number;
}

/**
 * Response payload after processing a review result
 */
export interface ReviewResponseDto {
  flashcardId: string;
  nextReviewDate: Tables<"flashcards">["next_review_date"];
  interval: Tables<"flashcards">["interval"];
  easeFactor: Tables<"flashcards">["ease_factor"];
}

// --------------------
// Statistics
// --------------------

/**
 * Tag usage statistic
 */
export interface TagStatisticDto {
  tag: TagDto["name"];
  count: number;
}

/**
 * Overall performance statistics
 */
export interface PerformanceStatsDto {
  totalReviewed: number;
  correctPercent: number;
}
