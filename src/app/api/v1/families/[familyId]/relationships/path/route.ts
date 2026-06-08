import {
  ApiError,
  API_ERROR_CODES,
  errorResponseFromUnknown,
  successResponse,
} from "@/server/api";
import { resolveRelationshipPath } from "@/server/relationship-inference/relationship-resolver";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    familyId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { familyId } = await context.params;
    const url = new URL(request.url);
    const fromMemberId = url.searchParams.get("fromMemberId");
    const toMemberId = url.searchParams.get("toMemberId");

    if (!fromMemberId || !toMemberId) {
      throw new ApiError(
        API_ERROR_CODES.VALIDATION_ERROR,
        "请提供 fromMemberId 和 toMemberId。",
        400,
        {
          fromMemberId: "请提供起点成员 ID。",
          toMemberId: "请提供目标成员 ID。",
        }
      );
    }

    const data = await resolveRelationshipPath({
      familyId,
      fromMemberId,
      toMemberId,
    });

    return successResponse(data, {
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return errorResponseFromUnknown(error);
  }
}
