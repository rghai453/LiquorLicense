import type { InferSelectModel } from "drizzle-orm";
import type {
  licenses,
  violations,
  revenue,
  dataLists,
} from "@/db/schema";

export type License = InferSelectModel<typeof licenses>;
export type Violation = InferSelectModel<typeof violations>;
export type Revenue = InferSelectModel<typeof revenue>;
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
