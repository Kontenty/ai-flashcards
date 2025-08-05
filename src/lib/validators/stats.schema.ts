import { z } from "zod";

/**
 * Validation schema for query parameters accepted by GET /api/stats/performance
 *
 * Currently the endpoint supports a single optional `include` parameter that
 * allows callers to request additional payload fragments. The parameter accepts
 * a comma-separated list of tokens. Only whitelisted values are allowed – any
 * other value results in a 400 response handled by the route.
 */
export const performanceQuerySchema = z.object({
  include: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(",") : []))
    .refine((list) => list.every((x) => ["daily_stats"].includes(x)), {
      message: "Invalid include value",
    }),
});

export type PerformanceQueryParams = z.infer<typeof performanceQuerySchema>;
