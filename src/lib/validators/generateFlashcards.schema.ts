import { z } from "zod";
import type { GenerateFlashcardsRequestDto } from "@/types";

export const generateFlashcardsSchema = z.object({
  text: z.string().min(1).max(5000, "Text must be at most 5000 characters long"),
}) satisfies z.ZodType<GenerateFlashcardsRequestDto>;

export type GenerateFlashcardsSchema = z.infer<typeof generateFlashcardsSchema>;
