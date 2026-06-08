import { ApiError } from "@/server/api/errors";
import { API_ERROR_CODES, type FieldErrors } from "@/server/api/types";

type Validator<T> = (value: unknown) => {
  data?: T;
  fieldErrors?: FieldErrors;
};

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function parseJsonBody(request: Request) {
  try {
    const body = await request.json();

    if (!isJsonObject(body)) {
      throw new ApiError(
        API_ERROR_CODES.VALIDATION_ERROR,
        "Request payload must be a JSON object.",
        400,
        {
          body: "Expected a JSON object.",
        }
      );
    }

    return body;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      API_ERROR_CODES.BAD_REQUEST,
      "Request body must be valid JSON.",
      400,
      {
        body: "Invalid JSON.",
      }
    );
  }
}

export async function parseAndValidateJsonBody<T>(
  request: Request,
  validator: Validator<T>
) {
  const body = await parseJsonBody(request);
  const result = validator(body);

  if (!result.data) {
    throw new ApiError(
      API_ERROR_CODES.VALIDATION_ERROR,
      "Request payload is invalid.",
      400,
      result.fieldErrors ?? {}
    );
  }

  return result.data;
}
