import { prisma } from "@/server/db/prisma";

export type DatabaseHealth =
  | {
      ok: true;
      latencyMs: number;
      checkedAt: string;
    }
  | {
      ok: false;
      latencyMs: number;
      checkedAt: string;
      error: string;
    };

function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown database error";
}

export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  const startedAt = performance.now();
  const checkedAt = new Date().toISOString();

  try {
    await prisma.$queryRaw`SELECT 1`;

    return {
      ok: true,
      latencyMs: Math.round(performance.now() - startedAt),
      checkedAt,
    };
  } catch (error) {
    return {
      ok: false,
      latencyMs: Math.round(performance.now() - startedAt),
      checkedAt,
      error: toErrorMessage(error),
    };
  }
}
