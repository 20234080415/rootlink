import { errorResponseFromUnknown, parseAndValidateJsonBody, successResponse } from "@/server/api";
import { readMemberDetail } from "@/server/members/read-member";
import { updateMember, validateUpdateMemberInput } from "@/server/members/update-member";

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
    const data = await readMemberDetail(familyId, memberId);

    return successResponse(data, {
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return errorResponseFromUnknown(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { familyId, memberId } = await context.params;
    const input = await parseAndValidateJsonBody(
      request,
      (body) => validateUpdateMemberInput(body, null, null)
    );
    const data = await updateMember(familyId, memberId, input);

    return successResponse(data, {
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return errorResponseFromUnknown(error);
  }
}
