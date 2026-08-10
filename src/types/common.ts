export type Nullable<T> = T | null;

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
}

export interface ApiListResponse<T> {
  data: T[];
  meta?: PaginationMeta;
}
