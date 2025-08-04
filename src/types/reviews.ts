/*
 * Convenience re-exports / aliases for the review-related DTOs so that code can
 * follow the naming convention used in the implementation plan without
 * introducing a second source of truth. All canonical definitions live in
 * `src/types/types.dto.ts`.
 */

export type {
  ReviewCardDto as ReviewCardDTO,
  ReviewSessionResponseDto as GetReviewSessionResponseDTO,
  ReviewRequestDto as SubmitReviewRequestDTO,
  ReviewResponseDto as SubmitReviewResponseDTO,
} from "./types.dto";
