import { ApiError } from "@/server/api/errors";
import { API_ERROR_CODES } from "@/server/api/types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function assertUuid(value: string, fieldName: string) {
  if (!UUID_PATTERN.test(value)) {
    throw new ApiError(
      API_ERROR_CODES.VALIDATION_ERROR,
      `${fieldName} must be a valid UUID.`,
      400,
      {
        [fieldName]: "Expected a UUID.",
      }
    );
  }
}
