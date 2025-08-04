import { z } from "zod";

/**
 * Path parameter schema for the review endpoints.
 * Ensures we always receive a valid UUID in the URL.
 */
export const reviewParamsSchema = z.object({
  id: z.string().uuid(),
});

/**
 * Body payload for submitting a single review result.
 * The recall quality follows the SM-2 algorithm and must be an
 * integer between 0 and 5 (inclusive).
 */
export const submitReviewSchema = z.object({
  quality: z
    .number()
    .int()
    .min(0, { message: "Quality must be between 0 and 5" })
    .max(5, { message: "Quality must be between 0 and 5" }),
});
