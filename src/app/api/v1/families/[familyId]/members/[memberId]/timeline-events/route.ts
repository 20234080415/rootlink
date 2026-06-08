import { errorResponseFromUnknown, parseAndValidateJsonBody, successResponse } from "@/server/api";
import {
  createTimelineEvent,
  validateCreateTimelineEventInput,
} from "@/server/timeline-events/create-timeline-event";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    familyId: string;
    memberId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const { familyId, memberId } = await context.params;
    const input = await parseAndValidateJsonBody(
      request,
      validateCreateTimelineEventInput
    );
    const data = await createTimelineEvent(familyId, memberId, input);

    return successResponse(data, {
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return errorResponseFromUnknown(error);
  }
}
