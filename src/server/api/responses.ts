import { NextResponse } from "next/server";
import { toApiError } from "@/server/api/errors";
import type {
  ApiErrorCode,
  ApiErrorEnvelope,
  ApiSuccessEnvelope,
  FieldErrors,
} from "@/server/api/types";

export function successResponse<TData, TMeta = Record<string, never>>(
  data: TData,
  meta = {} as TMeta,
  init?: ResponseInit
) {
  return NextResponse.json<ApiSuccessEnvelope<TData, TMeta>>(
    {
      data,
      meta,
    },
    init
  );
}

export function errorResponse(
  code: ApiErrorCode,
  message: string,
  status: number,
  fieldErrors: FieldErrors = {}
) {
  return NextResponse.json<ApiErrorEnvelope>(
    {
      error: {
        code,
        message,
        fieldErrors,
      },
    },
    {
      status,
    }
  );
}

export function errorResponseFromUnknown(error: unknown) {
  const apiError = toApiError(error);

  return errorResponse(
    apiError.code,
    apiError.message,
    apiError.status,
    apiError.fieldErrors
  );
}
