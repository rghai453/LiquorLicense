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

const ALERT_FREQUENCIES = ["daily", "weekly", "monthly"] as const;

export const alertCreateSchema = z.object({
  name: z.string().min(1).max(200),
  query: z.record(z.string(), z.unknown()),
  frequency: z.enum(ALERT_FREQUENCIES),
});

export type AlertCreateInput = z.input<typeof alertCreateSchema>;
