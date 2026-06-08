import { errorResponseFromUnknown, parseAndValidateJsonBody, successResponse } from "@/server/api";
import { createMember, validateCreateMemberInput } from "@/server/members/create-member";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    familyId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const { familyId } = await context.params;
    const input = await parseAndValidateJsonBody(request, validateCreateMemberInput);
    const data = await createMember(familyId, input);

    return successResponse(data, {
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return errorResponseFromUnknown(error);
  }
}
