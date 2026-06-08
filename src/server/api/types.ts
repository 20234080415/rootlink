export const API_ERROR_CODES = {
  BAD_REQUEST: "BAD_REQUEST",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  METHOD_NOT_ALLOWED: "METHOD_NOT_ALLOWED",
  CONFLICT: "CONFLICT",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  DATABASE_UNAVAILABLE: "DATABASE_UNAVAILABLE",
  RELATIONSHIP_DUPLICATE: "RELATIONSHIP_DUPLICATE",
  RELATIONSHIP_SELF_LOOP: "RELATIONSHIP_SELF_LOOP",
} as const;

export type ApiErrorCode =
  (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

export type FieldErrors = Record<string, string>;

export type ApiSuccessEnvelope<TData, TMeta = Record<string, never>> = {
  data: TData;
  meta: TMeta;
};

export type ApiErrorEnvelope = {
  error: {
    code: ApiErrorCode;
    message: string;
    fieldErrors: FieldErrors;
  };
};
