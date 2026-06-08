import { errorResponseFromUnknown, successResponse } from "@/server/api";
import { inferRelationships } from "@/server/relationship-inference/relationship-resolver";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    familyId: string;
    memberId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { familyId, memberId } = await context.params;
    const data = await inferRelationships(familyId, memberId);

    return successResponse(data, {
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return errorResponseFromUnknown(error);
  }
}
