import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { ApiError, API_ERROR_CODES } from "@/server/api";

export const LOCAL_AVATAR_DIR = "D:\\rootlink头像文件夹";

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

const ALLOWED_AVATAR_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const AVATAR_CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export function getAvatarPublicUrl(fileName: string) {
  return `/api/v1/avatar-files/${encodeURIComponent(fileName)}`;
}

export function getAvatarContentType(fileName: string) {
  const extension = path.extname(fileName).slice(1).toLowerCase();
  return AVATAR_CONTENT_TYPES[extension] ?? "application/octet-stream";
}

export function assertSafeAvatarFileName(fileName: string) {
  const baseName = path.basename(fileName);

  if (
    baseName !== fileName ||
    !/^[a-f0-9-]+_[a-f0-9-]+_\d+\.(jpg|png|webp|gif)$/i.test(fileName)
  ) {
    throw new ApiError(
      API_ERROR_CODES.VALIDATION_ERROR,
      "头像文件名无效。",
      400,
      {
        fileName: "头像文件名无效。",
      }
    );
  }
}

export async function readLocalAvatar(fileName: string) {
  assertSafeAvatarFileName(fileName);

  try {
    return await readFile(path.join(LOCAL_AVATAR_DIR, fileName));
  } catch {
    throw new ApiError(API_ERROR_CODES.NOT_FOUND, "头像文件不存在。", 404, {
      fileName: "头像文件不存在。",
    });
  }
}

export async function saveLocalAvatar(input: {
  familyId: string;
  memberId: string;
  file: File;
}) {
  const contentType = input.file.type;
  const extension = ALLOWED_AVATAR_TYPES[contentType];

  if (!extension) {
    throw new ApiError(
      API_ERROR_CODES.VALIDATION_ERROR,
      "仅支持 JPG、PNG、WebP 或 GIF 头像图片。",
      400,
      {
        avatar: "仅支持 JPG、PNG、WebP 或 GIF 图片。",
      }
    );
  }

  if (input.file.size <= 0) {
    throw new ApiError(API_ERROR_CODES.VALIDATION_ERROR, "头像文件不能为空。", 400, {
      avatar: "头像文件不能为空。",
    });
  }

  if (input.file.size > MAX_AVATAR_SIZE_BYTES) {
    throw new ApiError(
      API_ERROR_CODES.VALIDATION_ERROR,
      "头像文件不能超过 5MB。",
      400,
      {
        avatar: "头像文件不能超过 5MB。",
      }
    );
  }

  await mkdir(LOCAL_AVATAR_DIR, { recursive: true });

  const fileName = `${input.familyId}_${input.memberId}_${Date.now()}.${extension}`;
  const bytes = Buffer.from(await input.file.arrayBuffer());

  await writeFile(path.join(LOCAL_AVATAR_DIR, fileName), bytes);

  return {
    fileName,
    avatarUrl: getAvatarPublicUrl(fileName),
  };
}
