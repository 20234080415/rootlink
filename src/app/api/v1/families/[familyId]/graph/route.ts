import { errorResponseFromUnknown, successResponse } from "@/server/api";
import { readFamilyGraph } from "@/server/families/read-family-graph";

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
    const data = await readFamilyGraph(familyId);

    return successResponse(data, {
      counts: {
        nodes: data.nodes.length,
        edges: data.edges.length,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return errorResponseFromUnknown(error);
  }
}
