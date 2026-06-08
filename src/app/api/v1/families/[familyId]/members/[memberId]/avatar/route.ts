import { errorResponseFromUnknown, successResponse } from "@/server/api";
import { saveLocalAvatar } from "@/server/avatars/local-avatar-storage";
import { prisma } from "@/server/db/prisma";
import { ApiError, API_ERROR_CODES, assertUuid } from "@/server/api";

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
    assertUuid(familyId, "familyId");
    assertUuid(memberId, "memberId");

    const member = await prisma.member.findFirst({
      where: {
        id: memberId,
        familyId,
      },
      select: {
        id: true,
      },
    });

    if (!member) {
      throw new ApiError(
        API_ERROR_CODES.NOT_FOUND,
        "成员在此家族中不存在。",
        404,
        {
          memberId: "未找到此家族中的成员。",
        }
      );
    }

    const formData = await request.formData();
    const avatar = formData.get("avatar");

    if (!(avatar instanceof File)) {
      throw new ApiError(
        API_ERROR_CODES.VALIDATION_ERROR,
        "请上传头像图片。",
        400,
        {
          avatar: "请上传头像图片。",
        }
      );
    }

    const saved = await saveLocalAvatar({
      familyId,
      memberId,
      file: avatar,
    });

    const updated = await prisma.member.update({
      where: {
        id: memberId,
      },
      data: {
        avatarUrl: saved.avatarUrl,
      },
      select: {
        id: true,
        avatarUrl: true,
        updatedAt: true,
      },
    });

    return successResponse(
      {
        member: {
          id: updated.id,
          avatarUrl: updated.avatarUrl,
          updatedAt: updated.updatedAt.toISOString(),
        },
        storage: {
          directory: "D:\\rootlink头像文件夹",
          fileName: saved.fileName,
        },
      },
      {
        generatedAt: new Date().toISOString(),
      }
    );
  } catch (error) {
    return errorResponseFromUnknown(error);
  }
}
