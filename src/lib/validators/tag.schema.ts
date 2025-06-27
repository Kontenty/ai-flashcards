import { z } from "zod";

// Query parameters for searching tags
export const tagQuerySchema = z.object({
  search: z.string().optional(),
});

// Body schema for creating a tag
export const createTagSchema = z.object({
  name: z.string().min(1).max(50),
});

// Body schema for updating a tag (same as create)
export const updateTagSchema = createTagSchema;

// Path parameter schema for tag ID
export const tagIdParamSchema = z.object({
  id: z.string().uuid(),
});
