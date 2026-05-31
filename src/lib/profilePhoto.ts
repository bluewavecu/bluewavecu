import { unlink, writeFile } from "node:fs/promises";
import { getPrisma } from "@/lib/prisma";
import {
  ensureUploadDirectory,
  getProfilePhotoPublicPath,
  getProfilesUploadRoot,
  resolveProfilePhotoFilePath,
} from "@/lib/uploadStorage";

const ALLOWED_MIME_TYPES = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/jpg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["image/bmp", "bmp"],
  ["image/heic", "heic"],
  ["image/heif", "heif"],
  ["image/avif", "avif"],
  ["image/tiff", "tiff"],
]);

const KNOWN_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif", "bmp", "heic", "heif", "avif", "tiff", "img"];

function getExtensionForFile(file: File) {
  const mapped = ALLOWED_MIME_TYPES.get(file.type.toLowerCase());
  if (mapped) {
    return mapped;
  }

  if (file.type.startsWith("image/")) {
    const subtype = file.type.split("/")[1]?.split("+")[0]?.replace(/[^a-z0-9]/gi, "") ?? "img";
    return subtype || "img";
  }

  return null;
}

async function removeExistingPhotoFiles(userId: string) {
  await Promise.all(
    KNOWN_EXTENSIONS.map(async (extension) => {
      try {
        await unlink(resolveProfilePhotoFilePath(userId, extension));
      } catch {
        // Ignore missing files.
      }
    }),
  );
}

export async function saveProfilePhoto(params: { userId: string; file: File }) {
  const extension = getExtensionForFile(params.file);

  if (!extension) {
    throw new Error("Upload an image file.");
  }

  const buffer = Buffer.from(await params.file.arrayBuffer());
  const uploadsRoot = getProfilesUploadRoot();

  await ensureUploadDirectory(uploadsRoot);
  await removeExistingPhotoFiles(params.userId);

  const absolutePath = resolveProfilePhotoFilePath(params.userId, extension);
  await writeFile(absolutePath, buffer);

  const profilePhotoUrl = getProfilePhotoPublicPath(params.userId, extension);

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
