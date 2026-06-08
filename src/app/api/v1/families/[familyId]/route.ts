import { errorResponseFromUnknown, successResponse } from "@/server/api";
import { readFamilyDashboardSummary } from "@/server/families/read-family";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    familyId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { familyId } = await context.params;
    const data = await readFamilyDashboardSummary(familyId);

    return successResponse(data, {
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return errorResponseFromUnknown(error);
  }
}
