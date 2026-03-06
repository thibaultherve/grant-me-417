import { z } from 'zod';
import { createPaginatedSchema } from './common.js';

// --- Response schemas ---

export const changelogSchema = z.object({
  id: z.number().int(),
  changelogDate: z.string(),
  title: z.string(),
  contentMarkdown: z.string(),
  summary: z.unknown().nullable(),
  createdAt: z.string(),
});

export const changelogsResponseSchema = createPaginatedSchema(changelogSchema);

// --- Types ---

export type ChangelogResponse = z.infer<typeof changelogSchema>;
export type ChangelogsResponse = z.infer<typeof changelogsResponseSchema>;
