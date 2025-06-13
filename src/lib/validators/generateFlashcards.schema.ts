import { z } from "zod";
import type { GenerateFlashcardsRequestDto } from "@/types";
import { MAX_TEXT_LENGTH, MIN_TEXT_LENGTH } from "@/constants";

export const generateFlashcardsSchema = z.object({
  text: z
    .string()
    .min(MIN_TEXT_LENGTH)
    .max(
      MAX_TEXT_LENGTH,
      `Text must be between ${MIN_TEXT_LENGTH} and ${MAX_TEXT_LENGTH} characters long`,
    ),
}) satisfies z.ZodType<GenerateFlashcardsRequestDto>;

export type GenerateFlashcardsSchema = z.infer<typeof generateFlashcardsSchema>;
