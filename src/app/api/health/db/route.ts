import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/server/db/health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const health = await checkDatabaseHealth();

  return NextResponse.json(health, {
    status: health.ok ? 200 : 503,
  });
}
