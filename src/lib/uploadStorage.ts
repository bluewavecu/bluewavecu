import { mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const TMP_UPLOADS_ROOT = path.join(os.tmpdir(), "bluewavecu-uploads");

export function usesEphemeralUploadStorage() {
  return Boolean(process.env.VERCEL);
}

export function getProfilesUploadRoot() {
  return usesEphemeralUploadStorage()
    ? path.join(TMP_UPLOADS_ROOT, "profiles")
    : path.join(process.cwd(), "public", "uploads", "profiles");
}

export function getIdDocumentsUploadRoot() {
  return usesEphemeralUploadStorage()
    ? path.join(TMP_UPLOADS_ROOT, "id-documents")
    : path.join(process.cwd(), "public", "uploads", "id-documents");
}

export async function ensureUploadDirectory(directory: string) {
  await mkdir(directory, { recursive: true });
}

export function getProfilePhotoPublicPath(userId: string, extension: string) {
  const filename = `${userId}.${extension}`;

  if (usesEphemeralUploadStorage()) {
    return `/api/media/profile/${filename}`;
  }

  return `/uploads/profiles/${filename}`;
}

export function getIdDocumentPublicPath(
  userId: string,
  submissionId: string,
  side: "front" | "back",
  extension: string,
) {
  const filename = `${side}.${extension}`;

  if (usesEphemeralUploadStorage()) {
    return `/api/media/id-document/${userId}/${submissionId}/${filename}`;
  }

  return `/uploads/id-documents/${userId}/${submissionId}/${filename}`;
}

export function resolveProfilePhotoFilePath(userId: string, extension: string) {
  return path.join(getProfilesUploadRoot(), `${userId}.${extension}`);
}

export function resolveIdDocumentFilePath(
  userId: string,
  submissionId: string,
  side: "front" | "back",
  extension: string,
) {
  return path.join(getIdDocumentsUploadRoot(), userId, submissionId, `${side}.${extension}`);
}
