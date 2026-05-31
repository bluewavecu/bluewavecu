import { writeFile } from "node:fs/promises";
import path from "node:path";
import {
  ensureUploadDirectory,
  getIdDocumentPublicPath,
  getIdDocumentsUploadRoot,
  resolveIdDocumentFilePath,
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
