import { errorResponseFromUnknown, parseAndValidateJsonBody, successResponse } from "@/server/api";
import {
  createRelationship,
  validateCreateRelationshipInput,
} from "@/server/relationships/create-relationship";

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
    const input = await parseAndValidateJsonBody(
      request,
      validateCreateRelationshipInput
    );
    const data = await createRelationship(familyId, input);

    return successResponse(data, {
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return errorResponseFromUnknown(error);
  }
}
