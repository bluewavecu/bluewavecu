import { writeFile } from "node:fs/promises";
import path from "node:path";
import {
  hasBlobStorage,
  saveIdDocumentToBlob,
} from "@/lib/idDocumentBlob";
import { getUploadContentType } from "@/lib/mediaServe";
import {
  ensureUploadDirectory,
  getIdDocumentPublicPath,
  getIdDocumentsUploadRoot,
  resolveIdDocumentFilePath,
  shouldPersistIdDocumentsInBlob,
} from "@/lib/uploadStorage";

const MAX_ID_DOCUMENT_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

function validateImageFile(file: File) {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error("Upload JPG, PNG, or WEBP photos only.");
  }

  if (file.size > MAX_ID_DOCUMENT_BYTES) {
    throw new Error("Each ID photo must be 5 MB or smaller.");
  }
}

export async function saveIdDocumentPhoto(params: {
  userId: string;
  submissionId: string;
  side: "front" | "back";
  file: File;
}) {
  validateImageFile(params.file);

  const extension = ALLOWED_MIME_TYPES.get(params.file.type)!;
  const buffer = Buffer.from(await params.file.arrayBuffer());
  const contentType = params.file.type;

  if (shouldPersistIdDocumentsInBlob()) {
    await saveIdDocumentToBlob({
      userId: params.userId,
      submissionId: params.submissionId,
      side: params.side,
      extension,
      buffer,
      contentType,
    });

    return getIdDocumentPublicPath(params.userId, params.submissionId, params.side, extension);
  }

  if (process.env.VERCEL && !hasBlobStorage()) {
    throw new Error(
      "ID uploads are unavailable until BLOB_READ_WRITE_TOKEN is configured for this deployment.",
    );
  }

  const absolutePath = resolveIdDocumentFilePath(
    params.userId,
    params.submissionId,
    params.side,
    extension,
  );

  await ensureUploadDirectory(getIdDocumentsUploadRoot());
  await ensureUploadDirectory(path.dirname(absolutePath));
  await writeFile(absolutePath, buffer);

  return getIdDocumentPublicPath(params.userId, params.submissionId, params.side, extension);
}

export async function readIdDocumentPhoto(params: {
  userId: string;
  submissionId: string;
  side: "front" | "back";
  extension: string;
}) {
  if (shouldPersistIdDocumentsInBlob()) {
    const { getIdDocumentBlobPathname, readIdDocumentFromBlob } = await import(
      "@/lib/idDocumentBlob"
    );
    const pathname = getIdDocumentBlobPathname(
      params.userId,
      params.submissionId,
      params.side,
      params.extension,
    );

    return readIdDocumentFromBlob(pathname);
  }

  const absolutePath = resolveIdDocumentFilePath(
    params.userId,
    params.submissionId,
    params.side,
    params.extension,
  );

  try {
    const { readFile } = await import("node:fs/promises");
    const buffer = await readFile(absolutePath);

    return {
      buffer,
      contentType: getUploadContentType(absolutePath),
    };
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return null;
    }

    throw error;
  }
}
