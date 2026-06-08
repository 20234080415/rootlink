import { NextResponse } from "next/server";
import { errorResponseFromUnknown } from "@/server/api";
import {
  getAvatarContentType,
  readLocalAvatar,
} from "@/server/avatars/local-avatar-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    fileName: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { fileName } = await context.params;
    const bytes = await readLocalAvatar(fileName);

    return new NextResponse(bytes, {
      headers: {
        "Content-Type": getAvatarContentType(fileName),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return errorResponseFromUnknown(error);
  }
}
