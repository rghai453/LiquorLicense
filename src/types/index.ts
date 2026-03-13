import type { InferSelectModel } from "drizzle-orm";
import type {
  users,
  licenses,
  violations,
  revenue,
  alerts,
  savedSearches,
  dataLists,
} from "@/db/schema";

export type User = InferSelectModel<typeof users>;
export type License = InferSelectModel<typeof licenses>;
export type Violation = InferSelectModel<typeof violations>;
export type Revenue = InferSelectModel<typeof revenue>;
export type Alert = InferSelectModel<typeof alerts>;
export type SavedSearch = InferSelectModel<typeof savedSearches>;
export type DataList = InferSelectModel<typeof dataLists>;

export interface SearchParams {
  q?: string;
  type?: string;
  city?: string;
  county?: string;
  zip?: string;
  status?: string;
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
