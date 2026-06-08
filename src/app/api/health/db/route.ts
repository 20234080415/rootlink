import { API_ERROR_CODES, errorResponse, successResponse } from "@/server/api";
import { checkDatabaseHealth } from "@/server/db/health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const health = await checkDatabaseHealth();

  if (!health.ok) {
    return errorResponse(
      API_ERROR_CODES.DATABASE_UNAVAILABLE,
      "Database health check failed.",
      503,
      {
        database: health.error,
      }
    );
  }

  return successResponse(
    {
      ok: true,
    },
    {
      latencyMs: health.latencyMs,
      checkedAt: health.checkedAt,
    }
  );
}
