/** RFC 9457 ProblemDetail + backend `code` extension */
export interface ApiError {
  status: number;
  detail: string;
  code: string; // e.g. "API_001", "RSV_001", "AUTH_001"
}

/** Generic paginated response wrapper */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // current page (0-based)
  first: boolean;
  last: boolean;
}
