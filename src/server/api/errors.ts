import {
  API_ERROR_CODES,
  type ApiErrorCode,
  type FieldErrors,
} from "@/server/api/types";

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly fieldErrors: FieldErrors;

  constructor(
    code: ApiErrorCode,
    message: string,
    status = 500,
    fieldErrors: FieldErrors = {}
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function toApiError(error: unknown) {
  if (isApiError(error)) {
    return error;
  }

  return new ApiError(
    API_ERROR_CODES.INTERNAL_SERVER_ERROR,
    "An unexpected error occurred.",
    500
  );
}
