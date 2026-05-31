import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { getPrisma } from "@/lib/prisma";

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

const uploadsRoot = path.join(process.cwd(), "public", "uploads", "profiles");

function getPhotoAbsolutePath(userId: string, extension: string) {
  return path.join(uploadsRoot, `${userId}.${extension}`);
}

function getPhotoPublicPath(userId: string, extension: string) {
  return `/uploads/profiles/${userId}.${extension}`;
}

async function removeExistingPhotoFiles(userId: string) {
  await Promise.all(
    ["jpg", "jpeg", "png", "webp"].map(async (extension) => {
      try {
        await unlink(getPhotoAbsolutePath(userId, extension));
      } catch {
        // Ignore missing files.
      }
    }),
  );
}

export async function saveProfilePhoto(params: { userId: string; file: File }) {
  if (!ALLOWED_MIME_TYPES.has(params.file.type)) {
    throw new Error("Upload a JPG, PNG, or WEBP photo.");
  }

  if (params.file.size > MAX_PHOTO_BYTES) {
    throw new Error("Photo must be 2 MB or smaller.");
  }

  const extension = ALLOWED_MIME_TYPES.get(params.file.type)!;
  const buffer = Buffer.from(await params.file.arrayBuffer());

  await mkdir(uploadsRoot, { recursive: true });
  await removeExistingPhotoFiles(params.userId);

  const absolutePath = getPhotoAbsolutePath(params.userId, extension);
  await writeFile(absolutePath, buffer);

  const profilePhotoUrl = getPhotoPublicPath(params.userId, extension);

  const profile = await getPrisma().customerProfile.upsert({
    where: { userId: params.userId },
    update: { profilePhotoUrl },
    create: {
      userId: params.userId,
      profilePhotoUrl,
    },
  });

  return profile.profilePhotoUrl;
}

export async function removeProfilePhoto(userId: string) {
  await removeExistingPhotoFiles(userId);

  await getPrisma().customerProfile.updateMany({
    where: { userId },
    data: { profilePhotoUrl: null },
  });
}

export async function getProfilePhotoUrl(userId: string) {
  const profile = await getPrisma().customerProfile.findUnique({
    where: { userId },
    select: { profilePhotoUrl: true },
  });

  return profile?.profilePhotoUrl ?? null;
}
