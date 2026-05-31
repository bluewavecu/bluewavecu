import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { getPrisma } from "@/lib/prisma";

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

const uploadsRoot = path.join(process.cwd(), "public", "uploads", "profiles");

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

function getPhotoAbsolutePath(userId: string, extension: string) {
  return path.join(uploadsRoot, `${userId}.${extension}`);
}

function getPhotoPublicPath(userId: string, extension: string) {
  return `/uploads/profiles/${userId}.${extension}`;
}

async function removeExistingPhotoFiles(userId: string) {
  await Promise.all(
    ["jpg", "jpeg", "png", "webp", "gif", "bmp", "heic", "heif", "avif", "tiff", "img"].map(
      async (extension) => {
        try {
          await unlink(getPhotoAbsolutePath(userId, extension));
        } catch {
          // Ignore missing files.
        }
      },
    ),
  );
}

export async function saveProfilePhoto(params: { userId: string; file: File }) {
  const extension = getExtensionForFile(params.file);

  if (!extension) {
    throw new Error("Upload an image file.");
  }

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
