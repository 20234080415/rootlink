import { errorResponseFromUnknown, parseAndValidateJsonBody, successResponse } from "@/server/api";
import { upsertBiography, validateUpsertBiographyInput } from "@/server/biographies/upsert-biography";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    familyId: string;
    memberId: string;
  }>;
};

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { familyId, memberId } = await context.params;
    const input = await parseAndValidateJsonBody(request, validateUpsertBiographyInput);
    const data = await upsertBiography(familyId, memberId, input);

    return successResponse(data, {
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return errorResponseFromUnknown(error);
  }
}
