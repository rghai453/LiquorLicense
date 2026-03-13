import { z } from "zod";

export const searchParamsSchema = z.object({
  q: z.string().optional(),
  type: z.string().optional(),
  city: z.string().optional(),
  county: z.string().optional(),
  zip: z.string().optional(),
  status: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type SearchParamsInput = z.input<typeof searchParamsSchema>;
export type SearchParamsOutput = z.output<typeof searchParamsSchema>;
