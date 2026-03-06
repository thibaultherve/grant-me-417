import { z } from 'zod';

/**
 * Creates a paginated response schema wrapping the given item schema.
 *
 * Shape: { data: T[], total, page, limit, totalPages }
 */
export function createPaginatedSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    data: z.array(itemSchema),
    total: z.number().int(),
    page: z.number().int(),
    limit: z.number().int(),
    totalPages: z.number().int(),
  });
}
